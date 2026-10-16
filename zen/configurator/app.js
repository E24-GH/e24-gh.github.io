// ZEN Configurator — rough prototype (haribote)
//
// This is a functional mockup, not the final design. It ships with the
// keyboard's real physical layout (config/info.json) and current keymap
// (config/keymap.keymap) baked in as sample data so the interaction shape
// can be validated before any firmware wiring exists.
//
// "USB接続" currently only opens a Web Serial port — the ZEN firmware does
// not yet speak any config protocol over that port, so reads/writes are
// stubbed and clearly marked as such in the UI.

"use strict";

// Physical layout, transcribed from config/info.json (LAYOUT.layout).
const PHYSICAL_LAYOUT = [
  // row 0
  { row: 0, col: 0, x: 0, y: 0 }, { row: 0, col: 1, x: 1, y: 0 }, { row: 0, col: 2, x: 2, y: 0 },
  { row: 0, col: 3, x: 3, y: 0 }, { row: 0, col: 4, x: 4, y: 0 }, { row: 0, col: 5, x: 5, y: 0 },
  { row: 0, col: 6, x: 9, y: 0 }, { row: 0, col: 7, x: 10, y: 0 }, { row: 0, col: 8, x: 11, y: 0 },
  { row: 0, col: 9, x: 12, y: 0 }, { row: 0, col: 10, x: 13, y: 0 }, { row: 0, col: 11, x: 14, y: 0 },
  // row 1
  { row: 1, col: 0, x: 0, y: 1 }, { row: 1, col: 1, x: 1, y: 1 }, { row: 1, col: 2, x: 2, y: 1 },
  { row: 1, col: 3, x: 3, y: 1 }, { row: 1, col: 4, x: 4, y: 1 }, { row: 1, col: 5, x: 5, y: 1 },
  { row: 1, col: 6, x: 9, y: 1 }, { row: 1, col: 7, x: 10, y: 1 }, { row: 1, col: 8, x: 11, y: 1 },
  { row: 1, col: 9, x: 12, y: 1 }, { row: 1, col: 10, x: 13, y: 1 }, { row: 1, col: 11, x: 14, y: 1 },
  // row 2
  { row: 2, col: 0, x: 0, y: 2 }, { row: 2, col: 1, x: 1, y: 2 }, { row: 2, col: 2, x: 2, y: 2 },
  { row: 2, col: 3, x: 3, y: 2 }, { row: 2, col: 4, x: 4, y: 2 }, { row: 2, col: 5, x: 5, y: 2 },
  { row: 2, col: 6, x: 6, y: 2 }, { row: 2, col: 7, x: 8, y: 2 }, { row: 2, col: 8, x: 9, y: 2 },
  { row: 2, col: 9, x: 10, y: 2 }, { row: 2, col: 10, x: 11, y: 2 }, { row: 2, col: 11, x: 12, y: 2 },
  { row: 2, col: 12, x: 13, y: 2 }, { row: 2, col: 13, x: 14, y: 2 },
  // row 3
  { row: 3, col: 0, x: 0, y: 3 }, { row: 3, col: 1, x: 1, y: 3 }, { row: 3, col: 2, x: 2, y: 3 },
  { row: 3, col: 3, x: 3, y: 3 }, { row: 3, col: 4, x: 4, y: 3 }, { row: 3, col: 5, x: 5, y: 3 },
  { row: 3, col: 6, x: 6, y: 3 }, { row: 3, col: 7, x: 8, y: 3 }, { row: 3, col: 8, x: 11, y: 3 },
  { row: 3, col: 9, x: 12, y: 3 }, { row: 3, col: 10, x: 13, y: 3 }, { row: 3, col: 11, x: 14, y: 3 },
];

// Bindings, transcribed from config/keymap.keymap. Index i corresponds to
// PHYSICAL_LAYOUT[i] (both are laid out row-major in the same order).
const LAYERS = [
  {
    name: "layer_0",
    label: "0: ベース",
    bindings: [
      "&kp TAB", "&kp Q", "&kp W", "&kp E", "&kp R", "&kp T", "&kp Y", "&kp U", "&kp I", "&kp O", "&kp P", "&kp BSPC",
      "&mo 5", "&kp A", "&kp S", "&kp D", "&kp F", "&kp G", "&kp H", "&kp J", "&kp K", "&kp L", "&kp MINUS", "&kp ENTER",
      "&kp LSHFT", "&kp Z", "&kp X", "&kp C", "&kp V", "&kp B", "&kp DOUBLE_QUOTES", "&kp AT", "&kp N", "&kp M", "&kp COMMA", "&kp DOT", "&kp UP_ARROW", "&mt RSHFT QUESTION",
      "&mo 2", "&kp ESCAPE", "&kp LEFT_CONTROL", "&kp LALT", "&kp LEFT_COMMAND", "&mo 2", "&kp SPACE", "&kp SPACE", "&mo 3", "&kp LEFT_ARROW", "&kp DOWN_ARROW", "&kp RIGHT_ARROW",
    ],
  },
  {
    name: "layer_1",
    label: "1: マウス",
    bindings: [
      "&trans", "&trans", "&trans", "&trans", "&trans", "&trans", "&trans", "&mkp LCLK", "&mo 4", "&mkp RCLK", "&trans", "&trans",
      "&trans", "&trans", "&trans", "&trans", "&trans", "&trans", "&kp RG(LEFT_BRACKET)", "&mkp MB1", "&mkp MB3", "&mkp MB2", "&kp RG(RIGHT_BRACKET)", "&trans",
      "&trans", "&trans", "&trans", "&trans", "&trans", "&trans", "&trans", "&trans", "&kp LC(UP_ARROW)", "&trans", "&trans", "&trans", "&trans", "&trans",
      "&trans", "&trans", "&trans", "&trans", "&trans", "&trans", "&trans", "&trans", "&trans", "&trans", "&trans", "&trans",
    ],
  },
  {
    name: "layer_2",
    label: "2: 記号/数字",
    bindings: [
      "&kp ESCAPE", "&kp N1", "&kp N2", "&kp N3", "&kp N4", "&kp N5", "&kp N6", "&kp N7", "&kp N8", "&kp N9", "&kp N0", "&kp DELETE",
      "&trans", "&kp EXCL", "&kp AT", "&kp HASH", "&kp DOLLAR", "&kp PRCNT", "&kp CARET", "&kp AMPERSAND", "&kp ASTRK", "&kp LEFT_PARENTHESIS", "&kp RIGHT_PARENTHESIS", "&trans",
      "&trans", "&trans", "&trans", "&trans", "&trans", "&trans", "&trans", "&trans", "&kp TILDE", "&kp LEFT_BRACE", "&kp RIGHT_BRACE", "&kp LEFT_BRACKET", "&kp RIGHT_BRACKET", "&kp SLASH",
      "&trans", "&trans", "&trans", "&trans", "&trans", "&trans", "&trans", "&trans", "&trans", "&trans", "&trans", "&trans",
    ],
  },
  {
    name: "layer_3",
    label: "3: ファンクション/テンキー",
    bindings: [
      "&trans", "&kp F1", "&kp F2", "&kp F3", "&kp F4", "&kp F5", "&trans", "&kp FSLH", "&kp ASTRK", "&kp KP_NUMBER_7", "&kp KP_NUMBER_8", "&kp KP_NUMBER_9",
      "&trans", "&kp F6", "&kp F7", "&kp F8", "&kp F9", "&kp F10", "&kp HOME", "&trans", "&kp MINUS", "&kp KP_NUMBER_4", "&kp KP_NUMBER_5", "&kp KP_NUMBER_6",
      "&trans", "&kp F11", "&kp F12", "&out OUT_USB", "&out OUT_BLE", "&bt BT_NXT", "&bt BT_CLR_ALL", "&trans", "&kp END", "&trans", "&kp GRAVE", "&kp KP_NUMBER_1", "&kp KP_NUMBER_2", "&kp KP_NUMBER_3",
      "&bt BT_SEL 0", "&bt BT_SEL 1", "&bt BT_SEL 2", "&bt BT_SEL 3", "&bt BT_SEL 4", "&trans", "&trans", "&trans", "&trans", "&kp KP_NUMBER_0", "&kp DOT", "&kp EQUAL",
    ],
  },
  {
    name: "layer_4",
    label: "4: (未使用)",
    bindings: Array(48).fill("&trans"),
  },
  {
    name: "layer_5",
    label: "5: ファンクション",
    bindings: [
      "&kp ESC", "&kp F1", "&kp F2", "&kp F3", "&kp F4", "&kp F5", "&kp F6", "&kp F7", "&kp F8", "&kp F9", "&kp F10", "&kp F12",
      "&trans", "&trans", "&trans", "&trans", "&trans", "&trans", "&trans", "&trans", "&trans", "&trans", "&trans", "&trans",
      "&trans", "&trans", "&trans", "&trans", "&trans", "&trans", "&trans", "&trans", "&trans", "&trans", "&trans", "&trans", "&trans", "&trans",
      "&trans", "&trans", "&trans", "&trans", "&trans", "&trans", "&trans", "&trans", "&trans", "&trans", "&trans", "&trans",
    ],
  },
  {
    name: "layer_6",
    label: "6: (未使用)",
    bindings: Array(48).fill("&trans"),
  },
];

// Curated keycode groups for the picker grid. Not exhaustive (KEYCODE_VALUES
// has 600+ entries with aliases) — just enough common keys that buyers don't
// need to know ZMK's raw dt-bindings names.
const KEY_PICKER_GROUPS = [
  { label: "文字", keys: ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z"] },
  { label: "数字", keys: ["N1", "N2", "N3", "N4", "N5", "N6", "N7", "N8", "N9", "N0"] },
  { label: "記号", keys: ["MINUS", "EQUAL", "LEFT_BRACKET", "RIGHT_BRACKET", "BSLH", "SEMI", "APOS", "GRAVE", "COMMA", "DOT", "FSLH"] },
  { label: "記号(Shift)", keys: ["EXCL", "AT", "HASH", "DLLR", "PRCNT", "CARET", "AMPS", "ASTRK", "LPAR", "RPAR", "UNDER", "PLUS", "TILDE", "PIPE", "LBRC", "RBRC", "COLON", "DQT", "LT", "GT", "QMARK"] },
  { label: "編集", keys: ["TAB", "ENTER", "BSPC", "DELETE", "ESCAPE", "SPACE", "CAPS", "INSERT"] },
  { label: "移動", keys: ["UP", "DOWN", "LEFT", "RIGHT", "HOME", "END", "PAGE_UP", "PAGE_DOWN"] },
  { label: "ファンクション", keys: ["F1", "F2", "F3", "F4", "F5", "F6", "F7", "F8", "F9", "F10", "F11", "F12"] },
  { label: "修飾キー単体", keys: ["LSHFT", "RSHFT", "LCTRL", "RCTRL", "LALT", "RALT", "LGUI", "RGUI"] },
  { label: "テンキー", keys: ["KP_N1", "KP_N2", "KP_N3", "KP_N4", "KP_N5", "KP_N6", "KP_N7", "KP_N8", "KP_N9", "KP_N0", "KP_DOT", "KP_SLASH", "KP_MULTIPLY", "KP_MINUS", "KP_PLUS", "KP_ENTER"] },
  { label: "メディア", keys: ["K_VOL_UP", "K_VOL_DN", "K_MUTE", "K_PLAY_PAUSE", "K_NEXT", "K_PREV"] },
];

// Maps the picker's 4 modifier toggles (each off/left/right) to the LC/RC-
// style wrapper names encodeBinding's parseModifiedKeycode understands.
const MOD_UI = {
  ctrl: { left: "LC", right: "RC", label: "Ctrl" },
  shift: { left: "LS", right: "RS", label: "Shift" },
  alt: { left: "LA", right: "RA", label: "Alt" },
  gui: { left: "LG", right: "RG", label: "Cmd/Win" },
};

// Behavior kinds selectable from the picker's top dropdown, with buyer-
// friendly labels standing in for ZMK's short behavior names.
const BEHAVIOR_KIND_OPTIONS = [
  { kind: "kp", label: "キー入力" },
  { kind: "mt", label: "ホールド/タップ" },
  { kind: "mo", label: "レイヤー(押している間)" },
  { kind: "to", label: "レイヤーへ移動" },
  { kind: "tog", label: "レイヤー切替(トグル)" },
  { kind: "sl", label: "レイヤー(1回だけ)" },
  { kind: "mkp", label: "マウスボタン" },
  { kind: "bt", label: "Bluetooth" },
  { kind: "out", label: "出力先切替" },
  { kind: "trans", label: "透過(下のレイヤーへ)" },
  { kind: "none", label: "なし" },
];

const MOUSE_BTN_OPTIONS = ["LCLK", "RCLK", "MCLK", "MB4", "MB5"];
const BT_CMD_OPTIONS = ["BT_CLR", "BT_NXT", "BT_PRV", "BT_SEL", "BT_CLR_ALL", "BT_DISC"];
const OUT_OPTIONS = ["OUT_TOG", "OUT_USB", "OUT_BLE"];

function defaultModState() {
  return { ctrl: null, shift: null, alt: null, gui: null };
}

function defaultPicker(kind) {
  return {
    kind,
    keyName: "A",
    mods: defaultModState(),
    layer: 1,
    tap: { keyName: "A", mods: defaultModState() },
    hold: { keyName: "LSHFT", mods: defaultModState() },
    btn: "LCLK",
    cmd: "BT_CLR",
    profile: 0,
    val: "OUT_TOG",
    search: "",
    advanced: false,
  };
}

function expandMods(modsByte) {
  return {
    ctrl: modsByte & MOD_BITS.LC ? "left" : modsByte & MOD_BITS.RC ? "right" : null,
    shift: modsByte & MOD_BITS.LS ? "left" : modsByte & MOD_BITS.RS ? "right" : null,
    alt: modsByte & MOD_BITS.LA ? "left" : modsByte & MOD_BITS.RA ? "right" : null,
    gui: modsByte & MOD_BITS.LG ? "left" : modsByte & MOD_BITS.RG ? "right" : null,
  };
}

/** Best-effort parse of "A" / "RG(LEFT_BRACKET)" into {keyName, mods} for the picker. */
function parseKeycodeExprForPicker(token) {
  const parsed = parseModifiedKeycode(token);
  if (!parsed) return null;
  const keyName = KEYCODE_REVERSE.get(parsed.value);
  if (!keyName) return null;
  return { keyName, mods: expandMods(parsed.mods) };
}

/** Best-effort parse of a full binding string into a shape the picker understands. */
function parseBindingForPicker(bindingString) {
  const tokens = bindingString.trim().replace(/^&/, "").split(/\s+/);
  const name = tokens[0];
  const args = tokens.slice(1);

  switch (name) {
    case "trans":
      return { kind: "trans" };
    case "none":
      return { kind: "none" };
    case "kp": {
      if (args.length !== 1) return { kind: "raw" };
      const parsed = parseKeycodeExprForPicker(args[0]);
      return parsed ? { kind: "kp", ...parsed } : { kind: "raw" };
    }
    case "mo":
    case "to":
    case "tog":
    case "sl":
      if (args.length === 1 && /^\d+$/.test(args[0])) return { kind: name, layer: Number(args[0]) };
      return { kind: "raw" };
    case "mt": {
      // ZMK's behavior_hold_tap.c: param1 -> hold_behavior_dev, param2 -> tap_behavior_dev.
      // "&mt LSHFT A" means hold=LSHFT, tap=A, in that argument order.
      if (args.length !== 2) return { kind: "raw" };
      const hold = parseKeycodeExprForPicker(args[0]);
      const tap = parseKeycodeExprForPicker(args[1]);
      return tap && hold ? { kind: "mt", tap, hold } : { kind: "raw" };
    }
    case "mkp":
      return args.length === 1 && args[0] in MOUSE_BTN_VALUES ? { kind: "mkp", btn: args[0] } : { kind: "raw" };
    case "bt":
      if (args[0] === "BT_SEL" && args.length === 2 && /^\d+$/.test(args[1])) {
        return { kind: "bt", cmd: "BT_SEL", profile: Number(args[1]) };
      }
      return args.length === 1 && args[0] in BT_CMD_VALUES ? { kind: "bt", cmd: args[0] } : { kind: "raw" };
    case "out":
      return args.length === 1 && args[0] in OUT_VALUES ? { kind: "out", val: args[0] } : { kind: "raw" };
    default:
      return { kind: "raw" };
  }
}

/** Fill in a full picker shape from a (possibly partial) parseBindingForPicker() result. */
function normalizePickerState(bindingString) {
  const parsed = parseBindingForPicker(bindingString);
  const kind = parsed.kind === "raw" ? "kp" : parsed.kind;
  const picker = defaultPicker(kind);
  picker.advanced = parsed.kind === "raw";

  if (parsed.kind === "kp") {
    picker.keyName = parsed.keyName;
    picker.mods = parsed.mods;
  } else if (["mo", "to", "tog", "sl"].includes(parsed.kind)) {
    picker.layer = parsed.layer;
  } else if (parsed.kind === "mt") {
    picker.tap = parsed.tap;
    picker.hold = parsed.hold;
  } else if (parsed.kind === "mkp") {
    picker.btn = parsed.btn;
  } else if (parsed.kind === "bt") {
    picker.cmd = parsed.cmd;
    if (typeof parsed.profile === "number") picker.profile = parsed.profile;
  } else if (parsed.kind === "out") {
    picker.val = parsed.val;
  }
  return picker;
}

function applyModsToKeyName(keyName, mods) {
  let expr = keyName;
  for (const modKey of ["gui", "alt", "shift", "ctrl"]) {
    const side = mods[modKey];
    if (!side) continue;
    expr = `${MOD_UI[modKey][side]}(${expr})`;
  }
  return expr;
}

/** Inverse of normalizePickerState: build a ZMK binding string from picker state. */
function buildBindingStringFromPicker(picker) {
  switch (picker.kind) {
    case "trans":
      return "&trans";
    case "none":
      return "&none";
    case "kp":
      return `&kp ${applyModsToKeyName(picker.keyName, picker.mods)}`;
    case "mo":
    case "to":
    case "tog":
    case "sl":
      return `&${picker.kind} ${picker.layer}`;
    case "mt":
      // hold first, tap second — see the parseBindingForPicker "mt" case for why.
      return `&mt ${applyModsToKeyName(picker.hold.keyName, picker.hold.mods)} ${applyModsToKeyName(picker.tap.keyName, picker.tap.mods)}`;
    case "mkp":
      return `&mkp ${picker.btn}`;
    case "bt":
      return picker.cmd === "BT_SEL" ? `&bt BT_SEL ${picker.profile}` : `&bt ${picker.cmd}`;
    case "out":
      return `&out ${picker.val}`;
    default:
      return null;
  }
}

const DEVICE_PROFILES = {
  right: {
    title: "右手: トラックボール",
    chip: "PMW3610",
    defaults: { pointerSpeed: 100, scrollSpeed: 100, invertScroll: false, invertX: false, invertY: false },
  },
  left: {
    title: "左手: トラックパッド",
    chip: "IQS7211E",
    defaults: { pointerSpeed: 100, scrollSpeed: 100, invertScroll: false, invertX: false, invertY: false },
  },
};

const state = {
  activeLayer: 0,
  selectedIndex: null,
  keymap: LAYERS.map((layer) => ({ ...layer, bindings: [...layer.bindings] })),
  pointerSettings: {
    right: { ...DEVICE_PROFILES.right.defaults },
    left: { ...DEVICE_PROFILES.left.defaults },
  },
  dirty: false,
  // Real device state, populated once connectSerial() succeeds. Null means
  // "not connected" — the UI falls back to the local sample/mock data above.
  client: null,
  liveKeymap: false,
  livePointer: null,
  liveKeymapDirty: false,
  livePointerDirty: false,
  liveStatus: null,
  statusInterval: null,
  bindingError: "",
  // Display-only: which saved profile was applied most recently. Purely
  // cosmetic (a highlight, not a live "does this still match?" check) —
  // editing anything afterward doesn't clear it, matching how the design
  // handoff's own demo state behaves.
  activeProfileName: null,
  settingsOpen: false,
  connectionMessage: "",
  connectionError: false,
};

// Short glyph substitutions for the keycap label, matching the design
// handoff's "pretty" table (config/keymap.keymap names -> a single glyph
// or short mnemonic that reads well at keycap size).
const PRETTY_NAMES = {
  TAB: "TAB", ENTER: "⏎", BSPC: "⌫", DELETE: "DEL", ESCAPE: "ESC", ESC: "ESC", SPACE: "␣", CAPS: "CAPS",
  UP_ARROW: "↑", DOWN_ARROW: "↓", LEFT_ARROW: "←", RIGHT_ARROW: "→", UP: "↑", DOWN: "↓", LEFT: "←", RIGHT: "→",
  LSHFT: "⇧", RSHFT: "⇧R", LEFT_CONTROL: "CTRL", LCTRL: "CTRL", RCTRL: "CTRL R", LALT: "ALT", RALT: "ALT R",
  LEFT_COMMAND: "⌘", LGUI: "⌘", RGUI: "⌘R", MINUS: "-", EQUAL: "=", COMMA: ",", DOT: ".", SLASH: "/", FSLH: "/",
  BSLH: "\\", SEMI: ";", APOS: "'", GRAVE: "`", TILDE: "~", DOUBLE_QUOTES: '"', DQT: '"', QUESTION: "?", QMARK: "?",
  EXCL: "!", AT: "@", HASH: "#", DOLLAR: "$", DLLR: "$", PRCNT: "%", CARET: "^", AMPERSAND: "&", AMPS: "&", ASTRK: "*",
  LEFT_PARENTHESIS: "(", RIGHT_PARENTHESIS: ")", LPAR: "(", RPAR: ")", LEFT_BRACE: "{", RIGHT_BRACE: "}",
  LBRC: "{", RBRC: "}", LEFT_BRACKET: "[", RIGHT_BRACKET: "]", UNDER: "_", PLUS: "+", PIPE: "|", COLON: ":",
  LT: "<", GT: ">", HOME: "HOME", END: "END", PAGE_UP: "PGUP", PAGE_DOWN: "PGDN", INSERT: "INS",
};

/** Keycap-sized rendering of a raw keycode name, e.g. "BSPC" -> "⌫", "RG(LEFT_BRACKET)" -> "RG-[". */
function pretty(name) {
  if (!name) return "";
  const wrap = name.match(/^([LR][CSAG])\((.+)\)$/);
  if (wrap) return `${wrap[1]}-${pretty(wrap[2])}`;
  if (PRETTY_NAMES[name]) return PRETTY_NAMES[name];
  let m = name.match(/^N(\d)$/);
  if (m) return m[1];
  m = name.match(/^KP_NUMBER_(\d)$/) || name.match(/^KP_N(\d)$/);
  if (m) return m[1];
  if (name.startsWith("KP_")) return name.slice(3);
  if (name.startsWith("K_")) return name.slice(2).replace(/_/g, " ");
  return name;
}

/** Breaks a binding string into {tag, main, muted, accent} for the keycap. */
function describeBinding(binding) {
  const b = (binding || "").trim();
  if (b === "&trans" || b === "") return { tag: "", main: "▽", muted: true };
  if (b === "&none") return { tag: "", main: "✕", muted: true };
  const parts = b.replace(/^&/, "").split(/\s+/);
  const behavior = parts[0];
  const rest = parts.slice(1);
  if (behavior === "kp") return { tag: "", main: pretty(rest.join(" ")) };
  if (behavior === "mt") return { tag: `MT ${pretty(rest[0])}`, main: pretty(rest[1]) };
  if (["mo", "to", "tog", "sl"].includes(behavior)) return { tag: behavior.toUpperCase(), main: `L${rest[0]}`, accent: true };
  if (behavior === "mkp") return { tag: "MOUSE", main: rest[0], accent: true };
  if (behavior === "bt") return { tag: "BT", main: rest.join(" ").replace("BT_", ""), accent: true };
  if (behavior === "out") return { tag: "OUT", main: rest[0].replace("OUT_", ""), accent: true };
  return { tag: behavior.toUpperCase(), main: rest.join(" ") };
}

function renderKeymap() {
  const grid = document.getElementById("keymap-grid");
  grid.innerHTML = "";

  const layer = state.keymap[state.activeLayer];

  PHYSICAL_LAYOUT.forEach((pos, index) => {
    const binding = layer.bindings[index];
    const d = describeBinding(binding);
    const key = document.createElement("button");
    key.type = "button";
    key.className = "key";
    if (d.muted) key.classList.add("muted");
    if (index === state.selectedIndex) key.classList.add("selected");
    key.style.gridColumn = pos.x + 1;
    key.style.gridRow = pos.y + 1;
    const isGlyph = /^[^A-Za-z0-9]$/u.test(d.main);
    const size = isGlyph ? "19px" : d.main.length <= 2 ? "13px" : "12px";
    key.innerHTML = `
      <span class="key-tag${d.accent ? " accent" : ""}">${escapeHtml(d.tag || " ")}</span>
      <span class="key-main" style="font-size:${size}">${escapeHtml(d.main)}</span>
    `;
    key.title = binding;
    key.addEventListener("click", () => selectKey(index));
    grid.appendChild(key);
  });

  // Decorative trackball, filling the gap in the bottom-right of the split —
  // not a real key position, just a shortcut into the trackball tab.
  const trackballNav = document.createElement("button");
  trackballNav.type = "button";
  trackballNav.className = "trackball-nav";
  trackballNav.title = "トラックボール設定へ";
  trackballNav.style.gridArea = "4 / 10 / 5 / 12";
  trackballNav.innerHTML = '<span class="trackball-nav-dot"></span>';
  trackballNav.addEventListener("click", () => switchTab("trackball"));
  grid.appendChild(trackballNav);

  document.getElementById("keyboard-heading").textContent = layer.label;
  document.getElementById("keyboard-meta").textContent = `${PHYSICAL_LAYOUT.length} keys · split 6+6`;
}

function renderLayerTabs() {
  const tabs = document.getElementById("layer-tabs");
  tabs.innerHTML = '<span class="layer-row-label">Layer</span>';
  state.keymap.forEach((layer, index) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "tab" + (index === state.activeLayer ? " active" : "");
    btn.textContent = layer.label;
    btn.addEventListener("click", () => {
      state.activeLayer = index;
      state.selectedIndex = null;
      state.bindingError = "";
      renderLayerTabs();
      renderKeymap();
      renderEditor();
    });
    tabs.appendChild(btn);
  });
}

function renderKeymapActions() {
  const el = document.getElementById("keymap-actions");
  if (state.client && !state.liveKeymap) {
    // Connected to a half that has no keymap of its own (the split
    // peripheral). The grid below is showing built-in sample data, so say so
    // rather than letting it pass for the device's real keymap.
    el.innerHTML =
      '<p class="hint error">この個体はキーマップを持たないため編集できません(左手/peripheral)。以下はサンプル表示です。トラックボールタブと接続状態は利用できます。</p>';
    return;
  }
  if (!state.liveKeymap || !state.client) {
    el.innerHTML = "";
    return;
  }

  el.innerHTML = `
    <div class="live-actions">
      <span class="live-tag">実機のキーマップを表示中</span>
      <button type="button" id="keymap-save-btn">フラッシュに保存</button>
      <button type="button" id="keymap-discard-btn">未保存の変更を破棄</button>
      <span class="hint">${state.liveKeymapDirty ? "未保存の変更があります" : "保存済み"}</span>
    </div>
  `;

  document.getElementById("keymap-save-btn").addEventListener("click", async () => {
    try {
      await state.client.saveKeymap();
      state.liveKeymapDirty = false;
    } catch (error) {
      state.bindingError = error.message;
    }
    renderKeymapActions();
    renderEditor();
  });

  document.getElementById("keymap-discard-btn").addEventListener("click", async () => {
    try {
      await state.client.discardKeymap();
      await refreshLiveKeymap();
      state.liveKeymapDirty = false;
    } catch (error) {
      state.bindingError = error.message;
    }
    renderKeymapActions();
    renderKeymap();
    renderEditor();
  });
}

async function refreshLiveKeymap() {
  const meta = await state.client.getKeymapMeta();
  const layers = [];
  for (const layerId of meta.layerIds) {
    const bindings = await state.client.getLayer(layerId, meta.keyPositionCount);
    layers.push({
      name: `layer_${layerId}`,
      label: `Layer ${layerId}`,
      layerId,
      bindings: bindings.map((b) => decodeBinding(b.name, b.param1, b.param2)),
    });
  }
  state.keymap = layers;
  if (state.activeLayer >= layers.length) state.activeLayer = 0;
  renderLayerTabs();
}

function selectKey(index) {
  state.selectedIndex = index;
  state.bindingError = "";
  const layer = state.keymap[state.activeLayer];
  state.picker = normalizePickerState(layer.bindings[index]);
  renderKeymap();
  renderEditor();
}

async function applyBindingChange(newBindingString) {
  const layer = state.keymap[state.activeLayer];
  const index = state.selectedIndex;
  const trimmed = newBindingString.trim() || "&trans";

  if (state.client && !state.liveKeymap) {
    // Connected to a keymap-less peripheral: editing the on-screen sample
    // would look like it took effect on the device, so refuse instead.
    state.bindingError = "この個体はキーマップを持たないため編集できません(左手/peripheral)";
    renderEditor();
    return;
  }

  if (state.liveKeymap && state.client) {
    const encoded = encodeBinding(trimmed);
    if (!encoded) {
      state.bindingError = `このバインディングは今のところ実機への書き込みに対応していません: ${trimmed}`;
      renderEditor();
      return;
    }

    try {
      await state.client.setBinding(layer.layerId, index, encoded.name, encoded.param1, encoded.param2);
      layer.bindings[index] = decodeBinding(encoded.name, encoded.param1, encoded.param2);
      state.liveKeymapDirty = true;
      state.bindingError = "";
    } catch (error) {
      state.bindingError = error.message;
      renderEditor();
      return;
    }
  } else {
    layer.bindings[index] = trimmed;
    state.dirty = true;
  }

  renderKeymap();
  renderEditor();
  renderKeymapActions();
  updateSyncStatus();
}

function escapeHtml(text) {
  return String(text).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

/** Apply the current state.picker to the selected key (encode + send/store). */
function applyPickerChange() {
  const str = buildBindingStringFromPicker(state.picker);
  if (str) applyBindingChange(str);
}

function renderModifierToggles(container, mods, onChange) {
  container.innerHTML = "";
  Object.entries(MOD_UI).forEach(([modKey, meta]) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "mod-toggle";
    const side = mods[modKey];
    btn.classList.toggle("active", Boolean(side));
    btn.textContent = side === "left" ? `${meta.label}(左)` : side === "right" ? `${meta.label}(右)` : meta.label;
    btn.addEventListener("click", () => {
      const next = side === null ? "left" : side === "left" ? "right" : null;
      onChange(modKey, next);
    });
    container.appendChild(btn);
  });
}

function renderKeycodeGrid(container, selectedKeyName, search, onPick) {
  container.innerHTML = "";
  const query = search.trim().toUpperCase();
  // Compare by resolved keycode VALUE, not the alias string: KEYCODE_REVERSE
  // picks its own shortest alias per value (e.g. "RSFT", not the group's
  // "RSHFT"), so a name-string match would miss the highlight.
  const selectedValue = selectedKeyName ? KEYCODE_VALUES[selectedKeyName] : undefined;
  KEY_PICKER_GROUPS.forEach((group) => {
    const matches = group.keys.filter((k) => !query || k.includes(query));
    if (matches.length === 0) return;
    const groupEl = document.createElement("div");
    groupEl.className = "key-picker-group";
    groupEl.innerHTML = `<span class="key-picker-group-label">${escapeHtml(group.label)}</span>`;
    const grid = document.createElement("div");
    grid.className = "key-picker-grid";
    matches.forEach((keyName) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "key-picker-key" + (KEYCODE_VALUES[keyName] === selectedValue ? " selected" : "");
      btn.textContent = keyName.replace(/^KP_N/, "KP");
      btn.addEventListener("click", () => onPick(keyName));
      grid.appendChild(btn);
    });
    groupEl.appendChild(grid);
    container.appendChild(groupEl);
  });
  if (query && !KEY_PICKER_GROUPS.some((g) => g.keys.some((k) => k.includes(query)))) {
    container.innerHTML = '<p class="hint">一致するキーがありません</p>';
  }
}

function renderKpSubPicker(container, field, keyName, mods, search, onKeyChange, onModChange, onSearchChange) {
  container.innerHTML = `
    <div class="mod-toggles"></div>
    <input type="text" class="key-search" data-field="${field}" placeholder="キーを検索…" value="${escapeHtml(search)}" />
    <div class="key-grid"></div>
  `;
  renderModifierToggles(container.querySelector(".mod-toggles"), mods, onModChange);
  renderKeycodeGrid(container.querySelector(".key-grid"), keyName, search, onKeyChange);
  const searchInput = container.querySelector(".key-search");
  searchInput.addEventListener("input", () => {
    const caret = searchInput.selectionStart;
    onSearchChange(searchInput.value);
    // onSearchChange re-renders the whole editor panel synchronously, which
    // replaces this input with a new node — re-find it by field to restore focus.
    const fresh = document.querySelector(`.key-search[data-field="${field}"]`);
    if (fresh) {
      fresh.focus();
      fresh.setSelectionRange(caret, caret);
    }
  });
}

function renderButtonChoices(container, options, selected, labelFor, onPick) {
  container.innerHTML = "";
  options.forEach((opt) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "choice-btn" + (opt === selected ? " selected" : "");
    btn.textContent = labelFor ? labelFor(opt) : opt;
    btn.addEventListener("click", () => onPick(opt));
    container.appendChild(btn);
  });
}

function renderEditor() {
  const panel = document.getElementById("binding-editor");
  if (state.selectedIndex === null) {
    panel.innerHTML = '<p class="hint">キーをクリックすると編集できます</p>';
    return;
  }

  const layer = state.keymap[state.activeLayer];
  const current = layer.bindings[state.selectedIndex];
  const pos = PHYSICAL_LAYOUT[state.selectedIndex];
  const picker = state.picker;

  panel.innerHTML = `
    <div class="editor-heading">キー編集</div>
    <div class="editor-pos">位置: row ${pos.row}, col ${pos.col}${state.liveKeymap ? " (実機に即時反映)" : ""}</div>
    <div class="editor-divider"></div>
    <label class="field">
      <span>種類</span>
      <select id="behavior-kind-select"></select>
    </label>
    <div id="behavior-subpicker"></div>
    ${state.bindingError ? `<p class="hint error">${state.bindingError}</p>` : ""}
    <div class="editor-divider"></div>
    <p class="current-binding">現在: <code>${escapeHtml(current)}</code></p>
    <button type="button" id="advanced-toggle" class="link-btn">${picker.advanced ? "▲ 高度な設定を隠す" : "▼ ZMK記法で直接入力(高度な設定)"}</button>
    <div id="advanced-editor"></div>
  `;

  const kindSelect = panel.querySelector("#behavior-kind-select");
  BEHAVIOR_KIND_OPTIONS.forEach((opt) => {
    const optionEl = document.createElement("option");
    optionEl.value = opt.kind;
    optionEl.textContent = opt.label;
    optionEl.selected = opt.kind === picker.kind;
    kindSelect.appendChild(optionEl);
  });
  kindSelect.addEventListener("change", () => {
    state.picker = { ...defaultPicker(kindSelect.value), advanced: false };
    applyPickerChange();
  });

  renderBehaviorSubpicker(panel.querySelector("#behavior-subpicker"), picker);

  panel.querySelector("#advanced-toggle").addEventListener("click", () => {
    state.picker.advanced = !state.picker.advanced;
    renderEditor();
  });

  const advancedEl = panel.querySelector("#advanced-editor");
  if (picker.advanced) {
    advancedEl.innerHTML = `<input id="binding-input" type="text" value="${escapeHtml(current)}" />`;
    const input = advancedEl.querySelector("#binding-input");
    input.addEventListener("change", () => applyBindingChange(input.value));
  }
}

function renderBehaviorSubpicker(container, picker) {
  switch (picker.kind) {
    case "kp": {
      const div = document.createElement("div");
      renderKpSubPicker(
        div,
        "single",
        picker.keyName,
        picker.mods,
        picker.search,
        (keyName) => {
          state.picker.keyName = keyName;
          applyPickerChange();
        },
        (modKey, side) => {
          state.picker.mods[modKey] = side;
          applyPickerChange();
        },
        (search) => {
          state.picker.search = search;
          renderEditor();
        },
      );
      container.replaceChildren(div);
      break;
    }
    case "mt": {
      container.innerHTML = `
        <div class="subpicker-label">ホールド(長押し)</div>
        <div class="mt-field" data-field="hold"></div>
        <div class="subpicker-label">タップ(短く押す)</div>
        <div class="mt-field" data-field="tap"></div>
      `;
      ["hold", "tap"].forEach((field) => {
        const sub = picker[field];
        renderKpSubPicker(
          container.querySelector(`.mt-field[data-field="${field}"]`),
          field,
          sub.keyName,
          sub.mods,
          sub.search ?? "",
          (keyName) => {
            state.picker[field].keyName = keyName;
            applyPickerChange();
          },
          (modKey, side) => {
            state.picker[field].mods[modKey] = side;
            applyPickerChange();
          },
          (search) => {
            state.picker[field].search = search;
            renderEditor();
          },
        );
      });
      break;
    }
    case "mo":
    case "to":
    case "tog":
    case "sl": {
      container.innerHTML = '<div class="subpicker-label">対象レイヤー</div><div class="layer-choices"></div>';
      renderButtonChoices(
        container.querySelector(".layer-choices"),
        state.keymap.map((_, i) => i),
        picker.layer,
        (i) => state.keymap[i]?.label ?? `Layer ${i}`,
        (layerIndex) => {
          state.picker.layer = layerIndex;
          applyPickerChange();
        },
      );
      break;
    }
    case "mkp": {
      container.innerHTML = '<div class="subpicker-label">マウスボタン</div><div class="choices"></div>';
      renderButtonChoices(container.querySelector(".choices"), MOUSE_BTN_OPTIONS, picker.btn, null, (btn) => {
        state.picker.btn = btn;
        applyPickerChange();
      });
      break;
    }
    case "bt": {
      container.innerHTML = `
        <div class="subpicker-label">Bluetoothコマンド</div>
        <div class="choices"></div>
        ${picker.cmd === "BT_SEL" ? '<div class="subpicker-label">プロファイル番号</div><div class="profile-choices"></div>' : ""}
      `;
      renderButtonChoices(container.querySelector(".choices"), BT_CMD_OPTIONS, picker.cmd, null, (cmd) => {
        state.picker.cmd = cmd;
        applyPickerChange();
      });
      if (picker.cmd === "BT_SEL") {
        renderButtonChoices(container.querySelector(".profile-choices"), [0, 1, 2, 3, 4], picker.profile, (n) => `${n}`, (n) => {
          state.picker.profile = n;
          applyPickerChange();
        });
      }
      break;
    }
    case "out": {
      container.innerHTML = '<div class="subpicker-label">出力先</div><div class="choices"></div>';
      renderButtonChoices(container.querySelector(".choices"), OUT_OPTIONS, picker.val, null, (val) => {
        state.picker.val = val;
        applyPickerChange();
      });
      break;
    }
    case "trans":
    case "none":
      container.innerHTML = "";
      break;
    default:
      container.innerHTML = "";
  }
}

function renderLivePointerPanel() {
  const el = document.getElementById("live-pointer-panel");
  if (!state.client || !state.livePointer) {
    el.innerHTML = "";
    return;
  }

  const settings = state.livePointer;
  el.innerHTML = `
    <section class="device-card live-card">
      <div class="device-card-header">
        <h3>接続中の実機<span class="live-tag">USB接続中</span></h3>
      </div>
      <div class="device-card-divider"></div>
      <label class="field">
        <span class="field-row-label"><span>ポインター速度</span><output>${settings.pointerSpeed}%</output></span>
        <input type="range" min="20" max="300" step="5" value="${settings.pointerSpeed}" data-prop="pointerSpeed" class="live-input" />
      </label>
      <label class="field">
        <span class="field-row-label"><span>スクロール速度</span><output>${settings.scrollSpeed}%</output></span>
        <input type="range" min="20" max="300" step="5" value="${settings.scrollSpeed}" data-prop="scrollSpeed" class="live-input" />
      </label>
      <label class="checkbox">
        <input type="checkbox" ${settings.invertScroll ? "checked" : ""} data-prop="invertScroll" class="live-input" />
        <span>スクロール方向を反転</span>
      </label>
      <label class="checkbox">
        <input type="checkbox" ${settings.invertX ? "checked" : ""} data-prop="invertX" class="live-input" />
        <span>X軸を反転</span>
      </label>
      <label class="checkbox">
        <input type="checkbox" ${settings.invertY ? "checked" : ""} data-prop="invertY" class="live-input" />
        <span>Y軸を反転</span>
      </label>
      <div class="live-actions">
        <button type="button" id="pointer-save-btn">フラッシュに保存</button>
        <button type="button" id="pointer-reset-btn">初期値にリセット</button>
        <span class="hint">${state.livePointerDirty ? "未保存の変更があります(実機には反映済み)" : "保存済み"}</span>
      </div>
      ${state.livePointerError ? `<p class="hint error">${state.livePointerError}</p>` : ""}
    </section>
  `;

  const applySetting = async (prop, value) => {
    state.livePointer[prop] = value;
    try {
      await state.client.setPointerSettings(state.livePointer);
      state.livePointerDirty = true;
      state.livePointerError = "";
    } catch (error) {
      state.livePointerError = error.message;
    }
    renderLivePointerPanel();
  };

  el.querySelectorAll('input[type="range"].live-input').forEach((input) => {
    input.addEventListener("change", (event) => applySetting(event.target.dataset.prop, Number(event.target.value)));
    input.addEventListener("input", (event) => {
      event.target.parentElement.querySelector("output").textContent = `${event.target.value}%`;
    });
  });

  el.querySelectorAll('input[type="checkbox"].live-input').forEach((input) => {
    input.addEventListener("change", (event) => applySetting(event.target.dataset.prop, event.target.checked));
  });

  document.getElementById("pointer-save-btn").addEventListener("click", async () => {
    try {
      await state.client.savePointerSettings();
      state.livePointerDirty = false;
    } catch (error) {
      state.livePointerError = error.message;
    }
    renderLivePointerPanel();
  });

  document.getElementById("pointer-reset-btn").addEventListener("click", async () => {
    try {
      state.livePointer = await state.client.resetPointerSettings();
      state.livePointerDirty = false;
    } catch (error) {
      state.livePointerError = error.message;
    }
    renderLivePointerPanel();
  });
}

// --- Profiles: named snapshots of {keymap, pointer} together, saved in this
// browser's localStorage. Reuses collectBackupData()/restoreBackupData() —
// a profile is just a named backup applied in place instead of downloaded.

const PROFILES_KEY = "zen-configurator-profiles";

function loadProfiles() {
  try {
    const parsed = JSON.parse(localStorage.getItem(PROFILES_KEY) ?? "[]");
    return Array.isArray(parsed) ? parsed : [];
  } catch (_error) {
    return [];
  }
}

function saveProfiles(profiles) {
  localStorage.setItem(PROFILES_KEY, JSON.stringify(profiles));
}

function saveProfileFromCurrent(name) {
  const profiles = loadProfiles();
  const data = collectBackupData();
  const existingIndex = profiles.findIndex((p) => p.name === name);
  if (existingIndex >= 0) profiles[existingIndex] = { name, data };
  else profiles.push({ name, data });
  saveProfiles(profiles);
}

function deleteProfile(name) {
  saveProfiles(loadProfiles().filter((p) => p.name !== name));
  renderProfileList();
}

/**
 * Disable the profile/backup toolbar buttons and show a status message
 * while a multi-step restore is in flight. Each binding write is a real
 * serial round-trip, so restoring a whole keymap can take a few seconds —
 * without this, clicking another profile mid-restore made it unclear which
 * one actually ended up applied.
 */
function setToolbarsBusy(busy, message) {
  document.querySelectorAll(".profile-row button, #profile-save-btn, #export-btn, #import-btn").forEach((btn) => {
    btn.disabled = busy;
  });
  const statusEl = document.getElementById("profile-status");
  if (statusEl) statusEl.textContent = busy ? (message ?? "処理中...") : "";
}

async function applyProfile(profile) {
  setToolbarsBusy(true, `「${profile.name}」を適用中...`);
  try {
    await restoreBackupData(profile.data);
    state.activeProfileName = profile.name;
  } finally {
    setToolbarsBusy(false);
  }
  renderAll();
}

function renderProfileList() {
  const container = document.getElementById("profile-list");
  const profiles = loadProfiles();
  if (profiles.length === 0) {
    container.innerHTML = '<span class="hint">まだ保存されたプロファイルはありません</span>';
    return;
  }
  container.innerHTML = "";
  profiles.forEach((profile) => {
    const row = document.createElement("span");
    row.className = "profile-row" + (profile.name === state.activeProfileName ? " active" : "");
    row.innerHTML = `
      <button type="button" class="profile-name" title="このプロファイルを適用">${escapeHtml(profile.name)}</button>
      <button type="button" class="profile-delete" title="削除" aria-label="削除">
        <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 7h16M10 7V4h4v3M6 7l1 13h10l1-13M10 11v6M14 11v6"/></svg>
      </button>
    `;
    row.querySelector(".profile-name").addEventListener("click", () => applyProfile(profile));
    row.querySelector(".profile-delete").addEventListener("click", () => deleteProfile(profile.name));
    container.appendChild(row);
  });
}

function renderTrackball() {
  const container = document.getElementById("trackball-panel");
  container.innerHTML = "";

  Object.entries(DEVICE_PROFILES).forEach(([key, profile]) => {
    const settings = state.pointerSettings[key];
    const section = document.createElement("section");
    section.className = "device-card";
    section.innerHTML = `
      <div class="device-card-header">
        <h3>${profile.title}</h3>
        <span class="device-card-chip">${profile.chip}</span>
      </div>
      <div class="device-card-divider"></div>
      <label class="field">
        <span class="field-row-label"><span>ポインター速度</span><output>${settings.pointerSpeed}%</output></span>
        <input type="range" min="20" max="300" step="5" value="${settings.pointerSpeed}" data-key="${key}" data-prop="pointerSpeed" />
      </label>
      <label class="field">
        <span class="field-row-label"><span>スクロール速度</span><output>${settings.scrollSpeed}%</output></span>
        <input type="range" min="20" max="300" step="5" value="${settings.scrollSpeed}" data-key="${key}" data-prop="scrollSpeed" />
      </label>
      <label class="checkbox">
        <input type="checkbox" ${settings.invertScroll ? "checked" : ""} data-key="${key}" data-prop="invertScroll" />
        <span>スクロール方向を反転</span>
      </label>
      <label class="checkbox">
        <input type="checkbox" ${settings.invertX ? "checked" : ""} data-key="${key}" data-prop="invertX" />
        <span>X軸を反転</span>
      </label>
      <label class="checkbox">
        <input type="checkbox" ${settings.invertY ? "checked" : ""} data-key="${key}" data-prop="invertY" />
        <span>Y軸を反転</span>
      </label>
    `;
    container.appendChild(section);
  });

  container.querySelectorAll("input[type=range]").forEach((input) => {
    input.addEventListener("input", (event) => {
      const { key, prop } = event.target.dataset;
      state.pointerSettings[key][prop] = Number(event.target.value);
      state.dirty = true;
      const output = event.target.parentElement.querySelector("output");
      if (output) output.textContent = `${event.target.value}%`;
      updateSyncStatus();
    });
  });

  container.querySelectorAll("input[type=checkbox]").forEach((input) => {
    input.addEventListener("change", (event) => {
      const { key, prop } = event.target.dataset;
      state.pointerSettings[key][prop] = event.target.checked;
      state.dirty = true;
      updateSyncStatus();
    });
  });
}

function updateSyncStatus() {
  const el = document.getElementById("sync-status");
  el.textContent = state.dirty
    ? "未反映の変更があります(実機への書き込みは未実装)"
    : "変更なし";
  el.classList.toggle("dirty", state.dirty);
}

function switchTab(tabName) {
  document.querySelectorAll(".view").forEach((view) => {
    view.classList.toggle("active", view.dataset.view === tabName);
  });
  document.querySelectorAll(".main-tab").forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.tab === tabName);
  });
}

async function connectSerial() {
  if (!("serial" in navigator)) {
    state.connectionMessage = "このブラウザはWeb Serial APIに対応していません(Chrome/Edge推奨)";
    state.connectionError = true;
    renderHeaderStatus();
    return;
  }

  try {
    state.client = await ZenConfigClient.requestAndOpen();

    // A split peripheral answers GET_KEYMAP_META with "not supported" — it
    // genuinely has no local keymap (see the peripheral stubs in
    // zen_config_serial_bridge.c). That's not a connection failure: pointer
    // settings and status still work, and being able to read a peripheral's
    // status over USB is exactly what you want when the halves aren't
    // talking to each other. So keep the connection and just run without a
    // keymap.
    try {
      const meta = await state.client.getKeymapMeta();
      if (meta.keyPositionCount !== PHYSICAL_LAYOUT.length) {
        console.warn(
          `key position count mismatch: device reports ${meta.keyPositionCount}, this prototype's layout has ${PHYSICAL_LAYOUT.length}`,
        );
      }
      await refreshLiveKeymap();
      state.liveKeymap = true;
      state.activeLayer = 0;
      state.selectedIndex = null;
      state.liveKeymapDirty = false;
    } catch (error) {
      console.warn("no keymap on this device, continuing without one:", error);
      state.liveKeymap = false;
      state.selectedIndex = null;
    }

    state.livePointer = await state.client.getPointerSettings();
    state.livePointerDirty = false;

    try {
      state.liveStatus = await state.client.getStatus();
    } catch (_error) {
      state.liveStatus = null; // older firmware without GET_STATUS support — non-fatal
    }
    startStatusPolling();

    state.connectionMessage = state.liveKeymap
      ? "接続済み — 実機のキーマップ/設定を読み込みました"
      : "接続済み — この個体はキーマップを持ちません(左手/peripheral)";
    state.connectionError = false;
    document.getElementById("footer-note").textContent = state.liveKeymap
      ? "実機に接続中: キー編集・トラックボール設定は即座に実機へ反映されます(保存ボタンでフラッシュに書き込み)"
      : "実機に接続中(peripheral): キーマップ編集はできません。トラックボール設定と接続状態のみ利用できます";
  } catch (error) {
    console.error(error);
    state.connectionMessage = `接続できませんでした: ${error.message}`;
    state.connectionError = true;
    state.client = null;
  }

  renderAll();
}

async function disconnectSerial() {
  stopStatusPolling();
  try {
    await state.client?.close();
  } catch (error) {
    console.error(error);
  }

  state.client = null;
  state.liveKeymap = false;
  state.livePointer = null;
  state.liveStatus = null;
  state.liveKeymapDirty = false;
  state.livePointerDirty = false;
  state.activeLayer = 0;
  state.selectedIndex = null;
  state.keymap = LAYERS.map((layer) => ({ ...layer, bindings: [...layer.bindings] }));
  state.connectionMessage = "";
  state.connectionError = false;
  document.getElementById("footer-note").textContent = "変更はこの画面内のみに保持されます(未接続)";

  renderAll();
}

function stopStatusPolling() {
  if (state.statusInterval) {
    clearInterval(state.statusInterval);
    state.statusInterval = null;
  }
}

function startStatusPolling() {
  stopStatusPolling();
  state.statusInterval = setInterval(async () => {
    if (!state.client) {
      stopStatusPolling();
      return;
    }
    try {
      state.liveStatus = await state.client.getStatus();
    } catch (_error) {
      // Transient read failure — keep showing the last known status.
    }
    renderHeaderStatus();
  }, 20000);
}

/**
 * Header status area: the pill card (battery + BLE profile + message, only
 * once actually connected), the dot+label connection indicator (reflects
 * this browser's own Web Serial link, independent of the keyboard's own
 * USB/BLE HID transport reported inside the card), and the connect
 * button's label/tooltip.
 */
function renderHeaderStatus() {
  const connected = Boolean(state.client);
  const cardEl = document.getElementById("status-bar");
  const indicatorEl = document.getElementById("connection-status");
  const labelEl = document.getElementById("connect-button-label");

  if (connected) {
    const s = state.liveStatus;
    // On a central, "相手側 --" means the other half hasn't reported its
    // battery over the split link (yet) — worth showing rather than hiding,
    // since a persistent "--" is a sign the halves aren't talking.
    const peripheralText =
      s && s.role === "central"
        ? s.peripheralBattery !== null
          ? ` / 相手側 ${s.peripheralBattery}%`
          : " / 相手側 --"
        : "";
    const batteryText = s ? `本体 ${s.localBattery}%${peripheralText}` : null;
    const connText = s
      ? s.role === "peripheral"
        ? s.connected
          ? "central接続中"
          : "central未接続"
        : `${s.transport ?? "?"}${s.transport === "BLE" && s.activeProfile !== null ? ` プロファイル${s.activeProfile}` : ""} ${
            s.connected ? "接続中" : "未接続"
          }`
      : null;
    cardEl.innerHTML = `
      <span class="status-card">
        ${batteryText ? `<span class="status-battery">🔋 <span class="mono">${escapeHtml(batteryText)}</span></span><span class="divider"></span>` : ""}
        ${connText ? `<span class="status-profile">${escapeHtml(connText)}</span><span class="divider"></span>` : ""}
        <span class="status-message${state.connectionError ? " error" : ""}">${escapeHtml(state.connectionMessage)}</span>
      </span>
    `;
  } else {
    cardEl.innerHTML = state.connectionError
      ? `<span class="status-message error">${escapeHtml(state.connectionMessage)}</span>`
      : "";
  }

  indicatorEl.innerHTML = `<span class="conn-indicator${connected ? " connected" : ""}"><span class="dot"></span>${
    connected ? "USB接続中" : "未接続"
  }</span>`;

  labelEl.textContent = connected ? "切断" : "USB接続";
}

function renderRuleNote() {
  const connected = Boolean(state.client);
  const keyCount = PHYSICAL_LAYOUT.length;
  const layerCount = state.keymap.length;
  document.getElementById("rule-note").textContent = connected
    ? `ZEN · USB · ${keyCount} keys / ${layerCount} layers`
    : `ZEN · ${keyCount} keys / ${layerCount} layers`;
}

function collectBackupData() {
  return {
    formatVersion: 1,
    keymap: state.keymap.map((layer) => ({ name: layer.name, layerId: layer.layerId, bindings: [...layer.bindings] })),
    pointer: state.client && state.livePointer ? { ...state.livePointer } : null,
  };
}

function downloadJson(filename, data) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

function exportBackup() {
  downloadJson(`zen-configurator-backup-${Date.now()}.json`, collectBackupData());
}

function readFileAsJson(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        resolve(JSON.parse(reader.result));
      } catch (error) {
        reject(error);
      }
    };
    reader.onerror = () => reject(reader.error ?? new Error("ファイルを読み込めませんでした"));
    reader.readAsText(file);
  });
}

function renderAll() {
  renderLayerTabs();
  renderKeymap();
  renderEditor();
  renderKeymapActions();
  renderLivePointerPanel();
  renderTrackball();
  renderProfileList();
  renderHeaderStatus();
  renderRuleNote();
  updateSyncStatus();
}

/**
 * Apply a {keymap, pointer} snapshot (from a backup file or a saved
 * profile). Writes are best-effort per-binding: a binding the wire protocol
 * can't represent is skipped rather than aborting the whole restore. Nothing
 * is saved to flash automatically — the existing dirty/save buttons still
 * gate that, so a bad restore can be discarded before it's permanent.
 */
async function restoreBackupData(data) {
  if (state.liveKeymap && state.client) {
    // Match layers positionally (both sides are built in the same layer
    // order every time) rather than by layerId/name — layerId is only
    // populated after a real refreshLiveKeymap() and can be undefined for
    // every layer at once, which would make an equality-based lookup match
    // the wrong layer.
    for (let layerIndex = 0; layerIndex < data.keymap.length; layerIndex++) {
      const fileLayer = data.keymap[layerIndex];
      const deviceLayer = state.keymap[layerIndex];
      if (!deviceLayer) continue;
      const count = Math.min(fileLayer.bindings.length, deviceLayer.bindings.length);
      for (let i = 0; i < count; i++) {
        if (fileLayer.bindings[i] === deviceLayer.bindings[i]) continue; // already matches — skip the round-trip
        const encoded = encodeBinding(fileLayer.bindings[i]);
        if (!encoded) continue;
        await state.client.setBinding(deviceLayer.layerId, i, encoded.name, encoded.param1, encoded.param2);
        deviceLayer.bindings[i] = decodeBinding(encoded.name, encoded.param1, encoded.param2);
      }
    }
    state.liveKeymapDirty = true;
  } else if (!state.client) {
    data.keymap.forEach((fileLayer, i) => {
      if (state.keymap[i]) state.keymap[i].bindings = [...fileLayer.bindings];
    });
    state.dirty = true;
  }
  // else: connected to a keymap-less peripheral — skip the keymap entirely
  // rather than writing it into the on-screen sample, but still apply the
  // pointer settings below, which that half genuinely does have.

  if (data.pointer && state.client) {
    await state.client.setPointerSettings(data.pointer);
    state.livePointer = data.pointer;
    state.livePointerDirty = true;
  }
}

async function importBackup(file) {
  const statusEl = document.getElementById("backup-status");
  setToolbarsBusy(true, "復元中...");
  try {
    const data = await readFileAsJson(file);
    if (!data || !Array.isArray(data.keymap)) throw new Error("バックアップファイルの形式が不正です");
    await restoreBackupData(data);
    statusEl.textContent = "復元しました。内容を確認し、必要なら保存してください。";
    statusEl.classList.remove("error");
  } catch (error) {
    statusEl.textContent = `復元に失敗しました: ${error.message}`;
    statusEl.classList.add("error");
  }
  setToolbarsBusy(false);

  renderAll();
}

function init() {
  renderAll();

  document.querySelectorAll(".main-tab").forEach((btn) => {
    btn.addEventListener("click", () => switchTab(btn.dataset.tab));
  });

  document.getElementById("connect-button").addEventListener("click", () => {
    if (state.client) disconnectSerial();
    else connectSerial();
  });

  const settingsButton = document.getElementById("settings-button");
  const settingsDropdown = document.getElementById("settings-dropdown");
  const closeSettings = () => {
    state.settingsOpen = false;
    settingsButton.classList.remove("open");
    settingsDropdown.hidden = true;
  };
  settingsButton.addEventListener("click", (event) => {
    event.stopPropagation();
    state.settingsOpen = !state.settingsOpen;
    settingsButton.classList.toggle("open", state.settingsOpen);
    settingsDropdown.hidden = !state.settingsOpen;
  });
  document.addEventListener("click", (event) => {
    if (state.settingsOpen && !event.target.closest(".settings-wrap")) closeSettings();
  });

  document.getElementById("export-btn").addEventListener("click", () => {
    exportBackup();
    closeSettings();
  });
  const importFile = document.getElementById("import-file");
  document.getElementById("import-btn").addEventListener("click", () => {
    importFile.click();
    closeSettings();
  });
  importFile.addEventListener("change", () => {
    if (importFile.files[0]) importBackup(importFile.files[0]);
    importFile.value = "";
  });

  document.getElementById("profile-save-btn").addEventListener("click", () => {
    const input = document.getElementById("profile-name-input");
    const name = input.value.trim();
    if (!name) return;
    saveProfileFromCurrent(name);
    input.value = "";
    renderProfileList();
  });
}

document.addEventListener("DOMContentLoaded", init);
