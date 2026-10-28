// Reading and rewriting the `combos { }` block of a ZMK keymap file.
//
// ZMK builds its combo table from devicetree into a `static const` array, so
// unlike the keymap itself there is no way to change combos on a running
// keyboard -- the Configurator edits the source file and the firmware gets
// rebuilt. That makes this the one place the app writes to a file a human also
// edits by hand, so the rules are:
//
//   - keep what we do not understand. A combo with properties this app has no
//     UI for keeps them, in the order it had them.
//   - keep node names. They are how a diff stays readable.
//   - touch nothing outside the combos block.
//
// No DOM and no Tauri in here, so tests/keymap-combos.test.mjs can run it
// under node.

"use strict";

/** Properties this app understands. Anything else on a node is carried through. */
const KNOWN_PROPS = ["bindings", "key-positions", "layers", "timeout-ms"];

/** Walks from the `{` at `open` to its matching `}`, returning that index. */
function matchBrace(text, open) {
  let depth = 0;
  for (let i = open; i < text.length; i++) {
    const c = text[i];
    if (c === "{") depth++;
    else if (c === "}") {
      depth--;
      if (depth === 0) return i;
    }
  }
  return -1;
}

/** Strips // and /* *​/ comments, replacing them with spaces so every offset
 * in the stripped copy still lines up with the original. */
function blankComments(text) {
  let out = "";
  let i = 0;
  while (i < text.length) {
    if (text[i] === "/" && text[i + 1] === "/") {
      const end = text.indexOf("\n", i);
      const stop = end < 0 ? text.length : end;
      out += " ".repeat(stop - i);
      i = stop;
    } else if (text[i] === "/" && text[i + 1] === "*") {
      const end = text.indexOf("*/", i + 2);
      const stop = end < 0 ? text.length : end + 2;
      out += text.slice(i, stop).replace(/[^\n]/g, " ");
      i = stop;
    } else {
      out += text[i];
      i++;
    }
  }
  return out;
}

/** Locates the combos block. Returns null when the file has none. */
function findCombosBlock(text) {
  const bare = blankComments(text);
  const m = /(^|\n)([ \t]*)combos\s*\{/.exec(bare);
  if (!m) return null;

  const open = bare.indexOf("{", m.index + m[0].length - 1);
  const close = matchBrace(bare, open);
  if (close < 0) return null;

  // Include the `;` that terminates the node, and the whole first line.
  const semi = bare.indexOf(";", close);
  const lineStart = m.index + (m[1] ? m[1].length : 0);

  return {
    start: lineStart,
    end: (semi < 0 ? close : semi) + 1,
    indent: m[2],
    bodyStart: open + 1,
    bodyEnd: close,
  };
}

function parseIntList(value) {
  return value
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((n) => Number.parseInt(n, 10))
    .filter((n) => Number.isFinite(n));
}

/** Pulls the `name { ... };` children out of a node body. */
function parseChildNodes(body, offset) {
  const bare = blankComments(body);
  const nodes = [];
  const re = /([A-Za-z0-9_][A-Za-z0-9_-]*)\s*\{/g;
  let m;
  while ((m = re.exec(bare)) !== null) {
    const open = m.index + m[0].length - 1;
    const close = matchBrace(bare, open);
    if (close < 0) break;
    nodes.push({
      name: m[1],
      body: body.slice(open + 1, close),
      start: offset + m.index,
    });
    re.lastIndex = close;
  }
  return nodes;
}

/** `prop = <...>;`, `prop = "...";` and bare `prop;`, in source order. */
function parseProps(body) {
  const bare = blankComments(body);
  const props = [];
  const re = /([A-Za-z0-9_][A-Za-z0-9_-]*)\s*(?:=\s*([^;]*))?;/g;
  let m;
  while ((m = re.exec(bare)) !== null) {
    // Skip anything that is really a child node rather than a property.
    if (/\{/.test(m[0])) continue;
    props.push({ name: m[1], value: m[2] === undefined ? null : body.slice(m.index + m[0].indexOf("=") + 1, m.index + m[0].length - 1).trim() });
  }
  return props;
}

const unwrapAngle = (value) => {
  const t = (value ?? "").trim();
  return t.startsWith("<") && t.endsWith(">") ? t.slice(1, -1).trim() : t;
};

/**
 * Reads every combo in a keymap file.
 *
 * @returns {{combos: Array, hasBlock: boolean, compatible: string}}
 */
function parseCombos(text) {
  const block = findCombosBlock(text);
  if (!block) return { combos: [], hasBlock: false, compatible: '"zmk,combos"' };

  const body = text.slice(block.bodyStart, block.bodyEnd);
  const nodes = parseChildNodes(body, block.bodyStart);

  // `compatible` sits on the combos node itself, not on a child.
  let compatible = '"zmk,combos"';
  for (const p of parseProps(nodes.length ? body.slice(0, nodes[0].start - block.bodyStart) : body)) {
    if (p.name === "compatible" && p.value) compatible = p.value;
  }

  const combos = nodes.map((node) => {
    const props = parseProps(node.body);
    const byName = (n) => props.find((p) => p.name === n)?.value ?? null;

    const layers = byName("layers");
    const timeout = byName("timeout-ms");

    return {
      name: node.name,
      keyPositions: parseIntList(unwrapAngle(byName("key-positions") ?? "")),
      bindings: unwrapAngle(byName("bindings") ?? ""),
      // null means "every layer", which is what ZMK does with no `layers`.
      layers: layers === null ? null : parseIntList(unwrapAngle(layers)),
      timeoutMs: timeout === null ? null : Number.parseInt(unwrapAngle(timeout), 10),
      // Everything else, kept so rewriting the block does not quietly drop it.
      extra: props.filter((p) => !KNOWN_PROPS.includes(p.name)),
    };
  });

  return { combos, hasBlock: true, compatible };
}

/** A node name that is a legal devicetree identifier and says what it does. */
function suggestName(combo, taken) {
  const base =
    (combo.bindings || "combo")
      .replace(/^&/, "")
      .replace(/[^A-Za-z0-9]+/g, "_")
      .replace(/^_+|_+$/g, "")
      .toLowerCase()
      .slice(0, 24) || "combo";
  let name = base;
  let n = 2;
  while (taken.has(name)) name = `${base}_${n++}`;
  taken.add(name);
  return name;
}

/** Renders the whole `combos { ... };` node, ready to splice into the file. */
function renderCombosBlock(combos, { indent = "    ", compatible = '"zmk,combos"' } = {}) {
  const pad = indent + "    ";
  const inner = pad + "    ";
  const taken = new Set(combos.map((c) => c.name).filter(Boolean));

  const bodies = combos.map((combo) => {
    const name = combo.name || suggestName(combo, taken);
    const lines = [`${pad}${name} {`];
    lines.push(`${inner}bindings = <${combo.bindings}>;`);
    lines.push(`${inner}key-positions = <${combo.keyPositions.join(" ")}>;`);
    if (combo.layers !== null && combo.layers !== undefined) {
      lines.push(`${inner}layers = <${combo.layers.join(" ")}>;`);
    }
    if (combo.timeoutMs !== null && combo.timeoutMs !== undefined) {
      lines.push(`${inner}timeout-ms = <${combo.timeoutMs}>;`);
    }
    for (const p of combo.extra ?? []) {
      lines.push(p.value === null ? `${inner}${p.name};` : `${inner}${p.name} = ${p.value};`);
    }
    lines.push(`${pad}};`);
    return lines.join("\n");
  });

  const parts = [`${indent}combos {`, `${pad}compatible = ${compatible};`];
  if (bodies.length) {
    // Blank line after `compatible`, matching how the file is written by hand
    // so that adding a combo shows up as a pure addition in the diff.
    parts.push("", bodies.join("\n\n"));
  }
  parts.push(`${indent}};`);
  return parts.join("\n");
}

/**
 * Returns the file with its combos block replaced by @p combos.
 *
 * A file with no combos block gets one immediately after `/ {`. Nothing
 * outside the block is touched.
 */
function writeCombos(text, combos, options = {}) {
  const block = findCombosBlock(text);
  const indent = options.indent ?? block?.indent ?? "    ";
  const compatible = options.compatible ?? '"zmk,combos"';
  const rendered = renderCombosBlock(combos, { indent, compatible });

  if (block) {
    return text.slice(0, block.start) + rendered + text.slice(block.end);
  }

  const root = /(^|\n)\/\s*\{[ \t]*\n/.exec(text);
  if (!root) throw new Error("keymap.keymap has no root node to add combos to");
  const at = root.index + root[0].length;
  return text.slice(0, at) + rendered + "\n\n" + text.slice(at);
}

if (typeof module !== "undefined" && module.exports) {
  module.exports = { parseCombos, writeCombos, renderCombosBlock, findCombosBlock };
}
