// ZEN Configurator — wire protocol client.
//
// Mirrors include/zen_config_wire.h and src/zen_config_serial_bridge.c
// exactly (magic/version/command/payload_len framing, request/response over
// the same USB-serial port used by the studio-rpc-usb-uart snippet). This is
// NOT ZMK Studio's protobuf/RPC protocol — it's a small bespoke one that
// talks directly to the ZEN firmware's own bridge.

"use strict";

const WIRE_MAGIC = 0x314e455a; // "ZEN1", little-endian, matches ZEN_CONFIG_WIRE_MAGIC
const WIRE_VERSION = 1;
const WIRE_HEADER_SIZE = 8;
const RESPONSE_BIT = 0x80;

const CMD = {
  GET_POINTER: 0x01,
  SET_POINTER: 0x02,
  SAVE_POINTER: 0x03,
  RESET_POINTER: 0x04,
  GET_KEYMAP_META: 0x10,
  GET_LAYER: 0x11,
  SET_BINDING: 0x12,
  SAVE_KEYMAP: 0x13,
  DISCARD_KEYMAP: 0x14,
  GET_STATUS: 0x20,
};

const STATUS = {
  0: "OK",
  1: "unknown command",
  2: "malformed frame",
  3: "invalid payload",
  4: "invalid location",
  5: "unknown behavior",
  6: "not supported (peripheral has no local keymap, or feature disabled)",
  7: "generic error",
};

const BEHAVIOR_NAME_LEN = 16;
const BINDING_SIZE = BEHAVIOR_NAME_LEN + 4 + 4;
const POINTER_PAYLOAD_SIZE = 8;
const STATUS_PAYLOAD_SIZE = 7;
const TRANSPORT_NAMES = { 0: "USB", 1: "BLE" };
const ROLE_NAMES = { 0: "standalone", 1: "central", 2: "peripheral" };

// --- Behavior param encode/decode -----------------------------------------

const BT_CMD_VALUES = { BT_CLR: 0, BT_NXT: 1, BT_PRV: 2, BT_SEL: 3, BT_CLR_ALL: 4, BT_DISC: 5 };
const OUT_VALUES = { OUT_TOG: 0, OUT_USB: 1, OUT_BLE: 2 };
const MOUSE_BTN_VALUES = { LCLK: 1, MB1: 1, RCLK: 2, MB2: 2, MCLK: 4, MB3: 4, MB4: 8, MB5: 16 };

// Matches zmk/app/include/dt-bindings/zmk/modifiers.h APPLY_MODS: modifier
// bits live in the top byte of the 32-bit keycode (mods << 24 | keycode).
// Wrappers nest (e.g. LC(LS(A))) because each APPLY_MODS only ORs its own
// bit into that shared top byte.
const MOD_BITS = { LC: 0x01, LS: 0x02, LA: 0x04, LG: 0x08, RC: 0x10, RS: 0x20, RA: 0x40, RG: 0x80 };

/** Parse "A", "RG(LEFT_BRACKET)", or nested "LC(LS(A))" into {value, mods}. */
function parseModifiedKeycode(token) {
  const m = /^(LC|LS|LA|LG|RC|RS|RA|RG)\((.*)\)$/.exec(token);
  if (!m) return token in KEYCODE_VALUES ? { value: KEYCODE_VALUES[token], mods: 0 } : null;
  const inner = parseModifiedKeycode(m[2].trim());
  if (!inner) return null;
  return { value: inner.value, mods: inner.mods | MOD_BITS[m[1]] };
}

/** Inverse of parseModifiedKeycode, for display. */
function decodeModifiedKeycode(rawValue) {
  const mods = (rawValue >>> 24) & 0xff;
  const base = rawValue & 0x00ffffff;
  let expr = KEYCODE_REVERSE.get(base) ?? String(base);
  for (const [modName, bit] of Object.entries(MOD_BITS)) {
    if (mods & bit) expr = `${modName}(${expr})`;
  }
  return expr;
}

// Reverse lookups (value -> canonical short name), built once. When several
// aliases share a value (e.g. AMPS/AMPERSAND), the shortest wins for display.
function buildReverseMap(forward) {
  const reverse = new Map();
  for (const [name, value] of Object.entries(forward)) {
    const current = reverse.get(value);
    if (!current || name.length < current.length) {
      reverse.set(value, name);
    }
  }
  return reverse;
}

const KEYCODE_REVERSE = buildReverseMap(KEYCODE_VALUES);
const BT_CMD_REVERSE = buildReverseMap(BT_CMD_VALUES);
const OUT_REVERSE = buildReverseMap(OUT_VALUES);
const MOUSE_BTN_REVERSE = buildReverseMap(MOUSE_BTN_VALUES);

// The wire protocol's binding "name" is zmk_behavior_get_binding()'s lookup
// key, which compares against the behavior device's runtime name — i.e. the
// devicetree node's own name (zmk/app/dts/behaviors/*.dtsi), NOT the short
// `&kp`-style DT label used in binding strings. Sending/parsing the short
// label directly fails silently on the wire (decode falls through to the
// generic display, encode gets "unknown behavior" back from the firmware).
const BEHAVIOR_DEVICE_NAMES = {
  trans: "transparent",
  none: "none",
  kp: "key_press",
  mo: "momentary_layer",
  to: "to_layer",
  tog: "toggle_layer",
  sl: "sticky_layer",
  mt: "mod_tap",
  mkp: "mouse_key_press",
  bt: "bluetooth",
  out: "outputs",
};
const BEHAVIOR_SHORT_NAMES = Object.fromEntries(
  Object.entries(BEHAVIOR_DEVICE_NAMES).map(([short, device]) => [device, short]),
);

/**
 * Parse a ZMK binding string like "&kp Q", "&kp RG(LEFT_BRACKET)", or
 * "&bt BT_SEL 0" into {name, param1, param2} for the wire protocol (name is
 * the firmware's behavior device name, e.g. "key_press"). Returns null when
 * the binding uses syntax this prototype doesn't understand yet — callers
 * should refuse to send those rather than guess.
 */
function encodeBinding(bindingString) {
  const tokens = bindingString.trim().replace(/^&/, "").split(/\s+/);
  const name = tokens[0];
  const args = tokens.slice(1);

  const params = (() => {
    switch (name) {
      case "trans":
      case "none":
        return { param1: 0, param2: 0 };
      case "kp": {
        if (args.length !== 1) return null;
        const parsed = parseModifiedKeycode(args[0]);
        if (!parsed) return null;
        return { param1: ((parsed.mods << 24) | parsed.value) >>> 0, param2: 0 };
      }
      case "mo":
      case "to":
      case "tog":
      case "sl": {
        if (args.length !== 1 || !/^\d+$/.test(args[0])) return null;
        return { param1: Number(args[0]), param2: 0 };
      }
      case "mt": {
        if (args.length !== 2) return null;
        const first = parseModifiedKeycode(args[0]);
        const second = parseModifiedKeycode(args[1]);
        if (!first || !second) return null;
        return {
          param1: ((first.mods << 24) | first.value) >>> 0,
          param2: ((second.mods << 24) | second.value) >>> 0,
        };
      }
      case "mkp": {
        if (args.length !== 1 || !(args[0] in MOUSE_BTN_VALUES)) return null;
        return { param1: MOUSE_BTN_VALUES[args[0]], param2: 0 };
      }
      case "bt": {
        if (args[0] === "BT_SEL") {
          if (args.length !== 2 || !/^\d+$/.test(args[1])) return null;
          return { param1: BT_CMD_VALUES.BT_SEL, param2: Number(args[1]) };
        }
        if (args.length !== 1 || !(args[0] in BT_CMD_VALUES)) return null;
        return { param1: BT_CMD_VALUES[args[0]], param2: 0 };
      }
      case "out": {
        if (args.length !== 1 || !(args[0] in OUT_VALUES)) return null;
        return { param1: OUT_VALUES[args[0]], param2: 0 };
      }
      default:
        return null;
    }
  })();

  if (!params) return null;
  return { name: BEHAVIOR_DEVICE_NAMES[name], param1: params.param1, param2: params.param2 };
}

/** Best-effort inverse of encodeBinding, for displaying what the device sent. */
function decodeBinding(name, param1, param2) {
  const shortName = BEHAVIOR_SHORT_NAMES[name] ?? name;
  switch (shortName) {
    case "trans":
      return "&trans";
    case "none":
      return "&none";
    case "kp":
      return `&kp ${decodeModifiedKeycode(param1)}`;
    case "mo":
    case "to":
    case "tog":
    case "sl":
      return `&${shortName} ${param1}`;
    case "mt":
      return `&mt ${decodeModifiedKeycode(param1)} ${decodeModifiedKeycode(param2)}`;
    case "mkp":
      return `&mkp ${MOUSE_BTN_REVERSE.get(param1) ?? param1}`;
    case "bt":
      if (param1 === BT_CMD_VALUES.BT_SEL) return `&bt BT_SEL ${param2}`;
      return `&bt ${BT_CMD_REVERSE.get(param1) ?? param1}`;
    case "out":
      return `&out ${OUT_REVERSE.get(param1) ?? param1}`;
    default:
      return `&${name} ${param1} ${param2}`;
  }
}

// --- Wire framing -----------------------------------------------------------

function encodeFrame(command, payloadBytes) {
  const payload = payloadBytes ?? new Uint8Array(0);
  const frame = new Uint8Array(WIRE_HEADER_SIZE + payload.length);
  const view = new DataView(frame.buffer);
  view.setUint32(0, WIRE_MAGIC, true);
  frame[4] = WIRE_VERSION;
  frame[5] = command;
  view.setUint16(6, payload.length, true);
  frame.set(payload, WIRE_HEADER_SIZE);
  return frame;
}

// Matches ZEN_POINTER_SETTINGS_VERSION. Version 2 added the trackball
// rotation in byte 6; version 1 left that byte reserved and zero.
const POINTER_SETTINGS_VERSION = 2;
const ROTATION_MIN = -45;
const ROTATION_MAX = 45;

function encodePointerPayload(settings) {
  const bytes = new Uint8Array(POINTER_PAYLOAD_SIZE);
  const view = new DataView(bytes.buffer);
  // Byte 0 tells the keyboard which fields this payload carries. Echo back
  // the version the keyboard itself reported: its validator rejects a payload
  // whose version it does not recognise, so announcing 2 to version-1
  // firmware would break every pointer write rather than just the new field.
  const version = settings.version ?? POINTER_SETTINGS_VERSION;
  bytes[0] = version;
  view.setUint16(1, settings.pointerSpeed, true);
  view.setUint16(3, settings.scrollSpeed, true);
  bytes[5] =
    (settings.invertX ? 1 : 0) | (settings.invertY ? 2 : 0) | (settings.invertScroll ? 4 : 0);
  if (version >= 2) {
    const degrees = Math.round(settings.rotationDegrees ?? 0);
    view.setInt8(6, Math.max(ROTATION_MIN, Math.min(ROTATION_MAX, degrees)));
  }
  return bytes;
}

function decodePointerPayload(bytes) {
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  return {
    version: bytes[0],
    pointerSpeed: view.getUint16(1, true),
    scrollSpeed: view.getUint16(3, true),
    invertX: (bytes[5] & 1) !== 0,
    invertY: (bytes[5] & 2) !== 0,
    invertScroll: (bytes[5] & 4) !== 0,
    rotationDegrees: bytes[0] >= 2 ? view.getInt8(6) : 0,
  };
}

/** Matches include/zen_config_wire.h's ZEN_CONFIG_WIRE_STATUS_PAYLOAD_SIZE layout. */
function decodeStatusPayload(bytes) {
  return {
    localBattery: bytes[0],
    peripheralBattery: bytes[1] === 1 ? bytes[2] : null,
    role: ROLE_NAMES[bytes[3]] ?? "unknown",
    connected: bytes[4] === 1,
    activeProfile: bytes[5] === 0xff ? null : bytes[5],
    transport: TRANSPORT_NAMES[bytes[6]] ?? null,
  };
}

function encodeBindingEntry(name, param1, param2) {
  const entry = new Uint8Array(BINDING_SIZE);
  const nameBytes = new TextEncoder().encode(name).slice(0, BEHAVIOR_NAME_LEN - 1);
  entry.set(nameBytes, 0);
  const view = new DataView(entry.buffer);
  view.setUint32(BEHAVIOR_NAME_LEN, param1 >>> 0, true);
  view.setUint32(BEHAVIOR_NAME_LEN + 4, param2 >>> 0, true);
  return entry;
}

function decodeBindingEntry(bytes, offset) {
  const nameBytes = bytes.subarray(offset, offset + BEHAVIOR_NAME_LEN);
  const nulIndex = nameBytes.indexOf(0);
  const name = new TextDecoder().decode(nameBytes.subarray(0, nulIndex < 0 ? BEHAVIOR_NAME_LEN : nulIndex));
  const view = new DataView(bytes.buffer, bytes.byteOffset + offset, BINDING_SIZE);
  const param1 = view.getUint32(BEHAVIOR_NAME_LEN, true);
  const param2 = view.getUint32(BEHAVIOR_NAME_LEN + 4, true);
  return { name, param1, param2 };
}

// --- Transport ---------------------------------------------------------------

const BAUD_RATE = 115200;

// Same page, two ways to reach the keyboard. In a browser that is Web Serial;
// in the desktop shell it is a Rust-side port, because WKWebView has no
// navigator.serial and a menubar item has to keep polling with no window open.
// Both expose write / startReading / close, and everything below this line --
// framing, encoding, decoding -- is shared, so there is one implementation of
// the wire format rather than two that drift apart.

class WebSerialTransport {
  constructor(port) {
    this.port = port;
    this.reader = null;
    this.writer = null;
    this.loop = null;
  }

  static supported() {
    return typeof navigator !== "undefined" && !!navigator.serial;
  }

  static async request() {
    const port = await navigator.serial.requestPort();
    await port.open({ baudRate: BAUD_RATE });
    return new WebSerialTransport(port);
  }

  startReading(onChunk, onError) {
    this.writer = this.port.writable.getWriter();
    this.reader = this.port.readable.getReader();
    this.loop = (async () => {
      try {
        while (true) {
          const { value, done } = await this.reader.read();
          if (done) return;
          if (value) onChunk(value);
        }
      } catch (error) {
        onError(error);
      }
    })();
  }

  async write(bytes) {
    await this.writer.write(bytes);
  }

  async close() {
    try {
      this.reader?.cancel();
    } catch (_e) {
      // ignore
    }
    try {
      await this.loop;
    } catch (_e) {
      // ignore
    }
    try {
      this.writer?.releaseLock();
    } catch (_e) {
      // ignore
    }
    await this.port.close();
  }
}

class TauriTransport {
  constructor(invoke, path) {
    this.invoke = invoke;
    this.path = path;
    this.running = false;
    this.loop = null;
  }

  static supported() {
    // Test for the thing we actually call, not just for "is this Tauri" --
    // window.__TAURI__ only exists when withGlobalTauri is on, and without a
    // bundler there is no @tauri-apps/api import to fall back to.
    return typeof window !== "undefined" && typeof window.__TAURI__?.core?.invoke === "function";
  }

  static async request() {
    const { invoke } = window.__TAURI__.core;
    const ports = await invoke("list_ports");
    if (ports.length === 0) {
      throw new Error("キーボードが見つかりません。USBで接続してください");
    }
    // One CDC-ACM port is the normal case. More than one means another serial
    // device is plugged in too, so ask rather than guess wrong.
    const chosen = ports.length === 1 ? ports[0] : await pickPort(ports);
    await invoke("open_port", { path: chosen.path, baudRate: BAUD_RATE });
    return new TauriTransport(invoke, chosen.path);
  }

  startReading(onChunk, onError) {
    this.running = true;
    this.loop = (async () => {
      while (this.running) {
        try {
          // Returns empty on timeout, which is just an idle port.
          const chunk = await this.invoke("read_port", { timeoutMs: 50 });
          if (chunk.length > 0) onChunk(new Uint8Array(chunk));
        } catch (error) {
          if (this.running) onError(new Error(String(error)));
          return;
        }
      }
    })();
  }

  async write(bytes) {
    await this.invoke("write_port", { data: Array.from(bytes) });
  }

  async close() {
    this.running = false;
    try {
      await this.loop;
    } catch (_e) {
      // ignore
    }
    await this.invoke("close_port");
  }
}

// Replaced by the app shell with a real chooser; the plain fallback keeps the
// browser build from depending on anything the desktop shell provides.
let pickPort = async (ports) => ports[0];
function setPortPicker(fn) {
  pickPort = fn;
}

function activeTransportClass() {
  if (TauriTransport.supported()) return TauriTransport;
  if (WebSerialTransport.supported()) return WebSerialTransport;
  return null;
}

class ZenConfigClient {
  constructor(transport) {
    this.transport = transport;
    this.rxBuffer = new Uint8Array(0);
    this.pending = null; // { resolve, reject, expectedCommand }
  }

  static async requestAndOpen() {
    const Transport = activeTransportClass();
    if (!Transport) {
      throw new Error("このブラウザはWeb Serialに対応していません（Chrome/Edgeをお使いください）");
    }
    const transport = await Transport.request();
    const client = new ZenConfigClient(transport);
    transport.startReading(
      (chunk) => client._ingest(chunk),
      (error) => {
        if (client.pending) {
          client.pending.reject(error);
          client.pending = null;
        }
      },
    );
    return client;
  }

  async close() {
    await this.transport.close();
  }

  _ingest(chunk) {
    const merged = new Uint8Array(this.rxBuffer.length + chunk.length);
    merged.set(this.rxBuffer, 0);
    merged.set(chunk, this.rxBuffer.length);
    this.rxBuffer = merged;

    while (true) {
      const magicIndex = this._findMagic();
      if (magicIndex < 0) {
        // Keep at most the last 3 bytes — a partial magic could be split
        // across reads.
        if (this.rxBuffer.length > 3) {
          this.rxBuffer = this.rxBuffer.slice(this.rxBuffer.length - 3);
        }
        return;
      }
      if (magicIndex > 0) {
        this.rxBuffer = this.rxBuffer.slice(magicIndex);
      }
      if (this.rxBuffer.length < WIRE_HEADER_SIZE) return;

      const view = new DataView(this.rxBuffer.buffer, this.rxBuffer.byteOffset, WIRE_HEADER_SIZE);
      const payloadLen = view.getUint16(6, true);
      const frameSize = WIRE_HEADER_SIZE + payloadLen;
      if (this.rxBuffer.length < frameSize) return;

      const command = this.rxBuffer[5];
      const payload = this.rxBuffer.slice(WIRE_HEADER_SIZE, frameSize);
      this.rxBuffer = this.rxBuffer.slice(frameSize);
      this._dispatchResponse(command, payload);
    }
  }

  _findMagic() {
    for (let i = 0; i + 4 <= this.rxBuffer.length; i++) {
      const view = new DataView(this.rxBuffer.buffer, this.rxBuffer.byteOffset + i, 4);
      if (view.getUint32(0, true) === WIRE_MAGIC) return i;
    }
    return -1;
  }

  _dispatchResponse(command, payload) {
    if (!this.pending) return;
    if (command !== (this.pending.expectedCommand | RESPONSE_BIT)) return;

    const status = payload[0];
    const data = payload.slice(1);
    const { resolve } = this.pending;
    this.pending = null;
    resolve({ status, statusText: STATUS[status] ?? "unknown status", data });
  }

  /** Sends one request and waits for its matching response. Half-duplex —
   * only one request may be in flight at a time (matches the firmware's own
   * single-threaded bridge). */
  async request(command, payloadBytes) {
    if (this.pending) {
      throw new Error("A request is already in flight");
    }

    const responsePromise = new Promise((resolve, reject) => {
      this.pending = { resolve, reject, expectedCommand: command };
    });

    await this.transport.write(encodeFrame(command, payloadBytes));

    const timeout = new Promise((_resolve, reject) =>
      setTimeout(() => reject(new Error("Timed out waiting for device response")), 3000),
    );

    return Promise.race([responsePromise, timeout]);
  }

  async getPointerSettings() {
    const { status, data } = await this.request(CMD.GET_POINTER);
    if (status !== 0) throw new Error(`GET_POINTER failed: ${STATUS[status]}`);
    return decodePointerPayload(data);
  }

  async getStatus() {
    const { status, data } = await this.request(CMD.GET_STATUS);
    if (status !== 0) throw new Error(`GET_STATUS failed: ${STATUS[status]}`);
    return decodeStatusPayload(data);
  }

  async setPointerSettings(settings) {
    const { status } = await this.request(CMD.SET_POINTER, encodePointerPayload(settings));
    if (status !== 0) throw new Error(`SET_POINTER failed: ${STATUS[status]}`);
  }

  async savePointerSettings() {
    const { status } = await this.request(CMD.SAVE_POINTER);
    if (status !== 0) throw new Error(`SAVE_POINTER failed: ${STATUS[status]}`);
  }

  async resetPointerSettings() {
    const { status, data } = await this.request(CMD.RESET_POINTER);
    if (status !== 0) throw new Error(`RESET_POINTER failed: ${STATUS[status]}`);
    return decodePointerPayload(data);
  }

  async getKeymapMeta() {
    const { status, data } = await this.request(CMD.GET_KEYMAP_META);
    if (status !== 0) throw new Error(`GET_KEYMAP_META failed: ${STATUS[status]}`);
    const layerCount = data[0];
    const view = new DataView(data.buffer, data.byteOffset + 1, 2);
    const keyPositionCount = view.getUint16(0, true);
    const layerIds = Array.from(data.slice(3, 3 + layerCount));
    return { layerCount, keyPositionCount, layerIds };
  }

  async getLayer(layerId, keyPositionCount) {
    const { status, data } = await this.request(CMD.GET_LAYER, new Uint8Array([layerId]));
    if (status !== 0) throw new Error(`GET_LAYER failed: ${STATUS[status]}`);
    const bindings = [];
    for (let i = 0; i < keyPositionCount; i++) {
      bindings.push(decodeBindingEntry(data, i * BINDING_SIZE));
    }
    return bindings;
  }

  async setBinding(layerId, keyPosition, name, param1, param2) {
    const payload = new Uint8Array(1 + 2 + BINDING_SIZE);
    payload[0] = layerId;
    new DataView(payload.buffer).setUint16(1, keyPosition, true);
    payload.set(encodeBindingEntry(name, param1, param2), 3);

    const { status } = await this.request(CMD.SET_BINDING, payload);
    if (status !== 0) throw new Error(`SET_BINDING failed: ${STATUS[status]}`);
  }

  async saveKeymap() {
    const { status } = await this.request(CMD.SAVE_KEYMAP);
    if (status !== 0) throw new Error(`SAVE_KEYMAP failed: ${STATUS[status]}`);
  }

  async discardKeymap() {
    const { status } = await this.request(CMD.DISCARD_KEYMAP);
    if (status !== 0) throw new Error(`DISCARD_KEYMAP failed: ${STATUS[status]}`);
  }
}
