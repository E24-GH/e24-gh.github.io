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

/** Locates a `name { ... };` node. Returns null when the file has none. */
function findNamedBlock(text, name) {
  const bare = blankComments(text);
  const m = new RegExp(`(^|\\n)([ \\t]*)${name}\\s*\\{`).exec(bare);
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

/** Locates the combos block. Returns null when the file has none. */
function findCombosBlock(text) {
  return findNamedBlock(text, "combos");
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
      bodyStart: offset + open + 1,
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

// --- Writing a keymap back out of a running keyboard -------------------------
//
// The reverse of the migration the setup guide describes: someone who has been
// editing from the Configurator wants to go back to building from source, and
// needs their layers, combos and macros as devicetree.
//
// The keyboard is not the whole file -- a keymap holds includes, behaviour
// definitions and layer names that never reach it -- so these write into the
// user's existing keymap.keymap rather than generating one. Same rule as the
// combos block above: touch nothing we were not asked to.

/** Splits a `bindings = <...>` value into one string per binding. */
function splitBindings(value) {
  return unwrapAngle(value).split(/(?=&)/).map((s) => s.trim()).filter(Boolean);
}

/** How many bindings sat on each source line, so a rewrite keeps the grid. */
function bindingLineCounts(value) {
  return unwrapAngle(value)
    .split("\n")
    .map((line) => (line.match(/&/g) || []).length)
    .filter((n) => n > 0);
}

/** Lays bindings out over the same line lengths they had, when they still fit. */
function renderBindings(bindings, counts, indent) {
  const total = counts.reduce((a, b) => a + b, 0);
  if (total !== bindings.length) return bindings.join(" ");
  const lines = [];
  let at = 0;
  for (const n of counts) {
    lines.push(bindings.slice(at, at + n).join(" "));
    at += n;
  }
  return `\n${lines.join("\n")}\n${indent}`;
}

/** Finds `bindings = <...>` inside one node body. Offsets are file-absolute. */
function findBindingsProp(node) {
  const bare = blankComments(node.body);
  const m = /bindings\s*=\s*</.exec(bare);
  if (!m) return null;
  const open = m.index + m[0].length - 1;
  const close = bare.indexOf(">", open);
  if (close < 0) return null;
  return {
    start: node.bodyStart + open + 1,
    end: node.bodyStart + close,
    value: node.body.slice(open + 1, close),
  };
}

/**
 * Replaces every layer's bindings with `layers[i]`, in file order.
 *
 * Layer names, the order of the nodes and anything else on them are left
 * alone; only the lists change. Throws when the counts do not line up, rather
 * than writing half a keymap.
 *
 * @param {string} text          the whole keymap file
 * @param {string[][]} layers    one array of binding strings per layer
 */
function writeKeymapLayers(text, layers) {
  const block = findNamedBlock(text, "keymap");
  if (!block) throw new Error("keymap ブロックが見つかりません");

  const body = text.slice(block.bodyStart, block.bodyEnd);
  const nodes = parseChildNodes(body, block.bodyStart);
  if (nodes.length !== layers.length) {
    throw new Error(`レイヤーの数が合いません（ファイル ${nodes.length}、キーボード ${layers.length}）`);
  }

  let out = text;
  // Back to front, so the offsets taken above stay valid as we splice.
  for (let i = nodes.length - 1; i >= 0; i--) {
    const prop = findBindingsProp(nodes[i]);
    if (!prop) continue;
    const existing = splitBindings(prop.value);
    if (existing.length !== layers[i].length) {
      throw new Error(`レイヤー ${i} のキー数が合いません（ファイル ${existing.length}、キーボード ${layers[i].length}）`);
    }
    const indent = block.indent + "            ";
    out = out.slice(0, prop.start)
      + renderBindings(layers[i], bindingLineCounts(prop.value), indent)
      + out.slice(prop.end);
  }
  return out;
}

/** Wire values for a macro step; mirrors MACRO_OP in protocol.js. */
const STEP = { TAP: 0, PRESS: 1, RELEASE: 2, WAIT: 3 };

/**
 * Renders the editable macro slots as ZMK macro nodes.
 *
 * The slots live in the keyboard's own storage, which a source build has no
 * access to, so each one becomes a behaviour of its own. Empty slots are
 * skipped -- a node with no bindings does not build.
 *
 * @param {Array<{steps: Array<{op: number, value: number}>}>} macros
 * @param {{indent?: string, keycode?: (value: number) => string,
 *          tapMs?: number, waitMs?: number}} options
 *        `keycode` turns a HID usage into its devicetree name; the default
 *        prints the number, which compiles but reads badly.
 */
function renderMacrosBlock(macros, options = {}) {
  const indent = options.indent ?? "    ";
  const keycode = options.keycode ?? String;
  const tapMs = options.tapMs ?? 15;
  const waitMs = options.waitMs ?? 15;
  const inner = indent + "    ";

  const lines = [`${indent}macros {`];
  macros.forEach((macro, slot) => {
    const steps = macro?.steps ?? [];
    if (steps.length === 0) return;
    const label = macroLabel(slot);
    lines.push(`${inner}${label}: ${label} {`);
    lines.push(`${inner}    compatible = "zmk,behavior-macro";`);
    lines.push(`${inner}    #binding-cells = <0>;`);
    lines.push(`${inner}    tap-ms = <${tapMs}>;`);
    lines.push(`${inner}    wait-ms = <${waitMs}>;`);
    const parts = steps.map((step) => {
      if (step.op === STEP.WAIT) return `<&macro_wait_time ${step.value}>`;
      if (step.op === STEP.PRESS) return `<&macro_press &kp ${keycode(step.value)}>`;
      if (step.op === STEP.RELEASE) return `<&macro_release &kp ${keycode(step.value)}>`;
      return `<&macro_tap &kp ${keycode(step.value)}>`;
    });
    lines.push(`${inner}    bindings = ${parts.join(`\n${inner}        , `)};`);
    lines.push(`${inner}};`);
  });
  lines.push(`${indent}};`);
  return lines.join("\n");
}

/** The devicetree label a macro slot is written out under. */
function macroLabel(slot) {
  return `zen_macro_${slot}`;
}

/** Replaces the macros block, or adds one when the file has none. */
function writeMacros(text, macros, options = {}) {
  const block = findNamedBlock(text, "macros");
  const indent = options.indent ?? block?.indent ?? "    ";
  const rendered = renderMacrosBlock(macros, { ...options, indent });

  if (block) return text.slice(0, block.start) + rendered + text.slice(block.end);

  const root = /(^|\n)\/\s*\{[ \t]*\n/.exec(text);
  if (!root) throw new Error("macros を足す root ノードがありません");
  const at = root.index + root[0].length;
  return text.slice(0, at) + rendered + "\n\n" + text.slice(at);
}

/**
 * Points a keymap binding at an exported macro node instead of a slot number.
 *
 * On the keyboard a macro key is `&zen_macro 2` -- the behaviour plus a slot.
 * In a source build the slots do not exist, so it becomes `&zen_macro_2`, the
 * node renderMacrosBlock wrote. A key aimed at an empty slot has nothing to
 * point at and becomes `&none`, which is what it already did in practice.
 */
function rewriteMacroBinding(binding, macros) {
  const m = /^&zen_macro\s+(\d+)$/.exec(binding.trim());
  if (!m) return binding;
  const slot = Number(m[1]);
  const steps = macros?.[slot]?.steps ?? [];
  return steps.length === 0 ? "&none" : `&${macroLabel(slot)}`;
}

if (typeof module !== "undefined" && module.exports) {
  module.exports = {
    parseCombos, writeCombos, renderCombosBlock, findCombosBlock, findNamedBlock,
    writeKeymapLayers, renderMacrosBlock, writeMacros, rewriteMacroBinding, macroLabel,
    splitBindings, bindingLineCounts,
  };
}
