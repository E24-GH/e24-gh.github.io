// ZEN Configurator — v2 UI.
//
// One page, four tabs, rendered by re-running render() into #app after every
// state change. There is no build step and no framework: the app is a pure
// function of `state` plus a delegated event handler, which is enough at this
// size and keeps the file readable next to the design it was ported from.
//
// The wire protocol (protocol.js) is untouched; everything the keyboard can
// actually do today goes through ZenConfigClient. Features the firmware does
// not have yet are gated behind FEATURES below so the UI can ship now and be
// switched on per feature as the firmware catches up.

"use strict";

// --- What this firmware can actually do ------------------------------------
//
// Nearly everything is capability-detected at runtime now: the keyboard either
// answers the command or it does not, which is more honest than a flag someone
// has to remember to flip when the firmware changes.
//
//   trackball angle   angleSupported()      (pointer settings version)
//   auto-mouse        autoMouseSupported()  (does GET_AUTO_MOUSE answer?)
//   Bluetooth         state.bleProfiles     (does GET_BLE_PROFILES answer?)
//   combos            canEditCombos()       (not a keyboard feature at all --
//                                            they are compiled into the
//                                            firmware from keymap.keymap)
const FEATURES = {
  // Deliberately not offered for the trackball: the ball already coasts on its
  // own, so software inertia would stack on top of real sensor motion. It is a
  // trackpad feature, and the trackpad build's CONFIG_IQS7211E_SCROLLER_INERTIA
  // is not wired to the settings yet.
  inertia: false,
};

// --- Physical layout, transcribed from config/info.json (LAYOUT.layout) ----
const XS = [
  [0, 1, 2, 3, 4, 5, 9, 10, 11, 12, 13, 14],
  [0, 1, 2, 3, 4, 5, 9, 10, 11, 12, 13, 14],
  [0, 1, 2, 3, 4, 5, 6, 8, 9, 10, 11, 12, 13, 14],
  [0, 1, 2, 3, 4, 5, 6, 8, 11, 12, 13, 14],
];
const POS = [];
XS.forEach((xs, r) => xs.forEach((x, c) => POS.push({ row: r, col: c, x, y: r })));

// Bindings, transcribed from config/keymap.keymap. Index i corresponds to
// POS[i]. Used as sample data until a keyboard is connected.
const TRANS = () => Array(POS.length).fill("&trans");
const SAMPLE_LAYERS = [
  ["&kp TAB", "&kp Q", "&kp W", "&kp E", "&kp R", "&kp T", "&kp Y", "&kp U", "&kp I", "&kp O", "&kp P", "&kp BSPC",
    "&mo 5", "&kp A", "&kp S", "&kp D", "&kp F", "&kp G", "&kp H", "&kp J", "&kp K", "&kp L", "&kp MINUS", "&kp ENTER",
    "&kp LSHFT", "&kp Z", "&kp X", "&kp C", "&kp V", "&kp B", "&kp DOUBLE_QUOTES", "&kp AT", "&kp N", "&kp M", "&kp COMMA", "&kp DOT", "&kp UP_ARROW", "&mt RSHFT QUESTION",
    "&mo 2", "&kp ESCAPE", "&kp LEFT_CONTROL", "&kp LALT", "&kp LEFT_COMMAND", "&mo 2", "&kp SPACE", "&kp SPACE", "&mo 3", "&kp LEFT_ARROW", "&kp DOWN_ARROW", "&kp RIGHT_ARROW"],
  ["&trans", "&trans", "&trans", "&trans", "&trans", "&trans", "&trans", "&mkp LCLK", "&mo 4", "&mkp RCLK", "&trans", "&trans",
    "&trans", "&trans", "&trans", "&trans", "&trans", "&trans", "&kp RG(LEFT_BRACKET)", "&mkp MB1", "&mkp MB3", "&mkp MB2", "&kp RG(RIGHT_BRACKET)", "&trans",
    "&trans", "&trans", "&trans", "&trans", "&trans", "&trans", "&trans", "&trans", "&kp LC(UP_ARROW)", "&trans", "&trans", "&trans", "&trans", "&trans",
    "&trans", "&trans", "&trans", "&trans", "&trans", "&trans", "&trans", "&trans", "&trans", "&trans", "&trans", "&trans"],
  ["&kp ESCAPE", "&kp N1", "&kp N2", "&kp N3", "&kp N4", "&kp N5", "&kp N6", "&kp N7", "&kp N8", "&kp N9", "&kp N0", "&kp DELETE",
    "&trans", "&kp EXCL", "&kp AT", "&kp HASH", "&kp DOLLAR", "&kp PRCNT", "&kp CARET", "&kp AMPERSAND", "&kp ASTRK", "&kp LEFT_PARENTHESIS", "&kp RIGHT_PARENTHESIS", "&trans",
    "&trans", "&trans", "&trans", "&trans", "&trans", "&trans", "&trans", "&trans", "&kp TILDE", "&kp LEFT_BRACE", "&kp RIGHT_BRACE", "&kp LEFT_BRACKET", "&kp RIGHT_BRACKET", "&kp SLASH",
    "&trans", "&trans", "&trans", "&trans", "&trans", "&trans", "&trans", "&trans", "&trans", "&trans", "&trans", "&trans"],
  ["&trans", "&kp F1", "&kp F2", "&kp F3", "&kp F4", "&kp F5", "&trans", "&kp FSLH", "&kp ASTRK", "&kp KP_NUMBER_7", "&kp KP_NUMBER_8", "&kp KP_NUMBER_9",
    "&trans", "&kp F6", "&kp F7", "&kp F8", "&kp F9", "&kp F10", "&kp HOME", "&trans", "&kp MINUS", "&kp KP_NUMBER_4", "&kp KP_NUMBER_5", "&kp KP_NUMBER_6",
    "&trans", "&kp F11", "&kp F12", "&out OUT_USB", "&out OUT_BLE", "&bt BT_NXT", "&bt BT_CLR_ALL", "&trans", "&kp END", "&trans", "&kp GRAVE", "&kp KP_NUMBER_1", "&kp KP_NUMBER_2", "&kp KP_NUMBER_3",
    "&bt BT_SEL 0", "&bt BT_SEL 1", "&bt BT_SEL 2", "&bt BT_SEL 3", "&bt BT_SEL 4", "&trans", "&trans", "&trans", "&trans", "&kp KP_NUMBER_0", "&kp DOT", "&kp EQUAL"],
  TRANS(),
  ["&kp ESC", "&kp F1", "&kp F2", "&kp F3", "&kp F4", "&kp F5", "&kp F6", "&kp F7", "&kp F8", "&kp F9", "&kp F10", "&kp F12",
    "&trans", "&trans", "&trans", "&trans", "&trans", "&trans", "&trans", "&trans", "&trans", "&trans", "&trans", "&trans",
    "&trans", "&trans", "&trans", "&trans", "&trans", "&trans", "&trans", "&trans", "&trans", "&trans", "&trans", "&trans", "&trans", "&trans",
    "&trans", "&trans", "&trans", "&trans", "&trans", "&trans", "&trans", "&trans", "&trans", "&trans", "&trans", "&trans"],
  TRANS(),
];

const DEFAULT_LAYER_NAMES = ["ふだん", "マウス", "記号・数字", "F・テンキー", "", "ファンクション", ""];

// --- Key picker ------------------------------------------------------------

const PICKER_GROUPS = [
  { label: "文字", keys: "A B C D E F G H I J K L M N O P Q R S T U V W X Y Z".split(" ") },
  { label: "数字", keys: ["N1", "N2", "N3", "N4", "N5", "N6", "N7", "N8", "N9", "N0"] },
  { label: "記号", keys: ["MINUS", "EQUAL", "LEFT_BRACKET", "RIGHT_BRACKET", "BSLH", "SEMI", "APOS", "GRAVE", "COMMA", "DOT", "FSLH"] },
  { label: "Shift記号", keys: ["EXCL", "AT", "HASH", "DLLR", "PRCNT", "CARET", "AMPS", "ASTRK", "LPAR", "RPAR", "UNDER", "PLUS", "TILDE", "PIPE", "LBRC", "RBRC", "COLON", "DQT", "LT", "GT", "QMARK"] },
  { label: "Enter・空白", keys: ["ENTER", "SPACE", "TAB", "BSPC", "DELETE", "ESCAPE", "CAPS", "INSERT"] },
  { label: "矢印・移動", keys: ["UP", "DOWN", "LEFT", "RIGHT", "HOME", "END", "PAGE_UP", "PAGE_DOWN"] },
  { label: "F1〜F12", keys: ["F1", "F2", "F3", "F4", "F5", "F6", "F7", "F8", "F9", "F10", "F11", "F12"] },
  { label: "修飾キー", keys: ["LSHFT", "RSHFT", "LCTRL", "RCTRL", "LALT", "RALT", "LGUI", "RGUI"] },
  { label: "テンキー", keys: ["KP_N1", "KP_N2", "KP_N3", "KP_N4", "KP_N5", "KP_N6", "KP_N7", "KP_N8", "KP_N9", "KP_N0", "KP_DOT", "KP_SLASH", "KP_MULTIPLY", "KP_MINUS", "KP_PLUS", "KP_ENTER"] },
  { label: "音量・再生", keys: ["K_VOL_UP", "K_VOL_DN", "K_MUTE", "K_PLAY_PAUSE", "K_NEXT", "K_PREV"] },
];

// Spoken-out names, for tooltips and the plain-Japanese sentence under a key.
const FRIENDLY = {
  ENTER: "Enter（改行）", SPACE: "スペース", TAB: "Tab", BSPC: "BackSpace（1文字消す）", DELETE: "Delete", ESCAPE: "Esc", ESC: "Esc",
  CAPS: "CapsLock", INSERT: "Insert", UP: "上矢印", DOWN: "下矢印", LEFT: "左矢印", RIGHT: "右矢印",
  UP_ARROW: "上矢印", DOWN_ARROW: "下矢印", LEFT_ARROW: "左矢印", RIGHT_ARROW: "右矢印",
  HOME: "Home", END: "End", PAGE_UP: "PageUp", PAGE_DOWN: "PageDown",
  LSHFT: "Shift", RSHFT: "右Shift", LCTRL: "Ctrl", LEFT_CONTROL: "Ctrl", RCTRL: "右Ctrl", LALT: "Alt / Option", RALT: "右Alt",
  LGUI: "Cmd / Win", LEFT_COMMAND: "Cmd / Win", RGUI: "右Cmd / Win",
  K_VOL_UP: "音量を上げる", K_VOL_DN: "音量を下げる", K_MUTE: "消音", K_PLAY_PAUSE: "再生 / 一時停止", K_NEXT: "次の曲", K_PREV: "前の曲",
};

// What a keycode prints on a keycap. ZMK's names read fine once you know them
// and are opaque before that: DLLR, ASTRK and LBRC are "$", "*" and "{" to
// anyone who has ever looked at a keyboard.
const PRETTY = {
  TAB: "Tab", ENTER: "⏎", BSPC: "⌫", DELETE: "Del", ESCAPE: "Esc", ESC: "Esc", SPACE: "␣", CAPS: "Caps",
  UP_ARROW: "↑", DOWN_ARROW: "↓", LEFT_ARROW: "←", RIGHT_ARROW: "→", UP: "↑", DOWN: "↓", LEFT: "←", RIGHT: "→",
  LSHFT: "⇧", RSHFT: "右⇧", LEFT_CONTROL: "Ctrl", LCTRL: "Ctrl", RCTRL: "右Ctrl", LALT: "Alt", RALT: "右Alt",
  LEFT_COMMAND: "⌘", LGUI: "⌘", RGUI: "右⌘", MINUS: "-", EQUAL: "=", COMMA: ",", DOT: ".", SLASH: "/", FSLH: "/",
  BSLH: "\\", SEMI: ";", APOS: "'", GRAVE: "`", TILDE: "~", DOUBLE_QUOTES: '"', DQT: '"', QUESTION: "?", QMARK: "?",
  EXCL: "!", AT: "@", HASH: "#", DOLLAR: "$", DLLR: "$", PRCNT: "%", CARET: "^", AMPERSAND: "&", AMPS: "&", ASTRK: "*",
  LEFT_PARENTHESIS: "(", RIGHT_PARENTHESIS: ")", LPAR: "(", RPAR: ")", LEFT_BRACE: "{", RIGHT_BRACE: "}",
  LBRC: "{", RBRC: "}", LEFT_BRACKET: "[", RIGHT_BRACKET: "]", UNDER: "_", PLUS: "+", PIPE: "|", COLON: ":",
  LT: "<", GT: ">", HOME: "Home", END: "End", PAGE_UP: "PgUp", PAGE_DOWN: "PgDn", INSERT: "Ins",
  KP_DOT: ".", KP_SLASH: "/", KP_MULTIPLY: "*", KP_MINUS: "-", KP_PLUS: "+", KP_ENTER: "⏎",
  K_VOL_UP: "音量+", K_VOL_DN: "音量−", K_MUTE: "消音", K_PLAY_PAUSE: "⏯", K_NEXT: "⏭", K_PREV: "⏮",
};

// The same labels keyed by keycode VALUE rather than by name. ZMK has several
// aliases per key and the firmware reports whichever one its own reverse table
// prefers -- RET, SPC, LARW, CMMA -- which is rarely the spelling above.
// Matching on the string alone let those fall through to the raw name and get
// cut off mid-word on the keycap: BK…, LS…, CM…, DA….
const PRETTY_BY_VALUE = (() => {
  const map = new Map();
  for (const [name, label] of Object.entries(PRETTY)) {
    const value = KEYCODE_VALUES[name];
    if (value !== undefined && !map.has(value)) map.set(value, label);
  }
  return map;
})();
const FRIENDLY_BY_VALUE = (() => {
  const map = new Map();
  for (const [name, label] of Object.entries(FRIENDLY)) {
    const value = KEYCODE_VALUES[name];
    if (value !== undefined && !map.has(value)) map.set(value, label);
  }
  return map;
})();

const MOD_SYM = { C: "Ctrl", S: "⇧", A: "Alt", G: "⌘" };
const MOD_WORD = { C: "Ctrl", S: "Shift", A: "Alt", G: "Cmd" };
const MOUSE = { LCLK: "左クリック", MB1: "左クリック", RCLK: "右クリック", MB2: "右クリック", MCLK: "中クリック", MB3: "中クリック", MB4: "戻る", MB5: "進む" };
const MOUSE_SHORT = { LCLK: "左", MB1: "左", RCLK: "右", MB2: "右", MCLK: "中", MB3: "中", MB4: "戻る", MB5: "進む" };
const LAYER_MODE = {
  mo: { label: "押している間だけ", sub: "離すと元のレイヤーに戻る", tag: "押す間", wave: "M2 16h14v-12h22v12h24" },
  tog: { label: "押すたびにオン/オフ", sub: "もう一度押すと元に戻る", tag: "切替", wave: "M2 16h10v-12h22v12h28" },
  to: { label: "そのレイヤーに移る", sub: "戻るには別のキーで移る", tag: "移動", wave: "M2 16h10v-12h50" },
  sl: { label: "次の1回だけ", sub: "次のキーを押したら戻る", tag: "1回", wave: "M2 16h10v-12h14l4 12h32" },
};
const HOLDS = [
  { id: "LSHFT", label: "Shift" }, { id: "LCTRL", label: "Ctrl" },
  { id: "LALT", label: "Alt / Option" }, { id: "LGUI", label: "Cmd / Win" },
];
const HOLD_NAME = { LSHFT: "Shift", RSHFT: "Shift", LCTRL: "Ctrl", RCTRL: "Ctrl", LALT: "Alt", RALT: "Alt", LGUI: "Cmd", RGUI: "Cmd" };

const ICON = {
  kp: "M5 19l7-14 7 14M8 14h8",
  mt: "M12 4l7 8h-4v7H9v-7H5z",
  layer: "M12 3l9 5-9 5-9-5zM3 13l9 5 9-5",
  mkp: "M7 9a5 5 0 0 1 10 0v6a5 5 0 0 1-10 0zM12 4v5",
  bt: "M7 7l10 10-5 5V2l5 5L7 17",
  out: "M4 8h13l-3-3M20 16H7l3 3",
  trans: "M12 4v12M7 11l5 5 5-5M4 20h16",
  none: "M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zM6 6l12 12",
  edit: "M4 20h4L19 9l-4-4L4 16zM14 6l4 4",
  keyboard: "M3 7h18v11H3zM7 11h1M11 11h1M15 11h1M8 15h8",
  check: "M5 12l5 5L20 7",
  bolt: "M13 3L5 14h6l-1 7 8-11h-6z",
  usb: "M9 3v6M15 3v6M7 9h10v4a5 5 0 0 1-5 5 5 5 0 0 1-5-5zM12 18v3",
  close: "M6 6l12 12M18 6L6 18",
  trash: "M4 7h16M10 7V4h4v3M6 7l1 13h10l1-13",
  undo: "M9 14L4 9l5-5M4 9h11a5 5 0 0 1 0 10h-3",
  reset: "M4 4v6h6M4.5 15a8 8 0 1 0 2-8.5L4 10",
  cards: "M4 5h16v11H4zM2 19h20",
  // The three "h.01" segments are the paint wells: a zero-length stroke with
  // a round cap draws a dot, so the whole palette stays one path.
  palette: "M12 3a9 9 0 1 0 0 18c1.1 0 1.6-.8 1.6-1.6 0-.5-.2-.8-.4-1.1-.3-.3-.4-.7-.4-1.1 0-.9.7-1.6 1.6-1.6H16a5 5 0 0 0 5-5c0-4.2-4-7.6-9-7.6zM7.5 11.5h.01M10.5 7.5h.01M15.5 8.5h.01",
  warn: "M12 4l9 16H3zM12 10v4M12 17h.01",
  arrow: "M5 12h12M13 7l5 5-5 5",
  plus: "M12 5v14M5 12h14",
  download: "M12 4v11M7 10l5 5 5-5M4 19h16",
  upload: "M12 15V4M7 9l5-5 5 5M4 19h16",
  pointer: "M5 3l6 16 2.5-6.5L20 10z",
  scroll: "M12 4v16M8 8l4-4 4 4M8 16l4 4 4-4",
  auto: "M12 3v3M12 18v3M3 12h3M18 12h3M6 6l2 2M16 16l2 2M6 18l2-2M16 8l2-2",
  combo: "M4 6h6v6H4zM14 6h6v6h-6zM10 9h4M12 12v4M8 20h8",
  mousetab: "M12 4a8 8 0 1 0 0 16 8 8 0 0 0 0-16zM8.5 9.5a4 4 0 0 1 4-2.5",
  search: "",
};

// Traced from the handoff assets (assets/ZEN-logo.svg, assets/Zlogo.svg).
// Inline rather than <img> so the mark can take currentColor in dark mode.
const LOGO = {
  zen: { w: 344, h: 105, d: "M271.099 0C273.28 0 275.351 0.839805 276.918 2.40625L294.823 20.3105C296.39 21.8772 297.229 23.9494 297.229 26.1309V84.7822C297.23 89.0374 300.697 92.4527 304.9 92.4531H323.457C327.712 92.4529 331.128 88.9855 331.128 84.7822V6.27246C331.128 4.52282 331.807 2.99422 332.938 1.86328C334.012 0.788977 335.483 0.111252 337.121 0.0546875L337.129 0.0537109V0.0546875H337.347C340.793 0.0548878 343.619 2.82382 343.619 6.32715V78.3184L343.673 78.2646V78.8682C343.673 81.0495 342.833 83.1209 341.267 84.6875L323.362 102.592C321.796 104.158 319.724 104.998 317.543 104.998H310.869C308.688 104.998 306.616 104.158 305.05 102.592L287.145 84.6875C285.578 83.1209 284.738 81.0494 284.738 78.8682V20.2168C284.738 15.9613 281.271 12.545 277.067 12.5449H258.892C254.636 12.5451 251.22 16.0133 251.22 20.2168V98.7256C251.22 102.173 248.395 104.998 244.947 104.998C241.501 104.998 238.675 102.229 238.675 98.7256V26.1309C238.675 24.0047 239.514 21.8779 241.081 20.3105L258.985 2.40625C260.552 0.839631 262.624 7.82977e-05 264.806 0H271.099ZM78.7598 0.0546875C80.941 0.054801 83.0125 0.894348 84.5791 2.46094L102.483 20.3652C104.05 21.9319 104.89 24.0042 104.89 26.1855V32.8584C104.89 33.8096 104.721 34.7056 104.387 35.5986L104.388 35.5996C103.995 36.7209 103.324 37.7814 102.489 38.6719L84.5791 56.583C83.0125 58.1495 80.9409 58.9891 78.7598 58.9893H19.999C15.7437 58.9895 12.3283 62.4569 12.3281 66.6602V84.4893L12.4902 84.4355V84.7822C12.4904 89.0376 15.9587 92.4541 20.1621 92.4541H98.7256C102.17 92.4541 104.998 95.2212 104.998 98.6719C104.998 100.421 104.319 101.95 103.188 103.081C102.057 104.213 100.474 104.891 98.7803 104.891H26.1309C24.0047 104.891 21.8778 104.052 20.3105 102.484L2.40625 84.5791C0.839687 83.0125 9.78765e-05 80.941 0 78.7598V71.7607C0 71.6157 0.000590167 71.4317 0.0546875 71.2412V70.5127C0.0546863 70.487 0.0539169 70.4268 0.0644531 70.3633C0.0706053 70.3264 0.084808 70.2715 0.114258 70.2148C0.118269 70.1529 0.129143 70.0691 0.163086 69.9795V69.916C0.163086 69.8904 0.162336 69.8302 0.172852 69.7666C0.180674 69.7196 0.199577 69.6427 0.25 69.5713C0.358045 69.3056 0.465546 69.0894 0.569336 68.8818C0.627031 68.7665 0.684411 68.6656 0.738281 68.5713C0.787678 68.4848 0.832918 68.4024 0.878906 68.3125C0.893388 68.251 0.92146 68.1941 0.951172 68.1494C0.982351 68.1027 1.02435 68.0556 1.07715 68.0146C1.07947 68.0105 1.0812 68.0061 1.08301 68.0029C1.10358 67.9681 1.12851 67.9362 1.14941 67.9111C1.18057 67.8737 1.21572 67.8374 1.24219 67.8105C1.3708 67.5724 1.55089 67.3934 1.70117 67.2432C1.7743 67.17 1.84908 67.0826 1.93164 66.9863C2.01152 66.8931 2.10011 66.7905 2.18945 66.7012L20.0938 48.7959C21.6604 47.2293 23.7318 46.3897 25.9131 46.3896H84.6729C88.9282 46.3896 92.3443 42.922 92.3447 38.7188V20.1631C92.3447 15.9075 88.8764 12.4912 84.6729 12.4912H17.5576C15.9076 12.4911 14.4359 11.7513 13.3662 10.6816C12.2345 9.5499 11.5567 7.9666 11.5566 6.27246C11.5569 2.8821 14.2145 0.167754 17.5498 0.0546875H78.7598ZM217.981 46.3359C221.426 46.3359 224.254 49.1031 224.254 52.5537C224.254 54.3033 223.575 55.832 222.444 56.9629C221.313 58.0943 219.73 58.7724 218.036 58.7725H139.581C135.326 58.7726 131.909 62.2399 131.909 66.4434V84.6602L131.896 84.6982L131.855 84.8203C131.876 89.0579 135.336 92.454 139.526 92.4541H218.036C221.481 92.4543 224.309 95.2213 224.309 98.6719C224.309 100.421 223.63 101.95 222.499 103.081C221.367 104.213 219.784 104.891 218.09 104.891H145.495C143.369 104.891 141.242 104.052 139.675 102.484L121.771 84.5791C120.204 83.0125 119.364 80.941 119.364 78.7598V72.4658C119.364 70.2846 120.204 68.2131 121.771 66.6465L139.675 48.7422C141.241 47.1755 143.314 46.336 145.495 46.3359H217.981ZM218.09 0.0546875C221.536 0.0546875 224.362 2.8237 224.362 6.32715C224.362 8.07673 223.684 9.60545 222.553 10.7363C221.421 11.8677 219.838 12.5449 218.145 12.5449H139.635C135.379 12.5451 131.964 16.0134 131.964 20.2168V40.7803C131.964 42.5296 131.285 44.0577 130.154 45.1885C129.022 46.3201 127.439 46.998 125.745 46.998C122.299 46.9979 119.473 44.2288 119.473 40.7256V29.7451H119.364V26.1855C119.364 24.0594 120.203 21.9325 121.771 20.3652L139.675 2.46094C141.241 0.894286 143.314 0.0547345 145.495 0.0546875H218.09Z" },
  z: { w: 105, h: 105, d: "M78.7598 0C80.941 0.000113525 83.0125 0.839661 84.5791 2.40625L102.483 20.3105C104.05 21.8772 104.89 23.9494 104.89 26.1309V32.8037C104.89 33.755 104.721 34.6508 104.387 35.5439L104.388 35.5449C103.995 36.6663 103.324 37.7266 102.489 38.6172L84.5791 56.5283C83.0125 58.0949 80.941 58.9345 78.7598 58.9346H19.999C15.7437 58.9348 12.3283 62.4022 12.3281 66.6055V84.4346L12.4902 84.3809V84.7275C12.4902 88.9831 15.9586 92.3994 20.1621 92.3994H98.7256C102.17 92.3994 104.998 95.1665 104.998 98.6172C104.998 100.367 104.319 101.895 103.188 103.026C102.057 104.158 100.474 104.836 98.7803 104.836H26.1309C24.0046 104.836 21.8779 103.997 20.3105 102.43L2.40625 84.5244C0.839599 82.9577 3.91485e-06 80.8865 0 78.7051V71.7061C0 71.5609 0.000494462 71.3771 0.0546875 71.1865V70.458C0.0546863 70.4323 0.0538546 70.3722 0.0644531 70.3086C0.0706157 70.2716 0.0847057 70.2169 0.114258 70.1602C0.118274 70.0981 0.129047 70.0146 0.163086 69.9248V69.8613C0.163086 69.8357 0.162274 69.7756 0.172852 69.7119C0.180683 69.6649 0.199447 69.5881 0.25 69.5166C0.358096 69.2508 0.4655 69.0348 0.569336 68.8271C0.627087 68.7117 0.684365 68.611 0.738281 68.5166C0.787731 68.4301 0.832867 68.3478 0.878906 68.2578C0.893416 68.1962 0.921396 68.1394 0.951172 68.0947C0.982386 68.048 1.02427 68.0009 1.07715 67.96C1.07954 67.9557 1.08113 67.9514 1.08301 67.9482C1.10364 67.9134 1.12847 67.8816 1.14941 67.8564C1.18064 67.819 1.2157 67.7827 1.24219 67.7559C1.37085 67.5177 1.55086 67.3388 1.70117 67.1885C1.77435 67.1153 1.84901 67.028 1.93164 66.9316C2.01157 66.8384 2.10005 66.7359 2.18945 66.6465L20.0938 48.7412C21.6604 47.1746 23.7318 46.335 25.9131 46.335H84.6729C88.9283 46.335 92.3445 42.8675 92.3447 38.6641V20.1084C92.3447 15.8528 88.8764 12.4365 84.6729 12.4365H17.5576C15.9075 12.4365 14.4359 11.6967 13.3662 10.627C12.2344 9.49513 11.5566 7.91205 11.5566 6.21777C11.5569 2.82741 14.2145 0.113061 17.5498 0H78.7598Z" },
};

const ROLES = [
  { id: "kp", label: "文字・記号を入力", sub: "A、1、Enter、ショートカットなど" },
  { id: "mt", label: "長押しで別のキー", sub: "長押しでShift、短く押すと文字" },
  { id: "layer", label: "レイヤーを切り替え", sub: "Fnキーのような動き" },
  { id: "mkp", label: "マウスのボタン", sub: "クリック・戻る・進む" },
  { id: "bt", label: "Bluetoothの接続先", sub: "つなぐ機器を選ぶ" },
  { id: "out", label: "USB / Bluetooth 切替", sub: "キー入力の送り先" },
  { id: "trans", label: "下のレイヤーと同じ", sub: "このレイヤーでは何も決めない" },
  { id: "none", label: "何もしない", sub: "キーを無効にする" },
];

const MOUSE_BODY = "M7 9a5 5 0 0 1 10 0v6a5 5 0 0 1-10 0zM12 4v5M7 9h10";
const MOUSE_OPTS = [
  { v: "LCLK", label: "左クリック", fill: "M7.2 8.6a4.8 4.8 0 0 1 4.8-4.4V9H7.2z" },
  { v: "RCLK", label: "右クリック", fill: "M12 4.2a4.8 4.8 0 0 1 4.8 4.4V9H12z" },
  { v: "MCLK", label: "中クリック", fill: "M11 5h2v3h-2z" },
  { v: "MB4", label: "戻る", fill: "M2 12l3-2.5v5z" },
  { v: "MB5", label: "進む", fill: "M22 12l-3-2.5v5z" },
];
const BT_OPTS = [
  { v: "BT_SEL 0", label: "接続先 1" }, { v: "BT_SEL 1", label: "接続先 2" }, { v: "BT_SEL 2", label: "接続先 3" },
  { v: "BT_SEL 3", label: "接続先 4" }, { v: "BT_SEL 4", label: "接続先 5" },
  { v: "BT_NXT", label: "次の接続先へ", d: "M5 12h12M13 7l5 5-5 5" },
  { v: "BT_PRV", label: "前の接続先へ", d: "M19 12H7M11 7l-5 5 5 5" },
  { v: "BT_CLR", label: "今の登録を消す", d: ICON.trash },
  { v: "BT_CLR_ALL", label: "全部の登録を消す", d: ICON.trash + "M10 11v6M14 11v6" },
];
const OUT_OPTS = [
  { v: "OUT_USB", label: "USBへ送る", d: ICON.usb },
  { v: "OUT_BLE", label: "Bluetoothへ送る", d: ICON.bt },
  { v: "OUT_TOG", label: "押すたびに切替", d: ICON.out },
];

// --- Theme -----------------------------------------------------------------

const DEFAULT_ACCENT = "#F0512B";
const SWATCHES = ["#F0512B", "#1D2433", "#5B6B86", "#2F6FEB", "#1F9AA8", "#3E9D63", "#7A5AF0", "#D6457E"];
const PALETTE = {
  light: {
    page: "radial-gradient(55% 45% at 12% 8%, rgba(255,255,255,.95) 0%, rgba(255,255,255,0) 70%), radial-gradient(45% 40% at 92% 18%, rgba(196,210,226,.9) 0%, rgba(196,210,226,0) 70%), radial-gradient(50% 45% at 70% 95%, rgba(214,222,232,.9) 0%, rgba(214,222,232,0) 70%), linear-gradient(165deg, #EDF1F5 0%, #DCE3EB 100%)",
    bg: "#E6EBF1", surface: "rgba(255,255,255,.58)", fill: "rgba(255,255,255,.42)", fill2: "rgba(225,231,239,.72)",
    "line-soft": "rgba(21,27,43,.06)", line: "rgba(21,27,43,.09)", "line-strong": "rgba(21,27,43,.18)", mute: "#9AA3B3",
    ink: "#151B2B", ink2: "#4A5368", ink3: "#7E879A",
    "case-frame": "#9CA3AE", thumb: "#FFFFFF",
    "cap-orange": "#D9483B", "cap-orange-bd": "#C23D31", "cap-orange-edge": "#9E3127",
    "cap-edge": "rgba(21,27,43,.12)", "case-rim": "rgba(255,255,255,.95)",
    inv: "#151B2B", "inv-fg": "#FFFFFF", "inv-hover": "#29324A", "danger-tint": "rgba(226,78,27,.10)",
    acrylic: "linear-gradient(150deg, rgba(255,255,255,.62) 0%, rgba(255,255,255,.22) 55%, rgba(255,255,255,.38) 100%)",
    "acrylic-edge": "rgba(255,255,255,.28)",
    "glass-hi": "rgba(255,255,255,.85)", "glass-shadow": "rgba(28,40,64,.38)",
    bar: "linear-gradient(180deg, rgba(21,27,43,.82) 0%, rgba(21,27,43,.92) 100%)",
    "lcd-bg": "rgba(255,255,255,.45)", "lcd-bd": "rgba(21,27,43,.10)", "lcd-ink": "#2E3649",
    "accent-ink": "color-mix(in srgb, var(--accent) 80%, #000000)",
    "accent-tint": "color-mix(in srgb, var(--accent) 9%, rgba(255,255,255,.7))",
    "accent-soft": "color-mix(in srgb, var(--accent) 28%, rgba(255,255,255,.8))",
  },
  dark: {
    page: "radial-gradient(55% 45% at 12% 8%, rgba(88,104,140,.35) 0%, rgba(88,104,140,0) 70%), radial-gradient(45% 40% at 92% 22%, rgba(60,78,112,.45) 0%, rgba(60,78,112,0) 70%), linear-gradient(165deg, #121722 0%, #0B0E15 100%)",
    bg: "#10141D", surface: "rgba(34,41,58,.55)", fill: "rgba(255,255,255,.04)", fill2: "rgba(255,255,255,.07)",
    "line-soft": "rgba(255,255,255,.06)", line: "rgba(255,255,255,.10)", "line-strong": "rgba(255,255,255,.20)", mute: "#5F6A7E",
    ink: "#EEF2F8", ink2: "#B5BECD", ink3: "#8792A5",
    "case-frame": "#4B5363", thumb: "#EEF2F8",
    "cap-orange": "#C8443A", "cap-orange-bd": "#B03B32", "cap-orange-edge": "#6E2620",
    "cap-edge": "rgba(0,0,0,.45)", "case-rim": "rgba(255,255,255,.22)",
    inv: "#EEF2F8", "inv-fg": "#151B2B", "inv-hover": "#D5DCE7", "danger-tint": "rgba(226,78,27,.18)",
    acrylic: "linear-gradient(150deg, rgba(255,255,255,.12) 0%, rgba(255,255,255,.03) 55%, rgba(255,255,255,.08) 100%)",
    "acrylic-edge": "rgba(255,255,255,.05)",
    "glass-hi": "rgba(255,255,255,.12)", "glass-shadow": "rgba(0,0,0,.6)",
    bar: "linear-gradient(180deg, rgba(21,27,43,.86) 0%, rgba(21,27,43,.94) 100%)",
    "lcd-bg": "rgba(255,255,255,.06)", "lcd-bd": "rgba(255,255,255,.12)", "lcd-ink": "#D5DCE7",
    "accent-ink": "color-mix(in srgb, var(--accent) 60%, #FFFFFF)",
    "accent-tint": "color-mix(in srgb, var(--accent) 20%, transparent)",
    "accent-soft": "color-mix(in srgb, var(--accent) 42%, transparent)",
  },
};

// --- Keyboard colours (the "カラー" tab) -------------------------------------
//
// Purely cosmetic and purely local: this is the user telling the app what
// their own ZEN looks like, so the picture on screen matches the thing on the
// desk. None of it is ever sent to the keyboard.

const MODELS = {
  white: { label: "ホワイト", sub: "白い筐体＋グレーのバンパー", body: "#F4F4F2", bumper: "#9CA3AE", cap: "#F4F4F2", ball: "#F4F4F2" },
  black: { label: "ブラック", sub: "バンパーまですべて黒", body: "#1C1D20", bumper: "#1E1F22", cap: "#2A2B2E", ball: "#2A2B2E" },
};
// Twelve colours, the same twelve in the same order on every row, so the rows
// line up and a colour means the same thing wherever you meet it. The values
// differ per material: bumpers are saturated, balls glossy, keycaps the muted
// shades moulded resin actually comes in. Anything outside these twelve is
// what the colour picker and 最近使った色 are for.
const BUMPERS = [
  ["ホワイト", "#F1F1EE"], ["グレー", "#9CA3AE"], ["チャコール", "#5A5F68"], ["ブラック", "#1E1F22"],
  ["レッド", "#D9483B"], ["オレンジ", "#E8833A"], ["イエロー", "#E9C53A"], ["グリーン", "#7CCBAA"],
  ["スカイ", "#7EC3E8"], ["ブルー", "#3D7BD9"], ["パープル", "#8C6FD1"], ["ピンク", "#E58BB0"],
];
const BALLS = [
  ["ホワイト", "#F4F4F2"], ["グレー", "#A8ADB5"], ["チャコール", "#5E626A"], ["ブラック", "#2A2B2E"],
  ["レッド", "#D9483B"], ["オレンジ", "#E8833A"], ["イエロー", "#E9C53A"], ["グリーン", "#4FA36B"],
  ["スカイ", "#7EC3E8"], ["ブルー", "#3D7BD9"], ["パープル", "#8C6FD1"], ["ピンク", "#E58BB0"],
];
const CAPS = [
  ["ホワイト", "#F4F4F2"], ["グレー", "#D9DBDF"], ["チャコール", "#55585F"], ["ブラック", "#2A2B2E"],
  ["レッド", "#D9483B"], ["オレンジ", "#F6C9B4"], ["イエロー", "#EFE3B0"], ["グリーン", "#BFE3D2"],
  ["スカイ", "#C6DDF2"], ["ブルー", "#27324A"], ["パープル", "#D7CCF0"], ["ピンク", "#F2C4D5"],
];
// Painting one key is still choosing a keycap, so it is the same twelve.
const BRUSHES = CAPS;

// The four arrow keys ship with red caps, so they start painted.
const ARROW_KEYS = [36, 47, 48, 49];
const ARROW_CAP = "#D9483B";
const DEFAULT_LOOK = {
  model: "white", bumper: "#9CA3AE", cap: "#F4F4F2", ball: "#F4F4F2",
  paint: Object.fromEntries(ARROW_KEYS.map((i) => [i, ARROW_CAP])),
  brush: ARROW_CAP, reflect: true,
};

/** Plain (non-gamma) brightness, which is what "does black text read on this
 *  keycap?" actually wants -- the WCAG curve pushes mid greys the wrong way. */
function hexLum(hex) {
  const n = parseInt((hex || "#FFFFFF").slice(1), 16);
  return (0.2126 * ((n >> 16) & 255) + 0.7152 * ((n >> 8) & 255) + 0.0722 * (n & 255)) / 255;
}

/** A keycap painted @p hex, with its legend, edge and shadow derived from it. */
function capLook(hex, style) {
  const legend = hexLum(hex) < 0.55 ? "#FFFFFF" : "#151B2B";
  const muted = style === "trans" || style === "none";
  return {
    bg: hex,
    bs: "solid",
    bd: `color-mix(in srgb, ${hex} 86%, #000000)`,
    fg: muted ? `color-mix(in srgb, ${legend} 38%, transparent)` : legend,
    tagFg: `color-mix(in srgb, ${legend} 70%, transparent)`,
    shadow: `inset 0 -.55cqw 0 rgba(0,0,0,.06), 0 .45cqw 0 color-mix(in srgb, ${hex} 68%, #000000), 0 1.2cqw 1.6cqw -1cqw rgba(23,22,20,.35)`,
  };
}
const validHex = (h) => /^#?[0-9A-Fa-f]{6}$/.test((h || "").trim());
const normHex = (h) => "#" + h.trim().replace(/^#/, "").toUpperCase();

/** #RRGGBB -> [hue 0-360, saturation 0-1, value 0-1]. */
function hexToHsv(hex) {
  const n = parseInt(normHex(hex).slice(1), 16);
  const r = ((n >> 16) & 255) / 255, g = ((n >> 8) & 255) / 255, b = (n & 255) / 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b), d = max - min;
  let h = 0;
  if (d) {
    if (max === r) h = (g - b) / d + (g < b ? 6 : 0);
    else if (max === g) h = (b - r) / d + 2;
    else h = (r - g) / d + 4;
    h *= 60;
  }
  return [h, max ? d / max : 0, max];
}

function hsvToHex(h, s, v) {
  const channel = (n) => {
    const k = (n + h / 60) % 6;
    const x = v - v * s * Math.max(0, Math.min(k, 4 - k, 1));
    return Math.round(x * 255).toString(16).padStart(2, "0");
  };
  return ("#" + channel(5) + channel(3) + channel(1)).toUpperCase();
}

/** Black or white text on the accent, by relative luminance (WCAG formula). */
function onAccentFor(hex) {
  const n = parseInt(hex.slice(1), 16);
  const ch = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((v) => {
    v /= 255;
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  });
  const L = 0.2126 * ch[0] + 0.7152 * ch[1] + 0.0722 * ch[2];
  return L > 0.42 ? "#171614" : "#FFFFFF";
}

// --- Local storage ----------------------------------------------------------

const LS = {
  theme: "zen-configurator-theme",
  layerNames: "zen-configurator-layer-names",
  profiles: "zen-configurator-profiles",
  keymapPath: "zen-configurator-keymap-path",
  look: "zen-configurator-look",
  recents: "zen-configurator-recent-colours",
};

function lsGet(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw === null ? fallback : JSON.parse(raw);
  } catch (_error) {
    return fallback;
  }
}
function lsSet(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (_error) {
    /* private window / quota — the app still works, it just forgets */
  }
}

// --- Pointer settings -------------------------------------------------------

// The settings the firmware stores today, plus the ones the UI shows greyed
// out until the firmware gains them. Only POINTER_WIRE_KEYS are ever sent,
// counted as unsaved, or written to a preset.
// Auto-mouse shares a settings record with the pointer settings on the
// keyboard -- one save, one reset -- but has its own read/write commands, so
// it needs its own slice of the key list.
const AUTO_MOUSE_KEYS = ["autoMouse", "amBack", "amAfter"];
const POINTER_ONLY_KEYS = ["pointerSpeed", "scrollSpeed", "invertX", "invertY", "invertScroll", "angle"];
const POINTER_WIRE_KEYS = [...POINTER_ONLY_KEYS, ...AUTO_MOUSE_KEYS];
const POINTER_DEFAULTS = {
  pointerSpeed: 100, scrollSpeed: 100, invertX: false, invertY: false, invertScroll: false,
  // These have to match ZEN_POINTER_SETTINGS_*_DEFAULT: with nothing connected
  // the page is standing in for a keyboard, and showing auto-mouse as off when
  // the firmware ships it on would be a lie until the moment you plug in.
  angle: 0, inertia: false, glide: 50, autoMouse: true, amAfter: 0, amBack: 500,
};
// Settings versions the connected keyboard speaks.
const POINTER_VERSION_WITH_ROTATION = 2;

// ZMK's own default when a combo has no timeout-ms of its own.
const COMBO_DEFAULT_TIMEOUT_MS = 50;

// --- State ------------------------------------------------------------------

const theme0 = lsGet(LS.theme, {});
const state = {
  tab: "keymap",

  // Keymap. `keymap` is what the keyboard is doing right now (RAM when
  // connected); `saved` is what is in its flash. The difference is what the
  // save bar counts.
  keymap: sampleKeymap(),
  saved: sampleKeymap(),
  layer: 0,
  sel: 13,
  active: false,

  // Key editor working state (role + its arguments).
  ed: { kind: "kp", keyName: "A", hold: "LSHFT", mods: { ctrl: false, shift: false, alt: false, gui: false }, layerArg: 1, opt: "LCLK" },
  cat: "文字",
  search: "",
  advanced: false,

  pointer: { ...POINTER_DEFAULTS },
  savedPointer: { ...POINTER_DEFAULTS },
  pointerVersion: POINTER_VERSION_WITH_ROTATION,
  // Whether the connected keyboard answered GET_AUTO_MOUSE at all. Null means
  // nothing is connected, so the controls behave like the other offline ones.
  autoMouseSupported: null,

  // Combos live in config/keymap.keymap, not on the keyboard -- ZMK builds
  // them into a const table at compile time. null means no file is loaded.
  combos: null,
  savedCombos: null,
  comboSel: null,
  comboError: "",
  comboBusy: false,

  layerNames: lsGet(LS.layerNames, DEFAULT_LAYER_NAMES.slice()),
  renaming: false,

  // Device.
  client: null,
  liveKeymap: false,
  status: null,
  statusInterval: null,
  // The keyboard's Bluetooth profiles, or null when this firmware has none to
  // report (older build, or a split peripheral). Never guessed at locally:
  // which channels are registered is something only the keyboard knows.
  bleProfiles: null,
  btBusy: false,

  // UI chrome.
  themeOpen: false,
  presetsOpen: false,
  presetName: "",
  lastPreset: null,
  tip: false,
  toast: "",
  toastError: false,
  toastOut: false,
  btConfirm: false,
  busy: false,
  dark: !!theme0.dark,
  accent: validHex(theme0.accent) ? normHex(theme0.accent) : DEFAULT_ACCENT,
  hexDraft: (validHex(theme0.accent) ? normHex(theme0.accent) : DEFAULT_ACCENT).slice(1),
  hexInvalid: false,
  // Which colour the picker is open for ("accent" or a look-* row), and the
  // hue it is on. The hue is kept separately: a grey has none to read back.
  pick: null,
  pickHue: 0,
  recents: (lsGet(LS.recents, []) || []).filter(validHex).map(normHex).slice(0, 8),

  // What the user's own keyboard looks like. Cosmetic, this computer only.
  look: { ...DEFAULT_LOOK, ...lsGet(LS.look, {}) },

  // The startup animation. "run" while it plays, "" once it has left.
  splash: "run",
  splashRun: 0,
};

function saveLook() {
  lsSet(LS.look, state.look);
}
function setLook(patch) {
  state.look = { ...state.look, ...patch };
  saveLook();
  render();
}

// Picking a colour cannot go through render(), which replaces #app wholesale:
// the picker panel the pointer is holding would be destroyed on the first step
// of the drag. These two patch, in place, the few things a colour changes --
// the keyboard preview, each row's selected swatch and hex readout, and for the
// theme accent the CSS variables applyTheme() writes on :root.
const LOOK_PICK_KEY = {
  "look-bumper": "bumper",
  "look-ball": "ball",
  "look-cap": "cap",
  "look-brush": "brush",
};

/** Recolour the keyboard preview without rebuilding it.
 *
 * Rebuilding was the obvious way, but taking the preview out of the document
 * shortens the page for an instant and the browser clamps the scroll offset to
 * the shorter page -- putting the preview back does not undo that, so the page
 * crept upwards on every step of a drag and carried the picker out from under
 * the pointer. Nothing is removed here, so there is nothing to clamp.
 *
 * The case, bumper, plate and ball are all CSS variables on .board, so they
 * cost one attribute each. Only the keycaps are per-element.
 */
function repaintBoardColours() {
  const board = boardLook();
  for (const el of document.querySelectorAll(".board")) {
    el.setAttribute("style", board.style);
  }
  for (const el of document.querySelectorAll('.board .key[data-act="key"]')) {
    const index = Number(el.dataset.a);
    const binding = state.keymap[state.layer].bindings[index];
    // Only ever reached from the colour tab, where no key is selected.
    const look = keyLook(describe(binding), false, index, board.use);
    el.style.background = look.bg;
    el.style.color = look.fg;
    el.style.borderColor = look.bd;
    el.style.borderStyle = look.bs;
    el.style.boxShadow = look.shadow;
    const tag = el.querySelector(".key-tag");
    if (tag) tag.style.color = look.tagFg;
  }
}

function setLookLive(action, hex) {
  const key = LOOK_PICK_KEY[action];
  if (!key || !validHex(hex)) return;
  state.look = { ...state.look, [key]: normHex(hex) };
  saveLook();

  repaintBoardColours();

  for (const row of document.querySelectorAll(".sw-row[data-row]")) {
    const rowKey = LOOK_PICK_KEY[row.dataset.row];
    if (!rowKey) continue;
    const current = normHex(state.look[rowKey]);
    for (const sw of row.querySelectorAll(".sw")) {
      sw.classList.toggle("is-on", normHex(sw.dataset.a || "") === current);
    }
    const out = row.querySelector(".sw-hex");
    if (out) out.textContent = current;
  }
}

// Colours outside the twelve presets would otherwise be unreachable once you
// moved off them -- the hex readout told you what you had, but nothing let you
// get back to it. Keep the last few, and bound the list so the strip cannot
// grow without end.
const RECENTS_MAX = 8;
const PICK_PRESETS = {
  "look-bumper": BUMPERS, "look-ball": BALLS, "look-cap": CAPS, "look-brush": BRUSHES,
};

function isPreset(target, hex) {
  const v = normHex(hex);
  const list = PICK_PRESETS[target];
  if (list) return list.some(([, c]) => normHex(c) === v);
  return SWATCHES.some((c) => normHex(c) === v);
}

function rememberColour(hex) {
  const v = normHex(hex);
  state.recents = [v, ...state.recents.filter((c) => c !== v)].slice(0, RECENTS_MAX);
  lsSet(LS.recents, state.recents);
}

/** Close the picker, keeping the colour if it was not one of the presets.
    Called from every path that closes it, so a colour is never lost. */
function closePick() {
  if (!state.pick) return;
  const hex = pickTargetHex();
  if (validHex(hex) && !isPreset(state.pick, hex)) rememberColour(hex);
  state.pick = null;
}

/** Which colour the open picker is editing, and its current value. */
function pickTargetHex() {
  if (state.pick === "accent") return state.accent;
  const key = LOOK_PICK_KEY[state.pick];
  return key ? state.look[key] : "";
}

function renderPicker(target, hex) {
  const [, sat, val] = hexToHsv(hex);
  const hue = state.pickHue;
  return `<div class="pick" data-pick-panel="${target}">
      <div class="pick-sv" data-pick-sv style="--hue:${hsvToHex(hue, 1, 1)}">
        <span class="pick-dot" style="left:${sat * 100}%;top:${(1 - val) * 100}%;background:${hex}"></span>
      </div>
      <input class="pick-hue" type="range" min="0" max="360" step="1" value="${Math.round(hue)}" data-pick-hue />
      ${state.recents.length ? `<div class="pick-recent">
        <span class="l">最近使った色</span>
        <span class="r">${state.recents.map((c) => `<button type="button" class="${cls("sw sw-sm", normHex(c) === normHex(hex) && "is-on")}"
          style="background:${c}" title="${esc(c)}" ${act("pick-recent", c)}></button>`).join("")}</span>
      </div>` : ""}
      <div class="pick-foot">
        <span class="pick-chip" style="background:${hex}"></span>
        <span class="pick-val">${esc(hex)}</span>
        <button type="button" class="btn-sm" style="margin-left:auto" ${act("pick-close")}>完了</button>
      </div>
    </div>`;
}

/** Apply a colour from the picker, and move the picker's own marks to match.
    Like the slider drag, this never re-renders: the panel the pointer is
    holding has to survive the drag. */
function applyPick(hex) {
  if (!state.pick) return;
  if (state.pick === "accent") setAccentLive(hex);
  else setLookLive(state.pick, hex);

  const panel = document.querySelector("[data-pick-panel]");
  if (!panel) return;
  const [, sat, val] = hexToHsv(hex);
  const dot = panel.querySelector(".pick-dot");
  dot.style.left = `${sat * 100}%`;
  dot.style.top = `${(1 - val) * 100}%`;
  dot.style.background = hex;
  panel.querySelector(".pick-chip").style.background = hex;
  panel.querySelector(".pick-val").textContent = hex;
}

const clamp = (n, lo, hi) => Math.min(hi, Math.max(lo, n));

/** Swap part of the page out without the page jumping to the top.
 *
 * Taking an element out shortens the document for an instant; the browser
 * clamps the scroll offset to the shorter page, and putting the content back
 * does not undo that. Clicking a key threw you up to the header every time,
 * which made picking several in a row impossible.
 *
 * This repairs the damage after the fact, which is all a full re-render can
 * do. Where a smaller update will serve -- recolouring the preview, say --
 * changing the existing nodes avoids the problem rather than correcting it.
 */
function keepScroll(mutate) {
  const scrollY = window.scrollY;
  mutate();
  if (window.scrollY !== scrollY) window.scrollTo(0, scrollY);
  // Again next frame. WKWebView -- which is what the desktop app runs on, and
  // where this was reported -- can settle the scroll offset after layout
  // rather than during the swap, so the synchronous call above is not always
  // the last word. Only if it actually drifted, so this cannot fight a real
  // scroll, and a user managing one inside a single frame while a render is in
  // flight is not a case worth protecting.
  requestAnimationFrame(() => {
    if (window.scrollY !== scrollY) window.scrollTo(0, scrollY);
  });
}

function svHex(sv, event) {
  const rect = sv.getBoundingClientRect();
  const sat = clamp((event.clientX - rect.left) / rect.width, 0, 1);
  const val = 1 - clamp((event.clientY - rect.top) / rect.height, 0, 1);
  return hsvToHex(state.pickHue, sat, val);
}

function setAccentLive(hex) {
  if (!validHex(hex)) return;
  state.accent = normHex(hex);
  state.hexDraft = state.accent.slice(1);
  state.hexInvalid = false;
  applyTheme();

  for (const sw of document.querySelectorAll(".swatches button")) {
    sw.classList.toggle("is-on", normHex(sw.dataset.a || "") === state.accent);
  }
  const swatch = document.querySelector(".hex-swatch");
  if (swatch) swatch.style.background = state.accent;
  const field = document.querySelector("input[data-hex]");
  if (field && field !== document.activeElement) {
    field.value = state.hexDraft;
    field.classList.remove("is-bad");
  }
  const error = document.querySelector(".hex-error");
  if (error) error.remove();
}

function sampleKeymap() {
  return SAMPLE_LAYERS.map((bindings, i) => ({
    name: `layer_${i}`, label: `Layer ${i}`, layerId: i, bindings: bindings.slice(),
  }));
}
const copyKeymap = (km) => km.map((l) => ({ ...l, bindings: l.bindings.slice() }));

// --- Binding language -------------------------------------------------------

function unwrap(name) {
  const mods = [];
  let m;
  while ((m = (name || "").match(/^([LR])([CSAG])\((.+)\)$/))) {
    mods.push(m[2]);
    name = m[3];
  }
  return { mods, name };
}

/** Keycap-sized label for a keycode name: "BSPC" -> "⌫", "N1" -> "1". */
function pretty(name) {
  if (!name) return "";
  if (PRETTY[name]) return PRETTY[name];
  const byValue = PRETTY_BY_VALUE.get(KEYCODE_VALUES[name]);
  if (byValue) return byValue;
  let m = name.match(/^N(\d)$/);
  if (m) return m[1];
  m = name.match(/^KP_NUMBER_(\d)$/) || name.match(/^KP_N(\d)$/);
  if (m) return m[1];
  if (name.startsWith("KP_")) return name.slice(3);
  if (name.startsWith("K_")) return name.slice(2).replace(/_/g, " ");
  return name;
}

/** Spoken name, for tooltips and sentences. */
function friendly(name) {
  if (FRIENDLY[name]) return FRIENDLY[name];
  const byValue = FRIENDLY_BY_VALUE.get(KEYCODE_VALUES[name]);
  if (byValue) return byValue;
  const p = pretty(name);
  if (/^KP_/.test(name)) return "テンキーの " + p;
  return p;
}

/** Breaks a binding into what the keycap shows: {tag, main, style}. */
function describe(binding) {
  const b = (binding || "").trim();
  if (b === "&trans" || b === "") return { tag: "", main: "▽", style: "trans" };
  if (b === "&none") return { tag: "", main: "—", style: "none" };
  const parts = b.replace(/^&/, "").split(/\s+/);
  const beh = parts[0];
  const rest = parts.slice(1);
  if (beh === "kp") {
    const u = unwrap(rest.join(" "));
    return { tag: u.mods.map((c) => MOD_SYM[c]).join("+"), main: pretty(u.name), style: "key" };
  }
  if (beh === "mt") return { tag: "長押し" + (HOLD_NAME[rest[0]] || pretty(rest[0])), main: pretty(rest[1]), style: "special" };
  if (LAYER_MODE[beh]) return { tag: LAYER_MODE[beh].tag, main: "L" + rest[0], style: "special" };
  if (beh === "mkp") return { tag: "マウス", main: MOUSE_SHORT[rest[0]] || rest[0], style: "special" };
  if (beh === "bt") {
    if (rest[0] === "BT_SEL") return { tag: "接続先", main: String(Number(rest[1]) + 1), style: "special" };
    const map = { BT_NXT: "次へ", BT_PRV: "前へ", BT_CLR: "解除", BT_CLR_ALL: "全解除", BT_DISC: "切断" };
    return { tag: "BT", main: map[rest[0]] || rest[0].replace("BT_", ""), style: "special" };
  }
  if (beh === "out") return { tag: "出力", main: { OUT_USB: "USB", OUT_BLE: "BT", OUT_TOG: "切替" }[rest[0]] || rest[0], style: "special" };
  return { tag: beh.toUpperCase(), main: rest.join(" "), style: "special" };
}

/** One plain-Japanese sentence describing what pressing the key does. */
function sentence(binding) {
  const b = (binding || "").trim();
  if (b === "&trans" || b === "") return "下のレイヤーと同じ動きをします";
  if (b === "&none") return "押しても何も起きません";
  const parts = b.replace(/^&/, "").split(/\s+/);
  const beh = parts[0];
  const rest = parts.slice(1);
  if (beh === "kp") {
    const u = unwrap(rest.join(" "));
    const names = u.mods.map((c) => MOD_WORD[c]);
    names.push(friendly(u.name));
    return u.mods.length ? `「${names.join(" + ")}」を押したことになります` : `「${friendly(u.name)}」を入力します`;
  }
  if (beh === "mt") return `長く押すと「${HOLD_NAME[rest[0]] || rest[0]}」、短く押すと「${friendly(rest[1])}」になります`;
  if (beh === "mo") return `押している間だけ、レイヤー ${rest[0]} になります`;
  if (beh === "tog") return `押すたびに、レイヤー ${rest[0]} のオン/オフを切り替えます`;
  if (beh === "to") return `レイヤー ${rest[0]} に移ります`;
  if (beh === "sl") return `次の1キーだけ、レイヤー ${rest[0]} になります`;
  if (beh === "mkp") return `マウスの「${MOUSE[rest[0]] || rest[0]}」になります`;
  if (beh === "bt") {
    if (rest[0] === "BT_SEL") return `Bluetoothの接続先 ${Number(rest[1]) + 1} に切り替えます`;
    return {
      BT_NXT: "Bluetoothの次の接続先に切り替えます", BT_PRV: "Bluetoothの前の接続先に切り替えます",
      BT_CLR: "今のBluetooth接続先の登録を消します", BT_CLR_ALL: "すべてのBluetooth接続先の登録を消します",
      BT_DISC: "今のBluetooth接続を切ります",
    }[rest[0]] || rest.join(" ");
  }
  if (beh === "out") {
    return {
      OUT_USB: "キー入力の送り先をUSBにします", OUT_BLE: "キー入力の送り先をBluetoothにします",
      OUT_TOG: "押すたびにUSBとBluetoothを切り替えます",
    }[rest[0]] || rest.join(" ");
  }
  return b;
}

/** Current binding -> editor state (which role card is lit, and its arguments). */
function parseInto(binding) {
  const parts = (binding || "&trans").replace(/^&/, "").split(/\s+/);
  const beh = parts[0];
  const ed = {
    kind: beh, keyName: "A", hold: "LSHFT", layerArg: 0, opt: "LCLK",
    mods: { ctrl: false, shift: false, alt: false, gui: false },
  };
  if (beh === "kp") {
    const u = unwrap(parts.slice(1).join(" "));
    u.mods.forEach((c) => { ed.mods[{ C: "ctrl", S: "shift", A: "alt", G: "gui" }[c]] = true; });
    ed.keyName = u.name || "A";
  } else if (beh === "mt") {
    ed.hold = parts[1] || "LSHFT";
    ed.keyName = parts[2] || "A";
  } else if (LAYER_MODE[beh]) {
    ed.layerArg = Number(parts[1]) || 0;
  } else if (["mkp", "bt", "out"].includes(beh)) {
    ed.opt = parts.slice(1).join(" ");
  }
  return ed;
}

/** Editor state -> binding string. */
function composeBinding() {
  const e = state.ed;
  if (e.kind === "trans") return "&trans";
  if (e.kind === "none") return "&none";
  if (LAYER_MODE[e.kind]) return `&${e.kind} ${e.layerArg}`;
  if (e.kind === "mkp") return `&mkp ${e.opt}`;
  if (e.kind === "bt") return `&bt ${e.opt}`;
  if (e.kind === "out") return `&out ${e.opt}`;
  if (e.kind === "mt") return `&mt ${e.hold} ${e.keyName}`;
  let name = e.keyName;
  [["ctrl", "LC"], ["shift", "LS"], ["alt", "LA"], ["gui", "LG"]].forEach(([id, w]) => {
    if (e.mods[id]) name = `${w}(${name})`;
  });
  return `&kp ${name}`;
}

// --- Device -----------------------------------------------------------------

// The notch takes itself away again after a few seconds, so a success message
// does not sit there until the next one replaces it. An error stays: it is
// the only record of what went wrong, and reading it is the point.
let toastHideTimer = null;
let toastOutTimer = null;
function toast(message, isError) {
  state.toast = message;
  state.toastError = !!isError;
  state.toastOut = false;
  clearTimeout(toastHideTimer);
  clearTimeout(toastOutTimer);
  if (!message || isError) return;
  toastOutTimer = setTimeout(() => { state.toastOut = true; render(); }, 3000);
  toastHideTimer = setTimeout(() => { state.toast = ""; state.toastOut = false; render(); }, 3300);
}

async function connect() {
  if (!activeTransportClass()) {
    toast("このブラウザはWeb Serialに対応していません（Chrome / Edge をお使いください）", true);
    render();
    return;
  }
  state.busy = true;
  render();
  try {
    state.client = await ZenConfigClient.requestAndOpen();

    // A split peripheral answers GET_KEYMAP_META with "not supported" — it
    // genuinely has no local keymap. That is not a connection failure:
    // pointer settings and status still work, which is exactly what you want
    // when the halves are not talking to each other.
    try {
      const meta = await state.client.getKeymapMeta();
      if (meta.keyPositionCount !== POS.length) {
        console.warn(`key position count mismatch: device ${meta.keyPositionCount}, UI ${POS.length}`);
      }
      await readKeymap();
      state.liveKeymap = true;
      state.layer = 0;
      state.active = false;
    } catch (error) {
      console.warn("no keymap on this device, continuing without one:", error);
      state.liveKeymap = false;
      state.active = false;
    }

    const pointer = await state.client.getPointerSettings();
    state.pointerVersion = pointer.version;
    state.pointer = { ...POINTER_DEFAULTS, ...fromDeviceSettings(pointer) };

    try {
      Object.assign(state.pointer, fromAutoMouseSettings(await state.client.getAutoMouse()));
      state.autoMouseSupported = true;
    } catch (_error) {
      state.autoMouseSupported = false;
    }

    state.savedPointer = { ...state.pointer };

    try {
      state.status = await state.client.getStatus();
    } catch (_error) {
      state.status = null; // older firmware without GET_STATUS — non-fatal
    }
    await refreshBleProfiles();
    startStatusPolling();

    toast(state.liveKeymap
      ? "キーボードから今の設定を読み込みました"
      : "接続しました（この個体はキーマップを持ちません・左手側）");
  } catch (error) {
    console.error(error);
    state.client = null;
    toast(`接続できませんでした: ${error.message}`, true);
  }
  state.busy = false;
  render();
}

/** The firmware-backed subset of a pointer-settings object, in app field
 * names. Keys the source does not have are left out, so a preset saved before
 * a field existed does not overwrite that field with undefined. */
function pickWire(settings) {
  const out = {};
  for (const k of POINTER_WIRE_KEYS) {
    if (settings[k] !== undefined) out[k] = settings[k];
  }
  return out;
}

/** App field names -> the shape protocol.js puts on the wire. */
function toDeviceSettings() {
  const p = state.pointer;
  return {
    version: state.pointerVersion,
    pointerSpeed: p.pointerSpeed,
    scrollSpeed: p.scrollSpeed,
    invertX: p.invertX,
    invertY: p.invertY,
    invertScroll: p.invertScroll,
    rotationDegrees: p.angle,
  };
}

/** What the keyboard reported -> app field names. */
function fromDeviceSettings(settings) {
  return {
    pointerSpeed: settings.pointerSpeed,
    scrollSpeed: settings.scrollSpeed,
    invertX: settings.invertX,
    invertY: settings.invertY,
    invertScroll: settings.invertScroll,
    angle: settings.rotationDegrees ?? 0,
  };
}

/** App field names -> the shape protocol.js puts on the wire for auto-mouse. */
function toAutoMouseSettings() {
  return {
    version: state.pointerVersion,
    enabled: state.pointer.autoMouse,
    timeoutMs: state.pointer.amBack,
    idleMs: state.pointer.amAfter,
  };
}

function fromAutoMouseSettings(settings) {
  return {
    autoMouse: settings.enabled,
    amBack: settings.timeoutMs,
    amAfter: settings.idleMs,
  };
}

/** Can auto-mouse be set right now? Firmware predating it answers "unknown
 * command"; with nothing connected the controls stay live like the rest. */
function autoMouseSupported() {
  return !state.client || state.autoMouseSupported === true;
}

/** Can the trackball angle be set right now? Older firmware has no such
 * setting; with nothing connected there is nothing to say otherwise, so the
 * control stays live and behaves like the rest of the offline settings. */
function angleSupported() {
  return !state.client || state.pointerVersion >= POINTER_VERSION_WITH_ROTATION;
}

async function readKeymap() {
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
  state.saved = copyKeymap(layers);
  if (state.layer >= layers.length) state.layer = 0;
  if (state.layerNames.length < layers.length) {
    state.layerNames = state.layerNames.concat(Array(layers.length - state.layerNames.length).fill(""));
  }
}

async function disconnect() {
  stopStatusPolling();
  try {
    await state.client?.close();
  } catch (error) {
    console.error(error);
  }
  state.client = null;
  state.liveKeymap = false;
  state.status = null;
  state.bleProfiles = null;
  state.keymap = sampleKeymap();
  state.saved = sampleKeymap();
  state.pointer = { ...POINTER_DEFAULTS };
  state.savedPointer = { ...POINTER_DEFAULTS };
  state.pointerVersion = POINTER_VERSION_WITH_ROTATION;
  state.autoMouseSupported = null;
  state.layer = 0;
  state.active = false;
  toast("キーボードとの接続を切りました");
  render();
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
    if (!state.client) return stopStatusPolling();
    if (state.busy) return;
    try {
      state.status = await state.client.getStatus();
      if (state.bleProfiles) state.bleProfiles = await state.client.getBleProfiles();
      render();
    } catch (_error) {
      // Transient read failure — keep showing the last known status.
    }
  }, 20000);
}

/** Write one binding: to the keyboard's RAM when connected, else in-page. */
async function writeBinding(bindingString) {
  const layer = state.keymap[state.layer];
  const index = state.sel;
  const trimmed = (bindingString || "").trim() || "&trans";

  if (state.client && !state.liveKeymap) {
    toast("この個体はキーマップを持たないため編集できません（左手側）", true);
    render();
    return;
  }

  if (state.client && state.liveKeymap) {
    const encoded = encodeBinding(trimmed);
    if (!encoded) {
      toast(`この設定はまだキーボードへの書き込みに対応していません: ${trimmed}`, true);
      render();
      return;
    }
    try {
      await state.client.setBinding(layer.layerId, index, encoded.name, encoded.param1, encoded.param2);
      layer.bindings[index] = decodeBinding(encoded.name, encoded.param1, encoded.param2);
    } catch (error) {
      toast(error.message, true);
      render();
      return;
    }
  } else {
    layer.bindings[index] = trimmed;
  }
  render();
}

/** Change pointer settings: pushed to the keyboard immediately when connected.
 * Only the half of the record the change actually touches is sent. */
async function writePointer(patch) {
  Object.assign(state.pointer, patch);
  if (state.client) {
    const touchesAutoMouse = Object.keys(patch).some((k) => AUTO_MOUSE_KEYS.includes(k));
    try {
      if (touchesAutoMouse) await state.client.setAutoMouse(toAutoMouseSettings());
      else await state.client.setPointerSettings(toDeviceSettings());
    } catch (error) {
      toast(error.message, true);
    }
  }
  render();
}

/** Push the whole of state.pointer, for the paths that replace all of it at
 * once (discarding, loading a preset) rather than nudging one field. */
async function pushAllSettings() {
  if (!state.client) return;
  await state.client.setPointerSettings(toDeviceSettings());
  if (state.autoMouseSupported) await state.client.setAutoMouse(toAutoMouseSettings());
}

/** Re-read the profile table. A firmware that does not have the command
 * answers "unknown command"; a peripheral answers "not supported". Either way
 * the tab falls back to explaining that rather than showing invented rows. */
async function refreshBleProfiles() {
  if (!state.client) {
    state.bleProfiles = null;
    return;
  }
  try {
    state.bleProfiles = await state.client.getBleProfiles();
  } catch (_error) {
    state.bleProfiles = null;
  }
}

/** Bluetooth actions take effect on the keyboard the moment they are clicked
 * -- they are not part of what the save bar tracks -- so they are serialised
 * behind a busy flag rather than letting a second click race the first. */
async function bleAction(action, index) {
  if (!state.client || state.btBusy) return;
  state.btBusy = true;
  render();
  try {
    state.bleProfiles = await state.client.bleAction(action, index);
    state.status = await state.client.getStatus();
  } catch (error) {
    toast(error.message, true);
    await refreshBleProfiles();
  }
  state.btBusy = false;
  render();
}

function keyChangeCount() {
  let n = 0;
  state.keymap.forEach((l, li) => {
    const saved = state.saved[li];
    if (!saved) return;
    l.bindings.forEach((b, i) => { if (b !== saved.bindings[i]) n++; });
  });
  return n;
}
function pointerChangeCount() {
  return POINTER_WIRE_KEYS.filter((k) => state.pointer[k] !== state.savedPointer[k]).length;
}

async function saveToKeyboard() {
  if (!state.client) return;
  state.busy = true;
  render();
  try {
    if (state.liveKeymap && keyChangeCount() > 0) {
      await state.client.saveKeymap();
      state.saved = copyKeymap(state.keymap);
    }
    if (pointerChangeCount() > 0) {
      await state.client.savePointerSettings();
      state.savedPointer = { ...state.pointer };
    }
    toast("キーボードに保存しました");
  } catch (error) {
    toast(error.message, true);
  }
  state.busy = false;
  render();
}

async function discardChanges() {
  state.busy = true;
  render();
  try {
    if (state.client) {
      if (state.liveKeymap && keyChangeCount() > 0) {
        await state.client.discardKeymap();
        await readKeymap();
      }
      if (pointerChangeCount() > 0) {
        state.pointer = { ...state.pointer, ...pickWire(state.savedPointer) };
        await pushAllSettings();
      }
      toast("キーボードに保存されている設定に戻しました");
    } else {
      state.keymap = copyKeymap(state.saved);
      state.pointer = { ...state.savedPointer };
      toast("変更を取り消しました");
    }
    state.ed = parseInto(state.keymap[state.layer].bindings[state.sel]);
  } catch (error) {
    toast(error.message, true);
  }
  state.busy = false;
  render();
}

async function resetPointer() {
  if (state.client) {
    state.busy = true;
    render();
    try {
      const fresh = await state.client.resetPointerSettings();
      state.pointer = { ...state.pointer, ...fromDeviceSettings(fresh) };
      /* RESET_POINTER clears the whole record, auto-mouse included, so read
       * back what the keyboard now holds rather than assuming. */
      if (state.autoMouseSupported) {
        Object.assign(state.pointer, fromAutoMouseSettings(await state.client.getAutoMouse()));
      }
      toast("マウス操作をはじめの設定に戻しました");
    } catch (error) {
      toast(error.message, true);
    }
    state.busy = false;
  } else {
    state.pointer = { ...state.pointer, ...pickWire(POINTER_DEFAULTS) };
  }
  render();
}

// --- Combos: the keymap file ------------------------------------------------
//
// ZMK compiles combos into a const table from devicetree, so there is nothing
// to send over the wire -- the app edits config/keymap.keymap and the firmware
// is rebuilt from it. That means this is the one tab where the three-stage
// save bar does not apply, and the one place the app writes to a file someone
// also edits by hand.

/** The desktop shell can reach the filesystem; a browser tab cannot. */
function canEditCombos() {
  return typeof window !== "undefined" && typeof window.__TAURI__?.core?.invoke === "function";
}

const keymapPath = () => lsGet(LS.keymapPath, null);

async function pickKeymapFile() {
  const { open } = window.__TAURI__.dialog;
  const chosen = await open({
    title: "keymap.keymap を選んでください",
    multiple: false,
    directory: false,
    filters: [{ name: "ZMK keymap", extensions: ["keymap"] }],
  });
  if (!chosen) return null;
  const path = typeof chosen === "string" ? chosen : chosen.path;
  lsSet(LS.keymapPath, path);
  return path;
}

/** Attaches a uid to each parsed combo so selection survives edits and
 * reordering -- the file itself has no stable id. */
let comboUid = 0;
function withUids(combos) {
  return combos.map((c) => ({ ...c, uid: ++comboUid, keyPositions: c.keyPositions.slice() }));
}
const copyCombos = (combos) => combos.map((c) => ({ ...c, keyPositions: c.keyPositions.slice() }));

async function loadCombos({ pick = false } = {}) {
  if (!canEditCombos()) return;
  state.comboBusy = true;
  state.comboError = "";
  render();
  try {
    const path = pick ? await pickKeymapFile() : keymapPath();
    if (!path) {
      state.comboBusy = false;
      render();
      return;
    }
    const text = await window.__TAURI__.core.invoke("read_keymap", { path });
    const parsed = parseCombos(text);
    state.combos = withUids(parsed.combos);
    state.savedCombos = copyCombos(state.combos);
    state.comboSel = null;
  } catch (error) {
    state.comboError = String(error.message ?? error);
    state.combos = null;
  }
  state.comboBusy = false;
  render();
}

async function saveCombos() {
  if (!canEditCombos() || !state.combos) return;
  const path = keymapPath();
  if (!path) return;
  state.comboBusy = true;
  render();
  try {
    const { invoke } = window.__TAURI__.core;
    // Re-read rather than keeping the file in memory: it may well have been
    // edited by hand since it was loaded, and only the combos block is ours.
    const text = await invoke("read_keymap", { path });
    await invoke("write_keymap", { path, contents: writeCombos(text, state.combos) });
    state.savedCombos = copyCombos(state.combos);
    toast("keymap.keymap に書き出しました。ビルドして書き込むと反映されます");
  } catch (error) {
    toast(String(error.message ?? error), true);
  }
  state.comboBusy = false;
  render();
}

/** Combos shown on a layer. No `layers` property means every layer, which is
 * what ZMK does, so those show up everywhere rather than being hidden. */
function combosOnLayer(layer) {
  if (!state.combos) return [];
  return state.combos.filter((c) => c.layers === null || c.layers.includes(layer));
}

function comboChanged(combo) {
  const before = (state.savedCombos ?? []).find((c) => c.uid === combo.uid);
  if (!before) return true;
  return JSON.stringify({ ...before, uid: 0 }) !== JSON.stringify({ ...combo, uid: 0 });
}

function comboChangeCount() {
  if (!state.combos || !state.savedCombos) return 0;
  const gone = state.savedCombos.filter((c) => !state.combos.some((x) => x.uid === c.uid)).length;
  return state.combos.filter(comboChanged).length + gone;
}

// --- Presets (this computer only) -------------------------------------------

function loadPresets() {
  const list = lsGet(LS.profiles, []);
  return Array.isArray(list) ? list : [];
}

function presetMeta(preset) {
  if (!preset.savedAt) return "保存済み";
  const d = new Date(preset.savedAt);
  if (Number.isNaN(d.getTime())) return "保存済み";
  return `${d.getMonth() + 1}月${d.getDate()}日に保存`;
}

function snapshot() {
  return {
    formatVersion: 1,
    keymap: state.keymap.map((l) => ({ name: l.name, layerId: l.layerId, bindings: l.bindings.slice() })),
    pointer: pickWire(state.pointer),
  };
}

function addPreset() {
  const list = loadPresets();
  const name = state.presetName.trim() || `プリセット ${list.length + 1}`;
  const entry = { name, savedAt: Date.now(), data: snapshot() };
  const at = list.findIndex((p) => p.name === name);
  if (at >= 0) list[at] = entry;
  else list.push(entry);
  lsSet(LS.profiles, list);
  state.presetName = "";
  state.lastPreset = name;
  toast(`「${name}」をこのパソコンに保存しました`);
  render();
}

function deletePreset(name) {
  lsSet(LS.profiles, loadPresets().filter((p) => p.name !== name));
  render();
}

/**
 * Apply a {keymap, pointer} snapshot. Writes are best-effort per binding: one
 * the wire protocol cannot represent is skipped rather than aborting the whole
 * restore. Nothing is written to flash — the save bar still gates that, so a
 * bad restore can be undone with 元に戻す.
 */
async function applySnapshot(data, label) {
  state.busy = true;
  render();
  try {
    if (state.client && state.liveKeymap) {
      // Match layers positionally; layerId is only meaningful after a real
      // read and can be undefined for every layer in an old backup file.
      for (let li = 0; li < data.keymap.length; li++) {
        const from = data.keymap[li];
        const to = state.keymap[li];
        if (!to) continue;
        const count = Math.min(from.bindings.length, to.bindings.length);
        for (let i = 0; i < count; i++) {
          if (from.bindings[i] === to.bindings[i]) continue;
          const encoded = encodeBinding(from.bindings[i]);
          if (!encoded) continue;
          await state.client.setBinding(to.layerId, i, encoded.name, encoded.param1, encoded.param2);
          to.bindings[i] = decodeBinding(encoded.name, encoded.param1, encoded.param2);
        }
      }
    } else if (!state.client) {
      data.keymap.forEach((from, i) => {
        if (state.keymap[i]) state.keymap[i].bindings = from.bindings.slice();
      });
    }
    // else: a keymap-less peripheral — skip the keymap, still apply pointer.

    if (data.pointer) {
      Object.assign(state.pointer, pickWire(data.pointer));
      await pushAllSettings();
    }
    state.ed = parseInto(state.keymap[state.layer].bindings[state.sel]);
    toast(`${label}を読み込みました${state.client ? "（まだキーボードには保存していません）" : ""}`);
  } catch (error) {
    toast(`読み込みに失敗しました: ${error.message}`, true);
  }
  state.busy = false;
  render();
}

function exportFile() {
  const blob = new Blob([JSON.stringify(snapshot(), null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `zen-configurator-backup-${Date.now()}.json`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
  state.presetsOpen = false;
  toast("設定をファイルに書き出しました");
  render();
}

function importFile() {
  const input = document.getElementById("import-file");
  input.onchange = async () => {
    const file = input.files[0];
    input.value = "";
    if (!file) return;
    try {
      const text = await file.text();
      const data = JSON.parse(text);
      if (!data || !Array.isArray(data.keymap)) throw new Error("ファイルの形式が正しくありません");
      await applySnapshot(data, "ファイル");
    } catch (error) {
      toast(`読み込みに失敗しました: ${error.message}`, true);
      render();
    }
  };
  state.presetsOpen = false;
  render();
  input.click();
}

// --- Rendering helpers ------------------------------------------------------

const esc = (text) => String(text ?? "")
  .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
  .replace(/"/g, "&quot;").replace(/'/g, "&#39;");

function svg(d, size = 16, sw = 2, extra = "") {
  return `<svg viewBox="0 0 24 24" width="${size}" height="${size}" fill="none" stroke="currentColor" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round" ${extra}><path d="${d}"/></svg>`;
}
const cls = (...names) => names.filter(Boolean).join(" ");
const act = (name, a, b) => `data-act="${name}"${a !== undefined ? ` data-a="${esc(a)}"` : ""}${b !== undefined ? ` data-b="${esc(b)}"` : ""}`;

function pendingNotice(what) {
  return `<div class="notice">${svg(ICON.warn, 15, 2)}<span><b>${esc(what)}はまだキーボード側が対応していません。</b>
    画面の見た目だけ先に用意してあります。ファームウェアが対応したら、ここから設定できるようになります。</span></div>`;
}

// --- Slider definitions -----------------------------------------------------
//
// One table so the row markup, the live readout on drag and the device write
// all stay in step.
const SLIDERS = {
  pointerSpeed: {
    min: 20, max: 300, step: 5,
    fmt: (v) => `${v}%`, word: (v) => (v < 80 ? "ゆっくり" : v <= 125 ? "ふつう" : v <= 190 ? "速い" : "とても速い"),
  },
  scrollSpeed: {
    min: 20, max: 300, step: 5,
    fmt: (v) => `${v}%`, word: (v) => (v < 80 ? "ゆっくり" : v <= 125 ? "ふつう" : v <= 190 ? "速い" : "とても速い"),
  },
  angle: {
    min: -45, max: 45, step: 1,
    fmt: (v) => `${v > 0 ? "+" : ""}${v}°`, word: (v) => (v === 0 ? "まっすぐ" : v < 0 ? "左に傾ける" : "右に傾ける"),
  },
  glide: {
    min: 10, max: 100, step: 5,
    fmt: (v) => `${v}%`, word: (v) => (v <= 35 ? "短め" : v <= 70 ? "普通" : "長め"),
  },
  // Ranges mirror ZEN_POINTER_SETTINGS_AUTO_MOUSE_* in zen_pointer_settings.h;
  // the keyboard rejects a payload outside them.
  amAfter: {
    min: 0, max: 500, step: 10,
    fmt: (v) => `${v} ms`, word: (v) => (v <= 60 ? "短め" : v <= 150 ? "ふつう" : "長め"),
  },
  amBack: {
    min: 100, max: 2000, step: 50,
    fmt: (v) => `${(v / 1000).toFixed(2)} 秒`, word: (v) => (v <= 350 ? "すぐ" : v <= 700 ? "ふつう" : "ゆっくり"),
  },
  comboTerm: {
    min: 10, max: 200, step: 5,
    fmt: (v) => `${v} ms`, word: (v) => (v <= 35 ? "誤爆しにくい" : v <= 80 ? "ふつう" : "押しやすい"),
  },
};

/** Where the thumb sits, 0-100%, so CSS can paint the track either side. */
function sliderPct(key, value) {
  const s = SLIDERS[key];
  const pct = ((Number(value) - s.min) / (s.max - s.min)) * 100;
  return `${Math.max(0, Math.min(100, pct))}%`;
}

function sliderHtml(key, value) {
  const s = SLIDERS[key];
  return `<div class="slider">
      <input type="range" min="${s.min}" max="${s.max}" step="${s.step}" value="${value}"
        style="--p:${sliderPct(key, value)}" data-slider="${key}" data-f="slider-${key}" />
    </div>
    <div class="readout" data-readout="${key}">
      <div class="v">${esc(s.fmt(value))}</div>
      <div class="w">${esc(s.word(value))}</div>
    </div>`;
}

function settingRow({ title, desc, dirty, first, disabled, control }) {
  return `<div class="${cls("row", first && "first", disabled && "pending")}">
      <div class="row-label">
        <div class="t">${esc(title)}${dirty ? '<span class="dot dot-inline"></span>' : ""}</div>
        <div class="s">${desc}</div>
      </div>
      <div class="row-ctl">${control}</div>
    </div>`;
}

function switchHtml(on, action) {
  return `<button type="button" class="${cls("switch", on && "is-on")}" ${act(action)} aria-label="切り替え"><span></span></button>`;
}

// --- Render: header ---------------------------------------------------------

function batteries() {
  const s = state.status;
  if (!state.client || !s) return { left: null, right: null };
  if (s.role === "peripheral") return { left: s.localBattery, right: null };
  if (s.role === "central") return { left: s.peripheralBattery, right: s.localBattery };
  return { left: null, right: s.localBattery };
}

function batterySvg(pct) {
  const w = Math.round(15 * (pct ?? 0) / 100);
  // Accent everywhere, red only when it is actually about to die.
  const color = pct == null ? "var(--line)" : pct <= 20 ? "#D64521" : "var(--accent)";
  return `<svg viewBox="0 0 24 14" width="22" height="13">
      <rect x="1" y="1" width="19" height="12" rx="2.5" fill="none" stroke="var(--ink3)" stroke-width="1.4"/>
      <rect x="21" y="4.5" width="2" height="5" rx="1" fill="var(--ink3)"/>
      <rect x="3" y="3" width="${w}" height="8" rx="1.2" fill="${color}"/>
    </svg>`;
}

function renderHeader() {
  const connected = !!state.client;
  const s = state.status;
  const bat = batteries();
  const activeProfile = s && s.activeProfile != null ? s.activeProfile : -1;
  const isBle = s ? s.transport === "BLE" : false;
  // Which channels are registered is only known once the keyboard has told
  // us; without that table the dots say "in use" and nothing more.
  const table = state.bleProfiles;
  const bleDots = (table ? table.profiles : [0, 1, 2, 3, 4].map((index) => ({ index, bonded: false })))
    .map((p) => ({ n: p.index + 1, bonded: !!p.bonded, active: p.index === activeProfile }));

  const connCard = connected
    ? `<div class="conn-card glass">
        <div class="conn-seg">
          <span class="conn-icon">${svg(ICON.usb, 15, 2.1)}</span>
          <div>
            <div class="conn-label">このアプリと</div>
            <div class="conn-value ok">USBで接続中</div>
          </div>
        </div>
        <span class="conn-rule"></span>
        <div class="conn-seg">
          <div>
            <div class="conn-label">キー入力の送り先</div>
            ${isBle
              ? `<div class="conn-out">
                  <span style="color:var(--accent-ink)">${svg(ICON.bt, 13, 2.1)}</span>
                  <span class="conn-value">Bluetooth</span>
                  <div class="ble-dots">${bleDots.map((d) => `
                    <span class="${cls("ble-dot", d.active && "is-active", !d.active && d.bonded && "is-known")}" title="接続先 ${d.n}（${d.active ? "使用中" : d.bonded ? "登録済み" : "空き"}）">${d.n}</span>`).join("")}
                  </div>
                </div>`
              : `<div class="conn-out">
                  <span style="color:var(--accent-ink)">${svg(ICON.usb, 13, 2.1)}</span>
                  <span class="conn-value">${s ? "USBケーブル" : "—"}</span>
                </div>`}
          </div>
        </div>
        <span class="conn-rule"></span>
        <div class="conn-seg">
          <div>
            <div class="conn-label">電池</div>
            <div class="bat-list">
              <span class="bat"><span class="bat-side">左</span>${batterySvg(bat.left)}<span class="bat-pct">${bat.left == null ? "--" : bat.left + "%"}</span></span>
              <span class="bat"><span class="bat-side">右</span>${batterySvg(bat.right)}<span class="bat-pct">${bat.right == null ? "--" : bat.right + "%"}</span></span>
            </div>
          </div>
        </div>
      </div>`
    : `<div class="disconn-card">
        <svg viewBox="0 0 64 28" width="52" height="23" fill="none" stroke="var(--ink3)" stroke-width="1.6" stroke-linejoin="round">
          <rect x="2" y="4" width="24" height="18" rx="4"/><rect x="38" y="4" width="24" height="18" rx="4"/>
          <circle cx="52" cy="17" r="3" fill="var(--line)" stroke="none"/><path d="M50 4V1M56 1h-6" stroke="var(--accent)"/>
        </svg>
        <div style="min-width:0">
          <div class="disconn-title">キーボードがつながっていません</div>
          <div class="disconn-sub">右手側（トラックボールのある方）をUSBケーブルでパソコンにつないでください</div>
        </div>
      </div>`;

  return `<header class="hdr">
      <div class="brand">${logoSvg("zen", 15)}<span>Configurator</span></div>
      <div class="hdr-center">${connCard}</div>
      <div class="hdr-actions">
        <div class="pop-wrap">
          <button type="button" class="${cls("icon-btn", state.themeOpen && "is-open")}" ${act("theme-toggle")} title="表示の設定" aria-label="表示の設定">${svg(ICON.palette, 17, 1.9)}</button>
          ${state.themeOpen ? renderThemePanel() : ""}
        </div>
        <div class="pop-wrap">
          <button type="button" class="${cls("btn", state.presetsOpen && "is-open")}" ${act("presets-toggle")}>
            ${svg(ICON.cards, 15, 1.9)}プリセット${svg("M6 9l6 6 6-6", 13, 2.2)}
          </button>
          ${state.presetsOpen ? renderPresetPanel() : ""}
        </div>
        <button type="button" class="${cls("btn", !connected && "btn-accent")}" ${act(connected ? "disconnect" : "connect")} ${state.busy ? "disabled" : ""}>
          ${svg(ICON.usb, 15, 2.1)}${connected ? "切断" : "キーボードをつなぐ"}
        </button>
      </div>
    </header>`;
}

function renderThemePanel() {
  return `<div class="pop pop-theme">
      <div class="pop-head">
        <span class="pop-title">表示の設定</span>
        <span class="pop-tag">このパソコンに保存</span>
        <button type="button" class="pop-close" ${act("theme-toggle")} aria-label="閉じる">${svg(ICON.close, 14, 2.2)}</button>
      </div>
      <div class="pop-body">
        <div class="pop-label">モード</div>
        <div class="seg">
          <button type="button" class="${cls(!state.dark && "is-on")}" ${act("set-dark", "0")}>
            ${svg("M12 4V2M12 22v-2M4 12H2M22 12h-2M5.6 5.6 4.2 4.2M19.8 19.8l-1.4-1.4M5.6 18.4l-1.4 1.4M19.8 4.2l-1.4 1.4M12 7a5 5 0 1 0 0 10 5 5 0 0 0 0-10z", 14)}ライト
          </button>
          <button type="button" class="${cls(state.dark && "is-on")}" ${act("set-dark", "1")}>
            ${svg("M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5z", 14)}ダーク
          </button>
        </div>
      </div>
      <div class="pop-section">
        <div class="pop-label">テーマカラー</div>
        <div class="swatches">
          ${SWATCHES.map((hex) => `<button type="button" class="${cls(hex === state.accent && "is-on")}" style="background:${hex}" title="${hex}" ${act("set-accent", hex)}></button>`).join("")}
        </div>
        <div class="hex-row">
          <button type="button" class="hex-swatch" style="background:${state.accent}" title="色を選ぶ" ${act("pick-open", "accent")}></button>
          <div class="hex-field">
            <span>#</span>
            <input type="text" value="${esc(state.hexDraft)}" maxlength="7" spellcheck="false" placeholder="F0512B"
              class="${cls(state.hexInvalid && "is-bad")}" data-hex data-f="hex" />
          </div>
          <button type="button" class="btn-sm" ${act("reset-accent")} title="はじめの色に戻す">初期値</button>
        </div>
        ${state.hexInvalid ? '<div class="hex-error">6けたのカラーコード（例：F0512B）を入力してください</div>' : ""}
        ${state.pick === "accent" ? renderPicker("accent", state.accent) : ""}
        <div class="theme-preview">
          <span class="lead">見え方</span>
          <span class="a">A</span>
          <span class="pill">選択中</span>
          <span class="solid">保存</span>
        </div>
      </div>
      <div class="pop-foot">
        <span class="lead">起動アニメーション</span>
        <button type="button" class="btn-ring" ${act("splash-replay")}>${svg(ICON.reset, 12)}もう一度見る</button>
      </div>
    </div>`;
}

function renderPresetPanel() {
  const presets = loadPresets();
  return `<div class="pop pop-presets">
      <div class="preset-intro">
        <div style="display:flex;align-items:center;gap:8px">
          ${svg(ICON.cards, 16, 1.9)}
          <span class="pop-title">プリセット</span>
          <span class="pop-tag">このパソコンに保存</span>
          <button type="button" class="pop-close" ${act("presets-toggle")} aria-label="閉じる">${svg(ICON.close, 14, 2.2)}</button>
        </div>
        <p>キー配置とマウス操作の設定をひとまとめにして、名前を付けて取っておけます。読み込んだ内容は、下の「キーボードに保存」を押すまでキーボードには記録されません。</p>
      </div>
      <div class="preset-list">
        ${presets.length === 0
          ? '<div style="font-size:12px;color:var(--ink3);padding:10px">まだプリセットはありません</div>'
          : presets.map((p) => `<div class="${cls("preset-row", p.name === state.lastPreset && "is-last")}">
              <div style="flex:1;min-width:0">
                <div style="display:flex;align-items:center;gap:6px">
                  <span class="preset-name">${esc(p.name)}</span>
                  ${p.name === state.lastPreset ? '<span class="preset-badge">最後に読み込み</span>' : ""}
                </div>
                <div class="preset-meta">${esc(presetMeta(p))}</div>
              </div>
              <button type="button" class="btn-sm" ${act("preset-apply", p.name)}>読み込む</button>
              <button type="button" class="preset-del" ${act("preset-delete", p.name)} title="削除" aria-label="削除">${svg(ICON.trash + "M10 11v6M14 11v6", 14)}</button>
            </div>`).join("")}
      </div>
      <div class="preset-add">
        <div class="pop-label" style="font-size:11.5px;font-weight:650">今の設定をプリセットに追加</div>
        <div class="row">
          <input type="text" placeholder="名前（例: 仕事用）" value="${esc(state.presetName)}" data-preset-name data-f="preset-name" />
          <button type="button" class="btn-dark" ${act("preset-add")}>追加</button>
        </div>
      </div>
      <div class="preset-files">
        <div class="lead">ファイルでバックアップ</div>
        <button type="button" ${act("export")}>${svg(ICON.download, 15, 1.9)}ファイルに書き出す</button>
        <button type="button" ${act("import")}>${svg(ICON.upload, 15, 1.9)}ファイルから読み込む</button>
      </div>
    </div>`;
}

// --- Render: left rail ------------------------------------------------------

/** The ZEN wordmark or Z mark, inline so it can take currentColor. */
function logoSvg(which, height, extra = "") {
  const l = LOGO[which];
  return `<svg viewBox="0 0 ${l.w} ${l.h}" height="${height}" ${extra} role="img" aria-label="ZEN"><path d="${l.d}" fill="currentColor"/></svg>`;
}

const TABS = [
  { id: "keymap", short: "キー", label: "キー配置", icon: "keyboard" },
  { id: "combo", short: "コンボ", label: "コンボ", icon: "combo" },
  { id: "pointer", short: "マウス", label: "マウス操作", icon: "mousetab" },
  { id: "bt", short: "BT", label: "Bluetooth", icon: "bt" },
  { id: "color", short: "カラー", label: "キーボードの色", icon: "palette" },
];

function renderRail(counts) {
  const dirty = {
    keymap: counts.key > 0,
    combo: comboChangeCount() > 0,
    pointer: counts.pointer > 0,
  };
  return `<nav class="rail glass">
      <div class="rail-mark" title="ZEN Configurator">${logoSvg("z", 20, 'width="20"')}</div>
      ${TABS.map((t) => `<button type="button" class="${cls("rail-btn", state.tab === t.id && "is-on")}" ${act("tab", t.id)} title="${t.label}">
        <span class="rail-icon">${svg(ICON[t.icon], 20, 1.6)}</span>
        <span class="rail-label">${t.short}</span>
        ${dirty[t.id] ? '<span class="rail-dot"></span>' : ""}
      </button>`).join("")}
    </nav>`;
}

// --- Render: keyboard -------------------------------------------------------

function keyFontSize(main) {
  const glyph = main.length === 1 && !/[A-Za-z0-9]/.test(main);
  if (glyph) return "4cqw";
  if (main.length <= 2) return "3.5cqw";
  if (main.length <= 4) return "2.7cqw";
  return "2.2cqw";
}

/** The case, bumper, plate, socket and ball, as CSS variables for .board.
 *
 * The colour tab always shows the real colours (you are picking them); every
 * other tab only does so while "キー設定の画面にも反映する" is on, and
 * otherwise falls back to the neutral frosted look. */
function boardLook() {
  const L = state.look;
  const use = state.tab === "color" || L.reflect;
  const black = L.model === "black";
  const vars = {
    "case-bg": !use ? "var(--acrylic)" : black
      ? "linear-gradient(150deg, rgba(42,44,50,.94) 0%, rgba(22,23,27,.92) 60%, rgba(34,36,41,.94) 100%)"
      : "linear-gradient(150deg, rgba(255,255,255,.82) 0%, rgba(245,245,242,.62) 55%, rgba(255,255,255,.74) 100%)",
    bumper: use ? L.bumper : "var(--case-frame)",
    // A black case needs its inner highlight darkened or the white rim of the
    // light theme draws a bright outline around it.
    "case-shadow": use && black
      ? "inset 0 0 0 1px rgba(255,255,255,.05), inset 0 1px 0 rgba(255,255,255,.07), inset 0 0 0 .8cqw rgba(0,0,0,.18), 0 3cqw 6cqw -3.5cqw rgba(0,0,0,.55)"
      : "inset 0 0 0 1px var(--case-rim), inset 0 1px 0 var(--glass-hi), inset 0 0 0 .8cqw var(--acrylic-edge), 0 3cqw 6cqw -3.5cqw var(--glass-shadow)",
    "plate-bg": !use ? "var(--fill)" : black ? "#26272B" : "#FBFBF9",
    "plate-bd": !use ? "var(--line)" : black ? "rgba(255,255,255,.06)" : "rgba(21,27,43,.08)",
    "housing-bg": !use ? "var(--fill)" : black ? "#202125" : "#FAFAF8",
    "ball-bg": !use
      ? "radial-gradient(circle at 36% 30%,var(--surface) 0%,var(--fill2) 45%,var(--line-strong) 100%)"
      : `radial-gradient(circle at 36% 30%, color-mix(in srgb, ${L.ball} 30%, #FFFFFF) 0%, ${L.ball} 52%, color-mix(in srgb, ${L.ball} 72%, #000000) 100%)`,
    "ball-bd": !use ? "var(--line-strong)" : `color-mix(in srgb, ${L.ball} 80%, #000000)`,
  };
  return { use, style: Object.entries(vars).map(([k, v]) => `--${k}:${v}`).join(";") };
}

/** Background, legend and shadow for one key, in the order they win:
 *  selection beats everything, then the painted cap, then the binding style. */
function keyLook(d, selected, index, useLook) {
  const CAP = "inset 0 -.55cqw 0 rgba(23,22,20,.05), 0 .45cqw 0 var(--cap-edge), 0 1.2cqw 1.6cqw -1cqw rgba(23,22,20,.35)";
  if (selected) {
    return {
      bg: "var(--accent)", fg: "var(--on-accent)", bd: "var(--accent-ink)", bs: "solid",
      tagFg: "rgba(255,255,255,.85)",
      shadow: "inset 0 -.55cqw 0 rgba(0,0,0,.08), 0 .45cqw 0 var(--accent-ink), 0 1.4cqw 2cqw -1cqw color-mix(in srgb, var(--accent) 60%, transparent)",
    };
  }
  if (useLook) return capLook(state.look.paint[index] || state.look.cap, d.style);
  if (ARROW_KEYS.includes(index)) {
    return {
      bg: "var(--cap-orange)", fg: "#FFFFFF", bd: "var(--cap-orange-bd)", bs: "solid",
      tagFg: "rgba(255,255,255,.85)",
      shadow: "inset 0 -.55cqw 0 rgba(0,0,0,.06), 0 .45cqw 0 var(--cap-orange-edge), 0 1.2cqw 1.6cqw -1cqw rgba(23,22,20,.35)",
    };
  }
  if (d.style === "trans") return { bg: "var(--fill)", fg: "var(--mute)", bd: "var(--line-strong)", bs: "dashed", tagFg: "var(--ink3)", shadow: "none" };
  if (d.style === "none") return { bg: "var(--fill2)", fg: "var(--mute)", bd: "var(--line)", bs: "solid", tagFg: "var(--ink3)", shadow: "inset 0 .4cqw .8cqw rgba(23,22,20,.06)" };
  if (d.style === "special") return { bg: "var(--accent-tint)", fg: "var(--ink)", bd: "var(--accent-soft)", bs: "solid", tagFg: "var(--accent-ink)", shadow: CAP.replace("var(--cap-edge)", "var(--accent-soft)") };
  return { bg: "var(--surface)", fg: "var(--ink)", bd: "var(--line)", bs: "solid", tagFg: "var(--ink3)", shadow: CAP };
}

function renderBoards() {
  const comboMode = state.tab === "combo";
  const colorMode = state.tab === "color";
  const layer = state.keymap[state.layer];
  const savedLayer = state.saved[state.layer];
  const layerCombos = combosOnLayer(state.layer);
  const selCombo = (state.combos ?? []).find((c) => c.uid === state.comboSel) || null;
  const bat = batteries();
  const board = boardLook();

  const keys = POS.map((p, i) => {
    const binding = layer.bindings[i];
    const d = describe(binding);
    const inSel = comboMode && !!selCombo && selCombo.keyPositions.includes(i);
    const sel = colorMode ? false : comboMode ? inSel : (state.active && i === state.sel);
    const look = keyLook(d, sel, i, !sel && board.use);
    const changed = !colorMode && savedLayer && binding !== savedLayer.bindings[i];
    const nums = comboMode ? layerCombos.map((c, ci) => (c.keyPositions.includes(i) ? String(ci + 1) : null)).filter(Boolean) : [];
    const style = [
      `grid-area:${p.y + 1} / ${p.x <= 6 ? p.x + 1 : p.x - 7}`,
      `font-size:${keyFontSize(d.main)}`,
      `background:${look.bg}`, `color:${look.fg}`,
      `border-color:${look.bd}`, `border-style:${look.bs}`,
      `box-shadow:${look.shadow}`,
    ].join(";");
    const title = colorMode ? "クリックするとこのキーを塗ります" : sentence(binding);
    return {
      left: p.x <= 6,
      html: `<button type="button" class="key" style="${style}" title="${esc(title)}" ${act("key", String(i))}>
          ${d.tag ? `<span class="key-tag" style="color:${look.tagFg}">${esc(d.tag)}</span>` : ""}
          <span class="key-main">${esc(d.main)}</span>
          ${nums.length ? `<span class="key-badge" style="background:${inSel ? "var(--on-accent)" : "var(--inv)"};color:${inSel ? "var(--accent)" : "var(--inv-fg)"}">${esc(nums.join("·"))}</span>` : ""}
          ${changed ? `<span class="key-dot" style="background:${sel ? "var(--on-accent)" : "var(--accent)"}"></span>` : ""}
        </button>`,
    };
  });

  const lcd = (side, value) => `<div class="lcd lcd-${side}"><span class="cap">BATTERY</span><span class="val">${value == null ? "--" : value + "%"}</span></div>`;

  return `<div class="boards">
      <div class="board-wrap">
        <div class="board" style="${board.style}">
          <div class="plate plate-l"></div>
          ${keys.filter((k) => k.left).map((k) => k.html).join("")}
          ${lcd("l", bat.left)}
        </div>
        <div class="board-label">左手</div>
      </div>
      <div class="board-wrap">
        <div class="board" style="${board.style}">
          <div class="plate plate-r"></div>
          ${keys.filter((k) => !k.left).map((k) => k.html).join("")}
          <button type="button" class="tb" ${act("tab", "pointer")} title="マウス操作の設定へ">
            <span class="tb-socket"><span class="tb-ball"></span></span>
          </button>
          ${lcd("r", bat.right)}
        </div>
        <div class="board-label">右手<i> · </i>USBでつなぐ側</div>
      </div>
    </div>`;
}

function renderLayerRow() {
  const comboMode = state.tab === "combo";
  return `<div class="layer-row">
      <span class="layer-row-label">レイヤー</span>
      <span class="tip-wrap">
        <span class="tip-mark" ${act("tip")}>?</span>
        ${state.tip ? '<span class="tip-body">レイヤーは、キー配置の「ページ」です。0番がふだん使うページで、レイヤー切替キーを押すと別のページに切り替わります（スマホのキーボードで数字・記号に切り替えるのと同じ考え方です）。</span>' : ""}
      </span>
      ${state.keymap.map((l, i) => {
        const on = i === state.layer;
        const empty = l.bindings.every((b) => b === "&trans");
        const name = state.layerNames[i] || "";
        const dirty = state.saved[i] && l.bindings.some((b, j) => b !== state.saved[i].bindings[j]);
        const comboN = combosOnLayer(i).length;
        return `<button type="button" class="${cls("layer-chip", on && "is-on")}" ${act("layer", String(i))} title="レイヤー ${i}${name ? "：" + esc(name) : ""}">
          <span class="${cls("layer-num", empty && !on && "is-empty")}">${i}</span>
          <span class="${cls("layer-name", !name && "is-unnamed")}">${esc(name || (empty ? "空き" : "名前なし"))}</span>
          ${comboMode && comboN ? `<span class="layer-combo-n">${comboN}</span>` : ""}
          ${dirty ? '<span class="dot"></span>' : ""}
        </button>`;
      }).join("")}
      <button type="button" class="btn-plain" style="margin-left:auto" ${act("rename")} title="レイヤーの名前を変える">${svg(ICON.edit, 13)}名前を変える</button>
    </div>
    ${state.renaming ? `<div class="rename-row">
      <span>レイヤー ${state.layer} の名前</span>
      <input type="text" value="${esc(state.layerNames[state.layer] || "")}" placeholder="例: 記号" data-layer-name data-f="layer-name" />
      <span class="rename-note">${svg(ICON.cards, 13, 1.9)}名前はこのパソコンにだけ保存されます（キーボードには記録されません）</span>
      <button type="button" class="btn-dark" style="margin-left:auto;height:30px;padding:0 12px;border-radius:7px;font-size:12.5px" ${act("rename")}>完了</button>
    </div>` : ""}`;
}

function renderBoardCard() {
  const comboMode = state.tab === "combo";
  const colorMode = state.tab === "color";
  const selCombo = (state.combos ?? []).find((c) => c.uid === state.comboSel) || null;

  const title = colorMode ? "キーボードの色" : comboMode ? "同時押しするキーを選ぶ" : "レイヤーとキーを選ぶ";
  const hint = colorMode
    ? "お使いのキーボードと同じ色にすると、キー設定の画面でも同じ見た目で表示されます"
    : comboMode
      ? (selCombo ? "キーをクリックすると、選んでいるコンボに追加 / 外せます" : "下でコンボを選ぶか追加してください")
      : "現在の設定が表示されています。変えたいキーをクリックしてください";

  let legend = "";
  if (comboMode) {
    legend = `<div class="legend">
        <span><i class="k-sel">J</i>選んでいるコンボのキー</span>
        <span><i class="k-badge">2</i>そのキーを使っているコンボの番号</span>
        <span style="color:var(--ink3)">キーをクリックすると、選んでいるコンボに追加 / 外します</span>
      </div>`;
  } else if (!colorMode) {
    legend = `<div class="legend">
        <span><i>A</i>ふつうのキー</span>
        <span><i class="k-special">L</i>特別な動き（レイヤー・マウスなど）</span>
        <span><i class="k-trans">▽</i>下のレイヤーと同じ</span>
        <span><i class="k-none">—</i>何もしない</span>
        <span><span class="dot"></span>まだ保存していない変更</span>
      </div>`;
  }

  return `<section class="card card-pad glass">
      <div class="card-head">
        <span class="card-title">${title}</span>
        <span class="card-note">${hint}</span>
      </div>
      ${colorMode ? "" : renderLayerRow()}
      ${renderBoards()}
      ${legend}
    </section>`;
}

// --- Render: key editor -----------------------------------------------------

function renderEditor() {
  const binding = state.keymap[state.layer].bindings[state.sel];
  const d = describe(binding);
  const p = POS[state.sel];
  const leftHand = p.x <= 6;
  const colN = leftHand ? p.x + 1 : p.x - 7;
  const posText = `${leftHand ? "左手" : "右手"}・レイヤー ${state.layer}`;

  if (!state.active) {
    return `<section class="editor is-idle">
        <div class="ed-head"><span class="t">選んだキーの役割を決める</span></div>
        <div class="ed-idle">
          <div class="ed-idle-art">
            <div class="cap"></div>
            <svg viewBox="0 0 24 24" width="26" height="26"><path d="M5 3l6 16 2.5-6.5L20 10z" fill="var(--surface)" stroke="var(--ink3)" stroke-width="1.6" stroke-linejoin="round"/></svg>
          </div>
          <div class="lead">上のキーボードで、変えたいキーをクリックしてください</div>
          <div class="sub">選ぶと、ここでそのキーの役割（文字・レイヤー切替・マウスなど）を変えられます</div>
        </div>
      </section>`;
  }

  const role = LAYER_MODE[state.ed.kind] ? "layer" : state.ed.kind;
  const prevSize = d.main.length <= 2 ? "26px" : d.main.length <= 4 ? "18px" : "14px";

  return `<section class="editor">
      <div class="ed-head">
        <span class="t">選んだキーの役割を決める</span>
        <span class="pos">${posText} ・ 上から ${p.y + 1} 段目 ・ 左から ${colN} 番目</span>
        <button type="button" class="btn-plain" ${act("deselect")}>${svg(ICON.close, 12, 2.4)}選択をやめる</button>
      </div>
      <div class="ed-cols">
        <div class="ed-sel">
          <div class="ed-sub">選んでいるキー</div>
          <div class="prev-row">
            <div class="${cls("prev-cap", d.style === "special" && "is-special", d.style === "trans" && "is-trans", d.style === "none" && "is-none")}">
              ${d.tag ? `<span class="tag">${esc(d.tag)}</span>` : ""}
              <span class="main" style="font-size:${prevSize}">${esc(d.main)}</span>
            </div>
            <div class="prev-pos">${posText}<br>上から ${p.y + 1} 段目<br>左から ${colN} 番目</div>
          </div>
          <div class="ed-sentence">${esc(sentence(binding))}</div>
          ${state.client && state.liveKeymap ? `<div class="ed-live">${svg(ICON.bolt, 14)}変えるとすぐキーボードで試せます</div>` : ""}
          ${state.client && !state.liveKeymap ? '<div class="ed-live" style="color:var(--danger)">この個体はキーマップを持たないため編集できません（左手側）</div>' : ""}
          <div class="ed-adv">
            <button type="button" ${act("advanced")}>${svg(state.advanced ? "M6 15l6-6 6 6" : "M9 6l6 6-6 6", 12, 2.2)}上級者向け：コードで入力</button>
            ${state.advanced ? `<input type="text" value="${esc(binding)}" spellcheck="false" data-raw data-f="raw" />` : ""}
          </div>
        </div>

        <div class="ed-roles">
          <div class="ed-sub">このキーの役割</div>
          ${ROLES.map((r) => `<button type="button" class="${cls("role", r.id === role && "is-on")}" ${act("role", r.id)}>
            <span class="role-icon">${svg(ICON[r.id], 16)}</span>
            <span style="min-width:0">
              <span class="role-label">${r.label}</span>
              <span class="role-sub">${r.sub}</span>
            </span>
          </button>`).join("")}
        </div>

        <div class="ed-detail glass">${renderEditorDetail()}</div>
      </div>
    </section>`;
}

function renderEditorDetail() {
  const e = state.ed;
  if (e.kind === "trans") {
    return `<div class="explain">
        <div class="trans-art">
          <div class="a">レイヤー ${state.layer}</div>
          <div class="b">レイヤー 0</div>
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="var(--accent)" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 4v14M7 13l5 5 5-5"/></svg>
        </div>
        <p>このレイヤーでは何も決めず、<b>下のレイヤー（ふだんはレイヤー 0）と同じ動き</b>をします。<br>レイヤーを切り替えても、よく使うキーをそのまま使いたいときに便利です。</p>
      </div>`;
  }
  if (e.kind === "none") {
    return `<div class="explain" style="gap:18px">
        <div class="none-art">—</div>
        <p>このキーを押しても<b>何も起きません</b>。<br>誤って押しやすい場所を無効にしたいときに使います。</p>
      </div>`;
  }
  if (LAYER_MODE[e.kind]) {
    return `<div>
        <div class="detail-h">どう切り替えますか？</div>
        <div class="mode-grid">
          ${["mo", "tog", "to", "sl"].map((k) => {
            const m = LAYER_MODE[k];
            return `<button type="button" class="${cls("mode-card", k === e.kind && "is-on")}" ${act("layer-mode", k)}>
              <svg viewBox="0 0 64 20" width="64" height="20" fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="${m.wave}" stroke-width="2"/></svg>
              <span class="l">${m.label}</span><span class="s">${m.sub}</span>
            </button>`;
          }).join("")}
        </div>
        <div class="detail-h">どのレイヤーへ？</div>
        <div class="layerargs">
          ${state.keymap.map((_l, i) => `<button type="button" class="${cls("layerarg", i === e.layerArg && "is-on")}" ${act("layer-arg", String(i))}>
            <span class="n">${i}</span>${esc(state.layerNames[i] || `レイヤー ${i}`)}
          </button>`).join("")}
        </div>
      </div>`;
  }
  if (e.kind === "mkp" || e.kind === "bt" || e.kind === "out") {
    const config = {
      mkp: { title: "どのボタンにしますか？", opts: MOUSE_OPTS.map((o) => ({ ...o, d: MOUSE_BODY })), note: "" },
      bt: { title: "どの操作にしますか？", opts: BT_OPTS.map((o) => ({ ...o, d: o.d || ICON.bt })), note: "接続先は、Bluetoothでつなぐ機器（パソコン・タブレットなど）を最大5台まで登録しておける場所です。" },
      out: { title: "キー入力をどこへ送りますか？", opts: OUT_OPTS, note: "USBケーブルとBluetoothの両方でつながっているとき、どちらの機器に文字を送るかを決めます。" },
    }[e.kind];
    return `<div>
        <div class="detail-h">${config.title}</div>
        <div class="opt-grid">
          ${config.opts.map((o) => {
            const on = o.v === e.opt || (e.kind === "mkp" && MOUSE[e.opt] && MOUSE[e.opt] === MOUSE[o.v]);
            return `<button type="button" class="${cls("opt-tile", on && "is-on")}" ${act("opt", o.v)}>
              <svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="${o.d}"/>${o.fill ? `<path class="fill" d="${o.fill}"/>` : ""}</svg>
              <span>${o.label}</span>
            </button>`;
          }).join("")}
        </div>
        ${config.note ? `<div class="opt-note">${config.note}</div>` : ""}
      </div>`;
  }

  // kp / mt — the key picker, with modifiers for kp and a hold row for mt.
  const q = state.search.trim().toUpperCase();
  let pool;
  if (q) {
    pool = [];
    PICKER_GROUPS.forEach((g) => g.keys.forEach((k) => {
      if (k.includes(q) || pretty(k).toUpperCase().includes(q) || friendly(k).toUpperCase().includes(q)) pool.push(k);
    }));
  } else {
    pool = (PICKER_GROUPS.find((g) => g.label === state.cat) || PICKER_GROUPS[0]).keys;
  }

  const capSize = (label) => (label.length === 1 && !/[A-Za-z0-9]/.test(label) ? "18px" : label.length <= 2 ? "16px" : label.length <= 4 ? "12.5px" : "10.5px");

  return `${e.kind === "mt" ? `<div style="margin-bottom:16px">
      <div class="detail-h">長く押したとき</div>
      <div class="chip-row">
        ${HOLDS.map((h) => `<button type="button" class="${cls("chip-btn", h.id === e.hold && "is-on")}" ${act("hold", h.id)}>${h.label}</button>`).join("")}
      </div>
      <div class="detail-h" style="margin:16px 0 0">短く押したとき</div>
    </div>` : ""}
    ${e.kind === "kp" ? `<div style="margin-bottom:14px">
      <div style="display:flex;align-items:baseline;gap:8px;margin-bottom:8px">
        <span class="detail-h" style="margin:0">一緒に押すキー</span>
        <span style="font-size:11.5px;color:var(--ink3)">たとえば Cmd + C のようなショートカットを作れます</span>
      </div>
      <div class="chip-row">
        ${[["ctrl", "Ctrl"], ["shift", "Shift"], ["alt", "Alt / Option"], ["gui", "Cmd / Win"]].map(([id, label]) =>
          `<button type="button" class="${cls("mod-btn", e.mods[id] && "is-on")}" ${act("mod", id)}>
            <span class="mod-box">${svg(ICON.check, 10, 3.4)}</span>${label}
          </button>`).join("")}
      </div>
    </div>` : ""}
    <div class="picker-head">
      <span class="detail-h">${e.kind === "mt" ? "" : "入力するキー"}</span>
      <div class="search">
        <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="var(--ink3)" stroke-width="2" stroke-linecap="round"><circle cx="11" cy="11" r="6"/><path d="M20 20l-4.5-4.5"/></svg>
        <input type="text" placeholder="キーを探す" value="${esc(state.search)}" data-search data-f="search" />
      </div>
    </div>
    ${q ? "" : `<div class="cats">
      ${PICKER_GROUPS.map((g) => `<button type="button" class="${cls("cat", g.label === state.cat && "is-on")}" ${act("cat", g.label)}>${g.label}</button>`).join("")}
    </div>`}
    ${pool.length === 0
      ? '<div class="no-hits">見つかりませんでした。別の言葉で探してみてください。</div>'
      : `<div class="keygrid" data-scroll="keygrid">
          ${pool.map((k) => {
            const label = pretty(k);
            return `<button type="button" class="${cls("keycap", k === e.keyName && "is-on")}" style="font-size:${capSize(label)}" title="${esc(friendly(k))}" ${act("pick-key", k)}>${esc(label)}</button>`;
          }).join("")}
        </div>`}`;
}

// --- Render: combo ----------------------------------------------------------

function renderComboPanel() {
  // A browser tab cannot reach config/keymap.keymap, and there is nothing to
  // send to the keyboard instead -- combos are compiled in.
  if (!canEditCombos()) {
    return `<section class="card card-pad glass">
        <div class="notice">${svg(ICON.warn, 15, 2)}<span>
          <b>コンボの編集はデスクトップアプリでのみできます。</b>
          コンボはキーボードに送るのではなく、<code>config/keymap.keymap</code> を書き換えて
          ファームウェアを作り直す必要があるためです。
        </span></div>
      </section>`;
  }

  if (!state.combos) {
    return `<section class="card card-pad glass">
        <div style="display:flex;align-items:center;gap:10px;margin-bottom:12px">
          <span class="group-icon">${svg(ICON.combo, 16, 1.9)}</span>
          <span class="group-title">コンボ</span>
          <span class="card-note">同時に押すと別のキーとして働きます</span>
        </div>
        <div class="notice">${svg(ICON.warn, 15, 2)}<span>
          コンボは<b>キーボードではなく <code>config/keymap.keymap</code></b> に入っています。
          そのファイルを選ぶと、いま入っているコンボを読み込んで編集できます。
        </span></div>
        ${state.comboError ? `<div class="notice" style="margin-top:10px;border-color:var(--danger)"><span style="color:var(--danger)">${esc(state.comboError)}</span></div>` : ""}
        <div style="display:flex;align-items:center;gap:10px;margin-top:14px">
          <button type="button" class="btn btn-accent" ${act("combo-pick")} ${state.comboBusy ? "disabled" : ""}>
            ${svg(ICON.cards, 15, 1.9)}keymap.keymap を選ぶ
          </button>
          ${keymapPath() ? `<span class="card-note" style="word-break:break-all">前回: ${esc(keymapPath())}</span>` : ""}
        </div>
      </section>`;
  }

  const layerCombos = combosOnLayer(state.layer);
  const sel = state.combos.find((c) => c.uid === state.comboSel) || null;
  // A combo position is often &trans on the layer the combo belongs to, and
  // "▽" tells nobody which key to press. Fall through the way the keyboard
  // does and show what the key actually does at rest.
  const keyLabel = (i) => {
    for (let l = state.layer; l >= 0; l--) {
      const binding = state.keymap[l]?.bindings[i];
      if (binding && binding !== "&trans") return describe(binding).main;
    }
    return describe(state.keymap[0].bindings[i]).main;
  };
  const dirty = comboChangeCount();

  const outLabel = (b) => {
    const d = describe(b);
    return (d.tag && d.style === "key" ? d.tag + "+" : "") + d.main;
  };
  const pool = (PICKER_GROUPS.find((g) => g.label === state.cat) || PICKER_GROUPS[0]).keys;
  const curOut = sel ? sel.bindings.replace(/^&kp\s+/, "") : "";

  return `<section class="card card-pad glass" style="padding-bottom:18px">
      <div class="notice">${svg(ICON.bolt, 15, 2)}<span>
        コンボは<b>キーボードに送れません</b>（ファームウェアに焼き込まれているためです）。
        ここでの変更は <code>keymap.keymap</code> に書き出したあと、
        <b>ビルドして書き込む</b>と反映されます。下の「キーボードに保存」は関係ありません。
      </span></div>

      <div class="combo-head" style="margin-top:14px">
        <span class="t">レイヤー ${state.layer} のコンボ</span>
        <span class="card-note">${layerCombos.length} 件 / ファイル全体で ${state.combos.length} 件</span>
        <button type="button" class="btn btn-dark" ${act("combo-add")}>${svg(ICON.plus, 14, 2.2)}新しいコンボ</button>
      </div>

      <div class="combo-table">
        <div class="combo-grid combo-th">
          <span>No.</span><span>同時に押すキー</span><span>押したときに入力されるキー</span><span>同時押しの時間</span><span></span>
        </div>
        ${layerCombos.length === 0
          ? '<div class="combo-empty">このレイヤーにはまだコンボがありません</div>'
          : layerCombos.map((c, ci) => `<button type="button" class="${cls("combo-grid", "combo-row", sel && c.uid === sel.uid && "is-on")}" ${act("combo-sel", String(c.uid))}>
              <span class="combo-n">${ci + 1}</span>
              <span class="combo-keys">
                ${c.keyPositions.map((k, j) => `${j > 0 ? '<span class="combo-plus">+</span>' : ""}<span class="combo-cap">${esc(keyLabel(k))}</span>`).join("")}
                ${c.keyPositions.length < 2 ? '<span class="combo-warn">キーを2つ以上選んでください</span>' : ""}
                ${c.layers === null ? '<span class="combo-warn" style="color:var(--ink3)">すべてのレイヤー</span>' : ""}
              </span>
              <span class="combo-out">${svg(ICON.arrow, 14, 2, 'style="color:var(--mute);flex:0 0 auto"')}<span class="v">${esc(outLabel(c.bindings))}</span></span>
              <span class="combo-term">${c.timeoutMs === null ? `${COMBO_DEFAULT_TIMEOUT_MS} ms（既定）` : `${c.timeoutMs} ms`}</span>
              <span style="display:flex;justify-content:center">${comboChanged(c) ? '<span class="dot"></span>' : ""}</span>
            </button>`).join("")}
      </div>

      ${sel ? `<div class="combo-edit">
        <div class="combo-panel p1">
          <div style="display:flex;align-items:center;gap:8px">
            <span class="detail-h" style="margin:0">同時に押すキー</span>
          </div>
          <div class="combo-sel-keys">
            ${sel.keyPositions.map((k, j) => `${j > 0 ? '<span style="color:var(--ink3);font-size:15px">+</span>' : ""}<span class="combo-sel-cap">${esc(keyLabel(k))}</span>`).join("")}
            ${sel.keyPositions.length < 2 ? '<span class="combo-sel-cap is-empty">?</span>' : ""}
          </div>
          <div class="combo-hint">上のキーボードでキーをクリックすると、追加 / 外せます（2つ以上）</div>
          ${sel.extra && sel.extra.length
            ? `<div class="combo-hint" style="color:var(--accent-ink)">このコンボには、この画面では編集できない設定があります（${esc(sel.extra.map((p) => p.name).join(", "))}）。書き出してもそのまま残ります。</div>`
            : ""}
        </div>
        <div class="combo-panel p2">
          <div style="display:flex;align-items:center;gap:8px;margin-bottom:8px">
            <span class="detail-h" style="margin:0">押したときに入力されるキー</span>
            <span class="card-note" style="color:var(--ink2)">${esc(sentence(sel.bindings))}</span>
          </div>
          <div class="cats">
            ${PICKER_GROUPS.map((g) => `<button type="button" class="${cls("cat", g.label === state.cat && "is-on")}" ${act("cat", g.label)} style="padding:4px 9px;font-size:11.5px">${g.label}</button>`).join("")}
          </div>
          <div class="combo-pick" data-scroll="combo-pick">
            ${pool.map((k) => {
              const label = pretty(k);
              const size = label.length <= 2 ? "14px" : label.length <= 4 ? "11.5px" : "10px";
              return `<button type="button" class="${cls("keycap", k === curOut && "is-on")}" style="font-size:${size}" title="${esc(friendly(k))}" ${act("combo-out", k)}>${esc(label)}</button>`;
            }).join("")}
          </div>
        </div>
        <div class="combo-panel p3">
          <span class="detail-h" style="margin:0">同時押しとみなす時間</span>
          <div style="display:flex;align-items:center;gap:12px;flex-wrap:wrap">${sliderHtml("comboTerm", sel.timeoutMs ?? COMBO_DEFAULT_TIMEOUT_MS)}</div>
          <span class="combo-hint" style="margin:0">短いほど誤爆しにくく、長いほど同時押しが成功しやすくなります</span>
          <button type="button" class="btn-danger-plain" style="align-self:flex-start;margin-top:auto" ${act("combo-delete")}>${svg(ICON.trash, 13)}このコンボを削除</button>
        </div>
      </div>` : ""}

      <div style="display:flex;align-items:center;gap:12px;flex-wrap:wrap;margin-top:16px;padding-top:14px;border-top:1px solid var(--line-soft)">
        <div style="flex:1;min-width:200px">
          <div style="font-size:13px;font-weight:650">${dirty ? `${dirty} 件の変更が未書き出しです` : "ファイルと同じ内容です"}</div>
          <div class="card-note" style="word-break:break-all">${esc(keymapPath() ?? "")}</div>
        </div>
        <button type="button" class="btn" ${act("combo-reload")} ${state.comboBusy ? "disabled" : ""}>${svg(ICON.reset, 13)}読み直す</button>
        <button type="button" class="btn" ${act("combo-pick")} ${state.comboBusy ? "disabled" : ""}>別のファイル</button>
        <button type="button" class="${cls("btn", dirty && "btn-accent")}" ${act("combo-save")} ${state.comboBusy || !dirty ? "disabled" : ""}>
          ${svg(ICON.download, 15, 1.9)}keymap.keymap に書き出す
        </button>
      </div>
    </section>`;
}

// --- Render: pointer --------------------------------------------------------

function renderPointer() {
  const d = state.pointer;
  const sd = state.savedPointer;
  const dirty = (k) => d[k] !== sd[k];
  const noDevice = !state.client;

  const groupHead = (iconPath, title, sub, extra = "") =>
    `<div class="group-head"><span class="group-icon">${svg(iconPath, 16, 1.9)}</span>
      <span class="group-title">${title}</span><span class="group-sub">${sub}</span>${extra}</div>`;

  const angleDial = `<svg viewBox="0 0 64 64" width="52" height="52" style="flex:0 0 auto">
      <circle cx="32" cy="32" r="27" fill="var(--surface)" stroke="var(--line)" stroke-width="1.5"/>
      <line x1="32" y1="5" x2="32" y2="59" stroke="var(--line-strong)" stroke-width="1.5" stroke-dasharray="3 3"/>
      <g transform="rotate(${d.angle} 32 32)">
        <line x1="32" y1="47" x2="32" y2="13" stroke="var(--accent)" stroke-width="3" stroke-linecap="round"/>
        <path d="M25 20l7-8 7 8" fill="none" stroke="var(--accent)" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
      </g>
    </svg>`;

  return `<div class="stack">
      ${noDevice ? `<div class="notice">${svg(ICON.warn, 15, 2)}<span>キーボードがつながっていないため、ここでの変更は<b>この画面の中だけ</b>です。つなぐと、キーボードに入っている設定を読み込みます。</span></div>` : ""}

      <div class="group glass">
        ${groupHead(ICON.pointer, "ポインター", "画面の矢印の動き",
          `<button type="button" class="btn" ${act("pointer-reset")}>${svg(ICON.reset, 13)}はじめの設定に戻す</button>`)}
        ${settingRow({
          title: "ポインターの速さ", desc: "ボールを転がしたときに、画面の矢印が動く速さ",
          dirty: dirty("pointerSpeed"), first: true, control: sliderHtml("pointerSpeed", d.pointerSpeed),
        })}
        ${settingRow({
          title: "トラックボールの向き",
          desc: "キーボードを斜めに置いたとき、ボールの「上」を画面の上に合わせます。図のオレンジがボールの上、点線が画面の上です"
            + (angleSupported() ? "" : '<br><span style="color:var(--accent-ink)">※ キーボードのファームウェアが古いため、この設定は使えません</span>'),
          dirty: dirty("angle"), disabled: !angleSupported(),
          control: angleDial + sliderHtml("angle", d.angle),
        })}
        ${settingRow({
          title: "左右を反対にする", dirty: dirty("invertX"),
          desc: d.invertX ? "現在の設定：ボールを右へ → 矢印は左へ" : "現在の設定：ボールを右へ → 矢印も右へ",
          control: switchHtml(d.invertX, "toggle-invertX"),
        })}
        ${settingRow({
          title: "上下を反対にする", dirty: dirty("invertY"),
          desc: d.invertY ? "現在の設定：ボールを上へ → 矢印は下へ" : "現在の設定：ボールを上へ → 矢印も上へ",
          control: switchHtml(d.invertY, "toggle-invertY"),
        })}
      </div>

      <div class="group glass">
        ${groupHead(ICON.scroll, "スクロール", "ページを上下に動かすとき")}
        ${settingRow({
          title: "スクロールの速さ", desc: "スクロール中にボールを転がしたときの、ページの動く速さ",
          dirty: dirty("scrollSpeed"), first: true, control: sliderHtml("scrollSpeed", d.scrollSpeed),
        })}
        ${settingRow({
          title: "スクロールを逆向きにする", dirty: dirty("invertScroll"),
          desc: d.invertScroll ? "現在の設定：ボールを下へ → ページは上へ" : "現在の設定：ボールを下へ → ページも下へ",
          control: switchHtml(d.invertScroll, "toggle-invertScroll"),
        })}
        ${settingRow({
          title: "慣性スクロール", dirty: dirty("inertia") || dirty("glide"), disabled: !FEATURES.inertia,
          desc: "はじくように転がすと、指を離したあともしばらく滑ります（トラックパッドのような動き）"
            + (FEATURES.inertia ? "" : '<br><span style="color:var(--accent-ink)">※ トラックパッド搭載版のための設定です。トラックボールはボール自体が惰性で回るので使いません</span>'),
          control: switchHtml(d.inertia, "toggle-inertia")
            + `<div class="${cls("sub-ctl", !d.inertia && "is-off")}">${sliderHtml("glide", d.glide)}</div>`,
        })}
      </div>

      <div class="group glass">
        ${groupHead(ICON.auto, "オートマウス", "マウス用レイヤーへの自動切り替え")}
        ${settingRow({
          title: "自動で切り替える", dirty: dirty("autoMouse"), first: true, disabled: !autoMouseSupported(),
          desc: "ボールを動かしている間だけ、マウス用のレイヤーに切り替えます。クリック用のキーをすぐ押せます"
            + (autoMouseSupported() ? "" : '<br><span style="color:var(--accent-ink)">※ キーボードのファームウェアが古いため、この設定は使えません</span>'),
          control: switchHtml(d.autoMouse, "toggle-autoMouse") + `<span class="switch-state">${d.autoMouse ? "オン" : "オフ"}</span>`,
        })}
        <div class="${cls("rows-dep", (!d.autoMouse || !autoMouseSupported()) && "is-off")}">
          ${settingRow({
            title: "キー入力の直後は切り替えない", desc: "文字を打っている最中に手が触れて切り替わるのを防ぐ時間",
            dirty: dirty("amAfter"), control: sliderHtml("amAfter", d.amAfter),
          })}
          ${settingRow({
            title: "止めてから戻るまで", desc: "ボールを止めてから、ふだんのレイヤーに戻るまでの時間",
            dirty: dirty("amBack"), control: sliderHtml("amBack", d.amBack),
          })}
        </div>
      </div>
    </div>`;
}

// --- Render: bluetooth ------------------------------------------------------

function renderBluetooth() {
  const table = state.bleProfiles;

  // No profile table means the keyboard cannot tell us -- old firmware, or a
  // peripheral. Say which rather than drawing five rows of guesses.
  if (!table) {
    const why = !state.client
      ? "キーボードをつなぐと、登録されている機器が表示されます。"
      : state.status && state.status.role === "peripheral"
        ? "左手側には接続先の登録がありません。右手側（トラックボールのある方）をつないでください。"
        : "このキーボードのファームウェアは、接続先の読み取りに対応していません。ファームウェアを更新してください。";
    return `<div class="stack">
        <section class="card bt-main glass">
          <div class="card-head">
            <span class="group-icon">${svg(ICON.bt, 16, 1.9)}</span>
            <span class="group-title">接続先のチャンネル</span>
          </div>
          <div class="notice">${svg(ICON.warn, 15, 2)}<span>${esc(why)}</span></div>
        </section>
      </div>`;
  }

  const bonded = table.profiles.filter((p) => p.bonded).length;
  const busy = state.btBusy ? "disabled" : "";

  const rows = table.profiles.map((p) => {
    const isActive = p.index === table.activeIndex;
    let status;
    if (isActive && p.connected) status = "この機器につながっています";
    else if (isActive && p.bonded) status = "最後に使ったチャンネル・未接続";
    else if (isActive) status = "登録待ちです。つなぎたい機器のBluetooth設定で「ZEN」を選んでください";
    else if (p.connected) status = "登録済み・接続中";
    else if (p.bonded) status = "登録済み";
    else status = "まだ登録されていません";

    return `<div class="${cls("bt-row", isActive && "is-active", !p.bonded && "is-free")}">
        <span class="bt-num">${p.index + 1}</span>
        <div style="flex:1;min-width:0">
          <div class="bt-title">${p.bonded ? `チャンネル ${p.index + 1}` : "空き"}</div>
          <div class="bt-status">${esc(status)}</div>
        </div>
        ${p.bonded ? `<button type="button" class="icon-only" ${act("bt-clear", String(p.index))} ${busy} title="登録を消す" aria-label="登録を消す">${svg(ICON.trash, 15, 1.7)}</button>` : ""}
        ${!isActive ? `<button type="button" class="btn-ring" ${act("bt-select", String(p.index))} ${busy}>
          ${svg(p.bonded ? ICON.out : ICON.plus, 13, 1.8)}${p.bonded ? "切り替える" : "登録する"}
        </button>` : ""}
        ${isActive && p.connected ? `<button type="button" class="btn-ring" ${act("bt-disconnect", String(p.index))} ${busy}>切断する</button>` : ""}
        ${isActive ? '<span class="bt-badge"><i></i>使用中</span>' : ""}
      </div>`;
  }).join("");

  return `<div class="stack">
      <div class="bt-wrap">
        <section class="card bt-main glass">
          <div class="card-head">
            <span class="group-icon">${svg(ICON.bt, 16, 1.9)}</span>
            <span class="group-title">接続先のチャンネル</span>
            <span class="card-note">${table.count}つのうち ${bonded} つ登録済み</span>
          </div>
          <div class="bt-list">${rows}</div>
          <div class="bt-foot">キーボードの「接続先」キー（例：レイヤー3の BT1〜${table.count}）でも切り替えられます。番号はここの表示と同じです。</div>
        </section>
        <aside class="bt-side">
          <div class="bt-aside">
            <span class="lead">${svg(ICON.bolt, 14)}ここでの操作はすぐキーボードに反映されます。「キーボードに保存」は不要です。</span>
            <button type="button" class="btn-danger" ${act("bt-clear-all")} ${bonded === 0 || state.btBusy ? "disabled" : ""}>${svg(ICON.trash, 13)}すべての登録を消す</button>
          </div>
        </aside>
      </div>
      ${state.btConfirm ? renderBtConfirm(bonded) : ""}
    </div>`;
}

// --- Render: keyboard colours -----------------------------------------------

function swatchRow(list, current, action, hex, pickAction) {
  const norm = (v) => (v || "").toUpperCase();
  return `<div class="sw-row" data-row="${pickAction}">
      ${list.map(([name, c]) => `<button type="button" class="${cls("sw", norm(c) === norm(current) && "is-on")}"
        style="background:${c}" title="${esc(name)}" ${act(action, c)}></button>`).join("")}
      ${list.some(([, c]) => norm(c) === norm(current)) ? "" : `<button type="button" class="sw is-on"
        style="background:${current}" title="いま選んでいる色" ${act(action, current)}></button>`}
      <button type="button" class="sw-pick" title="ほかの色を選ぶ" ${act("pick-open", pickAction)}></button>
      <span class="sw-hex">${esc(hex)}</span>
      ${state.pick === pickAction ? renderPicker(pickAction, hex) : ""}
    </div>`;
}

function colorRow({ title, desc, first, control }) {
  return `<div class="${cls("color-row", first && "first")}">
      <div class="color-label"><div class="t">${esc(title)}</div><div class="s">${esc(desc)}</div></div>
      <div class="color-ctl">${control}</div>
    </div>`;
}

function renderColor() {
  const L = state.look;
  const painted = Object.keys(L.paint).length;

  const models = Object.entries(MODELS).map(([id, m]) => `
    <button type="button" class="${cls("model-card", L.model === id && "is-on")}" ${act("look-model", id)}>
      <span class="model-art" style="background:${m.body};border-color:${m.bumper}">
        ${Array.from({ length: 8 }, (_, i) => `<span style="background:${i === 6 ? ARROW_CAP : m.cap}"></span>`).join("")}
      </span>
      <span>
        <span class="l">${m.label}</span>
        <span class="s">${m.sub}</span>
      </span>
    </button>`).join("");

  return `<section class="card glass" style="padding:16px 20px 6px">
      <div class="card-head" style="padding-bottom:10px;margin-bottom:0">
        <span class="card-title" style="font-size:15px">あなたの ZEN に合わせる</span>
        <span class="pop-tag">このパソコンに保存</span>
        <span style="margin-left:auto;display:flex;align-items:center;gap:10px">
          <span style="font-size:12.5px;color:var(--ink2)">キー設定の画面にも反映する</span>
          ${switchHtml(L.reflect, "toggle-look-reflect")}
        </span>
      </div>
      ${colorRow({
        title: "モデル", first: true,
        desc: "本体の色。選ぶとバンパーとキーキャップも、そのモデルの標準の色になります",
        control: `<div class="model-grid">${models}</div>`,
      })}
      ${colorRow({
        title: "バンパー", desc: "外周のバンパーの色",
        control: swatchRow(BUMPERS, L.bumper, "look-bumper", L.bumper, "look-bumper"),
      })}
      ${colorRow({
        title: "トラックボール", desc: "交換したボールの色に合わせられます",
        control: swatchRow(BALLS, L.ball, "look-ball", L.ball, "look-ball"),
      })}
      ${colorRow({
        title: "キーキャップ（全体）", desc: "すべてのキーキャップの基本の色",
        control: swatchRow(CAPS, L.cap, "look-cap", L.cap, "look-cap"),
      })}
      ${colorRow({
        title: "キーキャップ（1つずつ）",
        desc: "色を選んでから、上のキーボードのキーをクリックすると、そのキーだけ塗れます。同じ色でもう一度クリックすると基本の色に戻ります",
        control: swatchRow(BRUSHES, L.brush, "look-brush", L.brush, "look-brush") + `
          <div class="paint-row">
            <span class="n">塗ったキー：<b>${painted}</b> 個</span>
            <button type="button" style="margin-left:8px" ${act("look-arrows")}>矢印キーを初期色に</button>
            <button type="button" ${act("look-clear")}>塗った色をすべて戻す</button>
          </div>`,
      })}
    </section>`;
}

// --- Render: save bar -------------------------------------------------------

function renderSaveBar(counts) {
  const connected = !!state.client;
  const dirty = counts.key + counts.pointer > 0;
  const reached = !connected ? (dirty ? 1 : 0) : (dirty ? 2 : 3);
  const allDone = reached === 3;

  const stepDefs = [
    { label: "この画面", d: ICON.edit },
    { label: "キーボードで試す", d: ICON.bolt },
    { label: "キーボードに保存", d: ICON.keyboard },
  ];
  const steps = stepDefs.map((st, i) => {
    const done = i < reached;
    const pending = connected && dirty && i === 2;
    const markClass = cls(
      "step-mark",
      done && (allDone ? (i === 2 ? "is-ok" : "is-done") : i === reached - 1 ? "is-cur" : "is-past"),
      !done && pending && "is-pending",
    );
    const line = i > 0
      ? `<span class="${cls("step-line", i < reached && (allDone ? "is-ok" : "is-done"))}"></span>`
      : "";
    return `${line}<div class="step" title="${st.label}">
        <span class="${markClass}">${svg(allDone && i === 2 ? ICON.check : st.d, 15)}</span>
        <span class="${cls("step-label", (done || pending) && "is-lit")}">${st.label}</span>
      </div>`;
  }).join("");

  let title; let sub; let titleClass = "";
  if (!connected && !dirty) {
    title = "キーボードがつながっていません";
    sub = "つなぐと、キーボードに入っている現在の設定を読み込みます。";
    titleClass = "is-idle";
  } else if (!connected) {
    title = "変更はこの画面の中だけにあります";
    sub = "キーボードをつなぐまで、キーボードには届きません。";
  } else if (dirty) {
    title = "キーボードで試せます・まだ保存していません";
    sub = "電源を切ったり抜いたりすると、元の設定に戻ります。よければ「キーボードに保存」を押してください。";
  } else {
    title = "すべてキーボードに保存されています";
    sub = "キーボードを別のパソコンにつないでも、この設定のまま使えます。";
  }

  const chips = [];
  if (counts.key) chips.push(`キー配置 ${counts.key}か所`);
  if (counts.pointer) chips.push(`マウス操作 ${counts.pointer}項目`);

  // The notch is a sibling of the bar inside the same wrapper and sits behind
  // it, so it rises out from under the bar without moving anything.
  const notch = state.toast
    ? `<div class="${cls("notch", state.toastOut && "is-out", state.toastError && "is-error")}">
        <div>
          ${svg(state.toastError ? ICON.warn : ICON.check, 14, 2.6)}
          ${esc(state.toast)}
          <button type="button" ${act("toast-close")} aria-label="閉じる">${svg(ICON.close, 11, 2.4)}</button>
        </div>
      </div>`
    : "";

  return `<div class="savebar-wrap">
      ${notch}
      <div class="savebar">
        <div class="steps">${steps}</div>
        <div class="savebar-text">
          <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap">
            <span class="savebar-title ${titleClass}">${title}</span>
            ${chips.map((c) => `<span class="savebar-chip">${c}</span>`).join("")}
          </div>
          <div class="savebar-sub">${sub}</div>
        </div>
        <div class="savebar-actions">
          ${dirty ? `<button type="button" class="btn-discard" ${act("discard")} ${state.busy ? "disabled" : ""}>${svg(ICON.undo, 14)}${connected ? "元に戻す" : "変更を取り消す"}</button>` : ""}
          ${connected ? `<button type="button" class="${cls("btn-save", dirty && "is-live")}" ${dirty ? act("save") : ""} ${state.busy || !dirty ? "disabled" : ""}>${svg(ICON.keyboard, 15, 2.1)}キーボードに保存</button>` : ""}
          ${!connected ? `<button type="button" class="btn btn-accent" ${act("connect")} ${state.busy ? "disabled" : ""}>キーボードをつなぐ</button>` : ""}
        </div>
      </div>
    </div>`;
}

// --- Render -----------------------------------------------------------------

function applyTheme() {
  const pal = PALETTE[state.dark ? "dark" : "light"];
  const root = document.documentElement;
  // A dark accent on a dark page disappears -- #1D2433 is one of the eight
  // swatches and would be invisible. Lift it rather than refuse to show it.
  const lift = state.dark && hexLum(state.accent) < 0.3;
  root.style.setProperty("--accent", lift ? `color-mix(in srgb, ${state.accent} 25%, #DCE3EE)` : state.accent);
  root.style.setProperty("--on-accent", lift ? "#151B2B" : onAccentFor(state.accent));
  for (const [k, v] of Object.entries(pal)) root.style.setProperty(`--${k}`, v);
  root.style.colorScheme = state.dark ? "dark" : "light";
  lsSet(LS.theme, { dark: state.dark, accent: state.accent });
}

function render() {
  applyTheme();

  // The whole page is rebuilt on every change, which costs three things that
  // have to be put back by hand: the window scroll (keepScroll), the scroll
  // offset of anything scrollable inside it, and the focus.
  const scrollers = new Map();
  for (const el of document.querySelectorAll("[data-scroll]")) {
    scrollers.set(el.dataset.scroll, el.scrollTop);
  }

  // Focus: a text field the user is typing into would otherwise lose it on the
  // first keystroke.
  const focused = document.activeElement;
  const focusKey = focused && focused.dataset ? focused.dataset.f : null;
  const selStart = focusKey && focused.selectionStart;
  const selEnd = focusKey && focused.selectionEnd;

  const counts = { key: keyChangeCount(), pointer: pointerChangeCount() };
  const showBoard = state.tab === "keymap" || state.tab === "combo" || state.tab === "color";

  let under = "";
  if (state.tab === "keymap") under = renderEditor();
  else if (state.tab === "combo") under = renderComboPanel();
  else if (state.tab === "color") under = renderColor();

  const body = `<div class="shell">
      ${renderRail(counts)}
      <div class="main">
        ${renderHeader()}
        <div style="height:16px"></div>
        ${showBoard ? `<div class="stack">${renderBoardCard()}${under}</div>` : ""}
        ${state.tab === "pointer" ? renderPointer() : ""}
        ${state.tab === "bt" ? renderBluetooth() : ""}
        <div class="grow"></div>
        ${renderSaveBar(counts)}
      </div>
    </div>`;

  keepScroll(() => {
    document.getElementById("app").innerHTML = body;
    for (const [key, top] of scrollers) {
      const el = document.querySelector(`[data-scroll="${key}"]`);
      if (el) el.scrollTop = top;
    }
  });

  if (focusKey) {
    const next = document.querySelector(`[data-f="${focusKey}"]`);
    if (next) {
      // preventScroll, or focusing scrolls the field into view and undoes the
      // position just restored above.
      next.focus({ preventScroll: true });
      if (typeof selStart === "number" && next.setSelectionRange && next.type !== "range") {
        try { next.setSelectionRange(selStart, selEnd); } catch (_error) { /* unsupported input type */ }
      }
    }
  }
}

function renderBtConfirm(bonded) {
  return `<div class="modal-back" ${act("bt-cancel")}>
      <div class="modal" role="alertdialog" aria-modal="true" data-act="noop" data-stop>
        <div class="modal-icon">${svg(ICON.warn, 20)}</div>
        <h2>すべての登録を消しますか？</h2>
        <p>登録済みの ${bonded} 台との接続がすべて解除されます。もう一度使うには、それぞれの機器で登録し直す必要があります。この操作は取り消せません。</p>
        <div class="modal-actions">
          <button type="button" class="modal-cancel" ${act("bt-cancel")}>キャンセル</button>
          <button type="button" class="modal-confirm" ${act("bt-clear-all-confirm")}>すべて消す</button>
        </div>
      </div>
    </div>`;
}

// --- Startup animation ------------------------------------------------------
//
// The ZEN wordmark fades in, "Configurator" is typed below it, backspaced, and
// the time of day is typed in its place; then the line is select-all'd and
// deleted and the overlay leaves.
//
// Driven by timers rather than the 30-odd keyframes the design prototype used,
// because the app rebuilds #app on every state change and CSS animations
// inside it would restart each time. The splash therefore lives in its own
// element next to #app and is never touched by render().
//
// Characters are switched on and off whole (max-width 0 <-> 1.2em with no
// transition): the stepped look is the point, so nothing is interpolated.

const SPLASH = { type: 60, back: 40, start: 1450, holdBeforeBack: 550, gapAfterBack: 250, read: 2200, beforeDelete: 500, exit: 900 };
const splashTimers = [];

function splashGreeting() {
  const h = new Date().getHours();
  return h < 11 ? "Good morning" : h < 17 ? "Good afternoon" : "Good evening";
}

function clearSplash() {
  while (splashTimers.length) clearTimeout(splashTimers.pop());
  const host = document.getElementById("splash");
  if (host) host.innerHTML = "";
  state.splash = "";
}

function runSplash() {
  const host = document.getElementById("splash");
  if (!host) return;
  while (splashTimers.length) clearTimeout(splashTimers.pop());
  state.splash = "run";

  const first = Array.from("Configurator");
  const second = Array.from(splashGreeting());
  const chars = first.map((c, i) => `<span data-c="a${i}">${esc(c)}</span>`)
    .concat(second.map((c, i) => `<span data-c="b${i}">${esc(c)}</span>`)).join("");

  host.innerHTML = `<div class="splash" aria-hidden="true">
      ${logoSvg("zen", 58, 'class="splash-logo is-in" width="190"')}
      <div class="splash-line">
        <span class="pad"></span>
        <span class="splash-word">${chars}</span>
        <span class="splash-caret"></span>
      </div>
    </div>`;

  const root = host.querySelector(".splash");
  const logo = host.querySelector(".splash-logo");
  const word = host.querySelector(".splash-word");
  const caret = host.querySelector(".splash-caret");
  const at = (ms, fn) => splashTimers.push(setTimeout(fn, ms));
  const ch = (key) => word.querySelector(`[data-c="${key}"]`);

  // Someone who has seen it once should not have to sit through it again.
  root.addEventListener("click", clearSplash);

  if (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    at(300, clearSplash);
    return;
  }

  const s = SPLASH;
  at(900, () => { caret.classList.add("is-on", "is-blink"); });

  const typed = s.start + first.length * s.type;
  first.forEach((_c, i) => at(s.start + i * s.type, () => ch(`a${i}`).classList.add("is-in")));

  const backStart = typed + s.holdBeforeBack;
  first.forEach((_c, i) => at(backStart + (first.length - 1 - i) * s.back, () => ch(`a${i}`).classList.remove("is-in")));

  const second0 = backStart + first.length * s.back + s.gapAfterBack;
  second.forEach((_c, i) => at(second0 + i * s.type, () => ch(`b${i}`).classList.add("is-in")));

  const end = second0 + second.length * s.type;
  const select = end + s.read;
  const del = select + s.beforeDelete;
  at(select, () => word.classList.add("is-sel"));
  at(del, () => word.classList.add("is-del"));
  at(del + 350, () => { logo.classList.remove("is-in"); logo.classList.add("is-out"); });
  at(del + s.exit, () => root.classList.add("is-gone"));
  at(del + s.exit + 180, clearSplash);
}

// --- Events -----------------------------------------------------------------

function selectKeyAt(index) {
  if (state.active && index === state.sel) {
    state.active = false;
  } else {
    state.sel = index;
    state.active = true;
    state.search = "";
    state.ed = parseInto(state.keymap[state.layer].bindings[index]);
  }
  render();
}

function setRole(id) {
  const e = state.ed;
  if (id === "layer") e.kind = LAYER_MODE[e.kind] ? e.kind : "mo";
  else if (id === "mkp") { e.kind = "mkp"; e.opt = MOUSE[e.opt] ? e.opt : "LCLK"; }
  else if (id === "bt") { e.kind = "bt"; e.opt = e.opt && e.opt.startsWith("BT_") ? e.opt : "BT_SEL 0"; }
  else if (id === "out") { e.kind = "out"; e.opt = e.opt && e.opt.startsWith("OUT_") ? e.opt : "OUT_TOG"; }
  else if (id === "mt") { e.kind = "mt"; e.hold = e.hold || "LSHFT"; }
  else e.kind = id;
  writeBinding(composeBinding());
}

const CLICK = {
  connect: () => connect(),
  disconnect: () => disconnect(),
  save: () => saveToKeyboard(),
  discard: () => discardChanges(),
  "pointer-reset": () => resetPointer(),

  "theme-toggle": () => { state.themeOpen = !state.themeOpen; state.presetsOpen = false; render(); },
  "presets-toggle": () => { state.presetsOpen = !state.presetsOpen; state.themeOpen = false; render(); },
  "set-dark": (a) => { state.dark = a === "1"; render(); },
  "pick-open": (a) => {
    const next = state.pick === a ? null : a;
    closePick();
    state.pick = next;
    if (state.pick) state.pickHue = hexToHsv(pickTargetHex())[0];
    render();
  },
  "pick-close": () => { closePick(); render(); },
  "pick-recent": (a) => {
    if (state.pick === "accent") setAccentLive(a);
    else setLookLive(state.pick, a);
    state.pickHue = hexToHsv(a)[0];
    render();
  },

  "set-accent": (a) => { state.accent = a; state.hexDraft = a.slice(1); state.hexInvalid = false; render(); },
  "reset-accent": () => { state.accent = DEFAULT_ACCENT; state.hexDraft = DEFAULT_ACCENT.slice(1); state.hexInvalid = false; render(); },

  "preset-add": () => addPreset(),
  "preset-delete": (a) => deletePreset(a),
  "preset-apply": (a) => {
    const preset = loadPresets().find((p) => p.name === a);
    if (!preset) return;
    state.lastPreset = a;
    state.presetsOpen = false;
    applySnapshot(preset.data, `「${a}」`);
  },
  export: () => exportFile(),
  import: () => importFile(),

  tab: (a) => {
    state.tab = a;
    render();
    // First visit to the combo tab with a remembered file: load it rather than
    // making the user press a button for something they already chose.
    if (a === "combo" && !state.combos && !state.comboBusy && canEditCombos() && keymapPath()) {
      loadCombos();
    }
  },
  layer: (a) => {
    state.layer = Number(a);
    state.search = "";
    state.ed = parseInto(state.keymap[state.layer].bindings[state.sel]);
    render();
  },
  tip: () => { state.tip = !state.tip; render(); },
  rename: () => { state.renaming = !state.renaming; render(); },
  key: (a) => {
    const index = Number(a);
    if (state.tab === "color") {
      // Same colour again means "unpaint": the cap goes back to the base.
      const paint = { ...state.look.paint };
      if (paint[index] === state.look.brush) delete paint[index];
      else paint[index] = state.look.brush;
      setLook({ paint });
      return;
    }
    if (state.tab === "combo") {
      const sel = state.combos && state.combos.find((c) => c.uid === state.comboSel);
      if (!sel) return;
      sel.keyPositions = sel.keyPositions.includes(index)
        ? sel.keyPositions.filter((k) => k !== index)
        : sel.keyPositions.concat([index]).sort((a, b) => a - b);
      render();
      return;
    }
    selectKeyAt(index);
  },
  deselect: () => { state.active = false; render(); },
  advanced: () => { state.advanced = !state.advanced; render(); },
  role: (a) => setRole(a),
  "layer-mode": (a) => { state.ed.kind = a; writeBinding(composeBinding()); },
  "layer-arg": (a) => { state.ed.layerArg = Number(a); writeBinding(composeBinding()); },
  hold: (a) => { state.ed.hold = a; writeBinding(composeBinding()); },
  mod: (a) => { state.ed.mods[a] = !state.ed.mods[a]; writeBinding(composeBinding()); },
  opt: (a) => { state.ed.opt = a; writeBinding(composeBinding()); },
  "pick-key": (a) => { state.ed.keyName = a; writeBinding(composeBinding()); },
  cat: (a) => { state.cat = a; render(); },

  "combo-pick": () => loadCombos({ pick: true }),
  "combo-reload": () => loadCombos(),
  "combo-save": () => saveCombos(),
  "combo-add": () => {
    const combo = {
      uid: ++comboUid, name: null, keyPositions: [], bindings: "&kp ESCAPE",
      layers: [state.layer], timeoutMs: COMBO_DEFAULT_TIMEOUT_MS, extra: [],
    };
    state.combos.push(combo);
    state.comboSel = combo.uid;
    render();
  },
  "combo-sel": (a) => {
    const uid = Number(a);
    state.comboSel = state.comboSel === uid ? null : uid;
    render();
  },
  "combo-out": (a) => {
    const sel = state.combos.find((c) => c.uid === state.comboSel);
    if (sel) sel.bindings = `&kp ${a}`;
    render();
  },
  "combo-delete": () => {
    state.combos = state.combos.filter((c) => c.uid !== state.comboSel);
    state.comboSel = null;
    render();
  },

  "bt-select": (a) => bleAction(BLE_ACTION.SELECT, Number(a)),
  "bt-disconnect": (a) => bleAction(BLE_ACTION.DISCONNECT, Number(a)),
  "bt-clear": (a) => bleAction(BLE_ACTION.CLEAR, Number(a)),
  "bt-clear-all": () => { state.btConfirm = true; render(); },
  "bt-cancel": () => { state.btConfirm = false; render(); },
  "bt-clear-all-confirm": () => {
    state.btConfirm = false;
    bleAction(BLE_ACTION.CLEAR_ALL, 0);
  },

  "look-model": (a) => {
    const m = MODELS[a];
    setLook({ model: a, bumper: m.bumper, cap: m.cap, ball: m.ball });
  },
  "look-bumper": (a) => setLook({ bumper: a }),
  "look-cap": (a) => setLook({ cap: a }),
  "look-ball": (a) => setLook({ ball: a }),
  "look-brush": (a) => setLook({ brush: a }),
  "look-arrows": () => setLook({ paint: { ...state.look.paint, ...Object.fromEntries(ARROW_KEYS.map((i) => [i, ARROW_CAP])) } }),
  "look-clear": () => setLook({ paint: {} }),

  "splash-replay": () => { state.themeOpen = false; render(); runSplash(); },

  "toast-close": () => { state.toast = ""; state.toastOut = false; render(); },
};

function onToggleSwitch(action) {
  const key = action.replace("toggle-", "");
  if (key === "look-reflect") return setLook({ reflect: !state.look.reflect });
  if (POINTER_WIRE_KEYS.includes(key)) writePointer({ [key]: !state.pointer[key] });
  else { state.pointer[key] = !state.pointer[key]; render(); }
}

function init() {
  const app = document.getElementById("app");

  app.addEventListener("click", (event) => {
    const el = event.target.closest("[data-act]");
    if (!el) return;
    // A click inside the dialog must not fall through to the backdrop.
    if (el.hasAttribute("data-stop")) return;
    const action = el.dataset.act;
    if (action.startsWith("toggle-")) return onToggleSwitch(action);
    const handler = CLICK[action];
    if (handler) handler(el.dataset.a, el.dataset.b);
  });

  // Dragging in the picker's colour square. Pointer capture keeps the events
  // coming to the square even when the pointer leaves it mid-drag.
  app.addEventListener("pointerdown", (event) => {
    const sv = event.target.closest && event.target.closest("[data-pick-sv]");
    if (!sv) return;
    event.preventDefault();
    sv.setPointerCapture(event.pointerId);
    const move = (e) => applyPick(svHex(sv, e));
    const up = () => {
      sv.removeEventListener("pointermove", move);
      sv.removeEventListener("pointerup", up);
      sv.removeEventListener("pointercancel", up);
    };
    sv.addEventListener("pointermove", move);
    sv.addEventListener("pointerup", up);
    sv.addEventListener("pointercancel", up);
    applyPick(svHex(sv, event));
  });

  // Live readout while dragging a slider — state only, no re-render, so the
  // drag is not interrupted.
  app.addEventListener("input", (event) => {
    const t = event.target;
    if (t.hasAttribute("data-pick-hue")) {
      state.pickHue = Number(t.value);
      const sv = document.querySelector("[data-pick-sv]");
      if (sv) sv.style.setProperty("--hue", hsvToHex(state.pickHue, 1, 1));
      const [, sat, val] = hexToHsv(pickTargetHex());
      // A grey has no hue to keep, so dragging the strip would do nothing
      // visible. Give it full saturation instead, which is what the user is
      // reaching for when they drag a colour strip.
      applyPick(hsvToHex(state.pickHue, sat || 1, val || 1));
      return;
    }
    if (t.dataset.slider) {
      const key = t.dataset.slider;
      const value = Number(t.value);
      const spec = SLIDERS[key];
      if (key === "comboTerm") {
        const sel = state.combos && state.combos.find((c) => c.uid === state.comboSel);
        if (sel) sel.timeoutMs = value;
      } else {
        state.pointer[key] = value;
      }
      t.style.setProperty("--p", sliderPct(key, value));
      const readout = app.querySelector(`[data-readout="${key}"]`);
      if (readout) {
        readout.querySelector(".v").textContent = spec.fmt(value);
        readout.querySelector(".w").textContent = spec.word(value);
      }
      return;
    }
    if (t.dataset.search !== undefined && t.hasAttribute("data-search")) { state.search = t.value; render(); return; }
    if (t.hasAttribute("data-hex")) {
      const v = t.value.replace(/[^0-9A-Fa-f#]/g, "");
      if (validHex(v)) {
        state.accent = normHex(v);
        state.hexDraft = normHex(v).slice(1);
        state.hexInvalid = false;
      } else {
        state.hexDraft = v.replace(/^#/, "").toUpperCase();
        state.hexInvalid = v.replace(/^#/, "").length >= 6;
      }
      render();
      return;
    }
    if (t.hasAttribute("data-preset-name")) { state.presetName = t.value; return; }
    if (t.hasAttribute("data-layer-name")) {
      state.layerNames[state.layer] = t.value;
      lsSet(LS.layerNames, state.layerNames);
      // Re-render so the layer chip updates, but keep the caret (data-f).
      render();
    }
  });

  app.addEventListener("change", (event) => {
    const t = event.target;
    if (t.dataset.slider) {
      const key = t.dataset.slider;
      if (key === "comboTerm") return render();
      if (POINTER_WIRE_KEYS.includes(key)) return writePointer({ [key]: Number(t.value) });
      state.pointer[key] = Number(t.value);
      return render();
    }
    if (t.hasAttribute("data-raw")) return writeBinding(t.value);
  });

  // Close the header popovers when clicking elsewhere. The "was it inside a
  // popover?" test has to run in the capture phase: by the time the click
  // bubbles back up, the handler above has already re-rendered and the clicked
  // node is detached, so closest() would always say "outside".
  let insidePop = false;
  let insidePick = false;
  document.addEventListener("click", (event) => {
    const near = event.target.closest;
    insidePop = !!(near && event.target.closest(".pop-wrap"));
    // The swatch row and the hex row count as "inside": picking a preset while
    // the picker is open should not shut it.
    insidePick = !!(near && event.target.closest(".pick, .sw-row, .hex-row"));
  }, true);
  document.addEventListener("click", () => {
    let changed = false;
    if ((state.themeOpen || state.presetsOpen) && !insidePop) {
      state.themeOpen = false;
      state.presetsOpen = false;
      changed = true;
    }
    if (state.pick && !insidePick) {
      closePick();
      changed = true;
    }
    if (changed) render();
  });

  state.ed = parseInto(state.keymap[state.layer].bindings[state.sel]);
  render();
  runSplash();
}

document.addEventListener("DOMContentLoaded", init);
