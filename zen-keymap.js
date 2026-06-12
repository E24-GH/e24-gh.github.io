/* ZEN — interactive key map (ZMK layers).
   The physical layout is fixed; key *assignments* mirror the default
   firmware that ships with the kit (layers 0–3). Buyers remap everything
   in the ZMK Keymap Editor — this widget just shows how one physical key
   carries different roles across the four layers.

   labels = [ベース, マウス, 数字・記号, Fn・テンキー]
   ""  → &trans（そのレイヤーでは役割が変わらない＝ベースの刻印を薄く表示） */
(function () {
  var LAYER_NAMES = ["ベース", "マウス", "数字・記号", "Fn・テンキー"];

  var LAYER_INFO = [
    "ベースレイヤー — 文字入力。親指・小指のレイヤーキーで、ほかのレイヤーへ切り替えます。",
    "マウスレイヤー — 右手でクリック（L/R・MB1〜3）やブラウザの戻る・進む。トラックボールと組み合わせて操作します。",
    "数字・記号レイヤー — 上段に数字、その下に記号をまとめて配置。",
    "ファンクション・テンキーレイヤー — F1〜F12、右手のテンキー、接続／出力切替（BT・OUT）。"
  ];

  // ortholinear: keys aligned in a strict grid (no column stagger)
  var STAG_L = [0, 0, 0, 0, 0, 0, 0];
  var STAG_R = [0, 0, 0, 0, 0, 0, 0];

  // [col, row, [L0,L1,L2,L3], opt]   opt.lyr = レイヤー切替キー / opt.sp = スペース
  var LEFT = [
    [0,0,["TAB","","ESC",""]],
    [1,0,["Q","","1","F1"]],
    [2,0,["W","","2","F2"]],
    [3,0,["E","","3","F3"]],
    [4,0,["R","","4","F4"]],
    [5,0,["T","","5","F5"]],

    [0,1,["5","","",""],{lyr:1}],
    [1,1,["A","","!","F6"]],
    [2,1,["S","","@","F7"]],
    [3,1,["D","","#","F8"]],
    [4,1,["F","","$","F9"]],
    [5,1,["G","","%","F10"]],

    [0,2,["⇧","","",""]],
    [1,2,["Z","","","F11"]],
    [2,2,["X","","","F12"]],
    [3,2,["C","","","USB"]],
    [4,2,["V","","","BLE"]],
    [5,2,["B","","","BT▸"]],
    [6,2,["␣","","","BT✕"],{sp:1}],

    [0,3,["2","","","BT0"],{lyr:1}],
    [1,3,["ESC","","","BT1"]],
    [2,3,["^","","","BT2"]],
    [3,3,["⌥","","","BT3"]],
    [4,3,["⌘","","","BT4"]],
    [5,3,["2","","",""],{lyr:1}],
    [6,3,["␣","","",""],{sp:1}]
  ];

  var RIGHT = [
    [1,0,["Y","","6",""]],
    [2,0,["U","LCLK","7","/"]],
    [3,0,["I","4","8","*"]],
    [4,0,["O","RCLK","9","7"]],
    [5,0,["P","","0","8"]],
    [6,0,["⌫","","⌫","9"]],

    [1,1,["H","⌘[","^","HOME"]],
    [2,1,["J","MB1","&",""]],
    [3,1,["K","MB3","*","-"]],
    [4,1,["L","MB2","(","4"]],
    [5,1,["-","⌘]",")","5"]],
    [6,1,["↵","","","6"]],

    [0,2,["␣","","",""],{sp:1}],
    [1,2,["N","⌃↑","~","END"]],
    [2,2,["M","","{",""]],
    [3,2,[",","","}","`"]],
    [4,2,[".","","[","1"]],
    [5,2,["↑","","]","2"]],
    [6,2,["⇧?","","/","3"]],

    [0,3,["␣","","",""],{sp:1}],
    [3,3,["3","","",""],{lyr:1}],
    [4,3,["←","","","0"]],
    [5,3,["↓","","","."]],
    [6,3,["→","","","="]]
  ];

  var allKeys = [];
  var curLayer = 0;

  // returns { txt, trans }  — trans = falls through to base on this layer
  function resolve(k, layer) {
    var l = k.labels;
    var v = l[layer];
    if (v === "" || v == null) return { txt: l[0], trans: true };
    return { txt: v, trans: false };
  }

  function render(k, layer) {
    var r = resolve(k, layer);
    var el = k.el;
    el.textContent = r.txt;
    el.classList.toggle("sm", (r.txt || "").length >= 3);
    // trans cells fade out (except the base layer itself, where nothing is trans)
    el.classList.toggle("dim", r.trans && layer !== 0);
  }

  function buildHalf(host, data, stag, side) {
    host.style.width = "calc(var(--u) * 6.95)";
    host.style.height = "calc(var(--u) * 4.25)";
    data.forEach(function (row) {
      var col = row[0], r = row[1], labels = row[2], o = row[3] || {};
      var el = document.createElement("div");
      el.className = "key" + (o.lyr ? " lyr" : "");
      var kobj = { el: el, labels: labels, opt: o, side: side };
      render(kobj, 0);
      var y = r + stag[col];
      el.style.left = "calc(var(--u) * " + col + ")";
      el.style.top = "calc(var(--u) * " + y.toFixed(3) + ")";
      el.addEventListener("mouseenter", function () { hover(kobj); });
      host.appendChild(el);
      allKeys.push(kobj);
    });
  }

  function hover(k) {
    var base = k.labels[0];
    var msg;
    if (k.opt.sp) { setInfo("スペースキー（親指）"); return; }
    if (k.opt.lyr) { setInfo(base + "  ·  レイヤー切替キー（押している間だけ別のレイヤーになります）"); return; }
    var parts = [];
    for (var i = 1; i < LAYER_NAMES.length; i++) {
      var v = k.labels[i];
      if (v) parts.push(LAYER_NAMES[i] + ": " + v);
    }
    if (parts.length) msg = base + "  →  " + parts.join("  /  ") + "  ·  ZMK で自由に変更できます";
    else msg = base;
    setInfo(msg);
  }

  function setInfo(t) { var i = document.getElementById("km-info"); if (i) i.textContent = t; }

  function switchLayer(layer) {
    curLayer = layer;
    allKeys.forEach(function (k) {
      var prevTxt = k.el.textContent;
      var prevDim = k.el.classList.contains("dim");
      render(k, layer);
      var changed = (k.el.textContent !== prevTxt) || (k.el.classList.contains("dim") !== prevDim);
      if (changed) {
        k.el.classList.remove("flip"); void k.el.offsetWidth; k.el.classList.add("flip");
      }
    });
    setInfo(LAYER_INFO[layer] + "　→　ZMK の Keymap Editor で自由に編集できます。");
  }

  function init() {
    var L = document.getElementById("half-left");
    var R = document.getElementById("half-right");
    if (!L || !R) return;
    buildHalf(L, LEFT, STAG_L, "L");
    buildHalf(R, RIGHT, STAG_R, "R");

    // trackball — sits in the open area of the right half (cols 1–2, bottom row)
    var tb = document.createElement("div");
    tb.className = "trackball";
    tb.style.width = "calc(var(--u) * .92)";
    tb.style.height = "calc(var(--u) * .92)";
    tb.style.left = "calc(var(--u) * 1.54)";
    tb.style.top = "calc(var(--u) * 3)";
    R.appendChild(tb);

    // layer buttons
    var btns = [].slice.call(document.querySelectorAll(".cat-btn[data-layer]"));
    btns.forEach(function (b) {
      b.addEventListener("click", function () {
        btns.forEach(function (x) { x.classList.remove("active"); });
        b.classList.add("active");
        switchLayer(parseInt(b.dataset.layer, 10));
      });
    });
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
