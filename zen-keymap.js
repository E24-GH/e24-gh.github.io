/* ZEN — interactive key map (ZMK layers).
   The physical layout is fixed; key *assignments* are just an example —
   buyers remap everything in the ZMK Keymap Editor. This widget shows
   how one physical key carries different roles across layers. */
(function () {
  var LAYER_NAMES = ["ベース", "数字・記号", "移動・Fn"];

  // ortholinear: keys aligned in a strict grid (no column stagger)
  var STAG_L = [0, 0, 0, 0, 0, 0, 0];
  var STAG_R = [0, 0, 0, 0, 0, 0, 0];

  // physical layout traced from the product photo (ortholinear, 7 cols × 4 rows per half)
  // [col,row, labels, opt]   labels: string = constant across layers, or [l0,l1,l2]
  var LEFT = [
    [0,0,"ESC"],[1,0,["Q","1","F1"]],[2,0,["W","2","F2"]],[3,0,["E","3","F3"]],[4,0,["R","4","F4"]],[5,0,["T","5","F5"]],
    [0,1,"TAB"],[1,1,["A","!","⌘"]],[2,1,["S","@","⌥"]],[3,1,["D","#","⌃"]],[4,1,["F","$","⇧"]],[5,1,["G","%","·"]],
    [0,2,"SFT"],[1,2,["Z","`","·"]],[2,2,["X","~","·"]],[3,2,["C","\\","·"]],[4,2,["V","=","·"]],[5,2,["B","+","·"]],[6,2,"MCR"],
    [0,3,"L2",{lyr:1}],[1,3,"Fn",{lyr:1}],[2,3,"CTRL"],[3,3,"ALT"],[4,3,"CMD"],[5,3,"L2",{lyr:1}],[6,3,"SPC",{sp:1}]
  ];
  var RIGHT = [
    [1,0,["Y","6","F6"]],[2,0,["U","7","F7"]],[3,0,["I","8","F8"]],[4,0,["O","9","F9"]],[5,0,["P","0","F10"]],[6,0,"DEL"],
    [1,1,["H","^","←"]],[2,1,["J","&","↓"]],[3,1,["K","*","↑"]],[4,1,["L","(","→"]],[5,1,["-","=","·"]],[6,1,"ENT"],
    [0,2,"MCR"],[1,2,["N","[","·"]],[2,2,["M","]","·"]],[3,2,[",","{","·"]],[4,2,[".","}","·"]],[5,2,"",{a:1}],[6,2,["?","|","·"]],
    [0,3,"SPC",{sp:1}],[3,3,"L3",{lyr:1}],[4,3,"",{a:1}],[5,3,"",{a:1}],[6,3,"",{a:1}]
  ];

  var allKeys = [];
  var curLayer = 0;

  function labelFor(k, layer) {
    var l = k.labels;
    return (l && l.join) ? l[layer] : l;
  }

  function setText(el, txt) {
    el.textContent = txt;
    el.classList.toggle("sm", (txt || "").length >= 3);
  }

  function buildHalf(host, data, stag, side) {
    host.style.width = "calc(var(--u) * 6.95)";
    host.style.height = "calc(var(--u) * 4.25)";
    data.forEach(function (row) {
      var col = row[0], r = row[1], labels = row[2], o = row[3] || {};
      var el = document.createElement("div");
      el.className = "key" + (o.t ? " tall" : "") + (o.b ? " blank" : "") + (o.a ? " accent" : "") + (o.lyr ? " lyr" : "");
      var kobj = { el: el, labels: labels, opt: o, side: side };
      if (!o.b) setText(el, labelFor(kobj, 0));
      var y = r + stag[col];
      el.style.left = "calc(var(--u) * " + col + ")";
      el.style.top = "calc(var(--u) * " + y.toFixed(3) + ")";
      host.appendChild(el);
      allKeys.push(kobj);
    });
  }

  function hover(k) {
    var base = labelFor(k, 0);
    var msg;
    if (k.opt.a) msg = base + "  ·  アクセントキー（自然な位置に決定・削除・スペース）";
    else if (k.opt.sp) msg = "スペースキー";
    else if (k.opt.lyr) msg = base + "  ·  レイヤー切替キー（押している間だけ別レイヤー）";
    else if (k.opt.m) msg = base + "  ·  固定キー";
    else if (k.labels && k.labels.join) msg = base + "  →  数字・記号: " + k.labels[1] + "  /  移動・Fn: " + k.labels[2] + "  ·  ZMK で自由に変更できます";
    else msg = base;
    setInfo(msg);
  }

  function setInfo(t) { var i = document.getElementById("km-info"); if (i) i.textContent = t; }

  function switchLayer(layer) {
    curLayer = layer;
    allKeys.forEach(function (k) {
      if (k.opt.b) return;
      var prev = k.el.textContent;
      var next = labelFor(k, layer);
      if (next !== prev) {
        setText(k.el, next);
        k.el.classList.remove("flip"); void k.el.offsetWidth; k.el.classList.add("flip");
      }
    });
    setInfo("表示中：" + LAYER_NAMES[layer] + " レイヤー（一例）　→　ZMK の Keymap Editor で自由に編集できます。");
  }

  function init() {
    var L = document.getElementById("half-left");
    var R = document.getElementById("half-right");
    if (!L || !R) return;
    buildHalf(L, LEFT, STAG_L, "L");
    buildHalf(R, RIGHT, STAG_R, "R");

    // trackball — same size as a key (19mm = 1u), plain sphere, grid-aligned
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
