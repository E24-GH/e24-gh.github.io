/* ZEN — playful keystroke sound on the hero keyboard.
   Six real keystroke samples; each tap plays a random one (single clack),
   trimmed to its onset, peak-normalized so levels match, high-passed to
   tame wind/rumble, and kept quiet. */
(function () {
  // resolve asset URLs relative to THIS script's location, so the page can
  // live at any directory depth (e.g. /zen/index.html) without breaking.
  var BASE = (document.currentScript && document.currentScript.src) || location.href;
  function asset(p) { return new URL(p, BASE).href; }

  var ctx = null, loading = false;
  var FILES = [
    asset("assets/key1.wav"), asset("assets/key2.wav"), asset("assets/key3.wav"),
    asset("assets/key4.wav"), asset("assets/key5.wav"), asset("assets/key6.wav")
  ];
  // per-sample: { buffer, start (s), len (s), gain (normalize multiplier) }
  var samples = [];
  var last = -1;

  function ensureCtx() {
    if (!ctx) {
      var AC = window.AudioContext || window.webkitAudioContext;
      if (AC) ctx = new AC();
    }
    return ctx;
  }

  function analyze(buf) {
    var d = buf.getChannelData(0), sr = buf.sampleRate;
    var peak = 0;
    for (var i = 0; i < d.length; i++) { var a = Math.abs(d[i]); if (a > peak) peak = a; }
    // onset: first sample above 18% of peak, backed off slightly for the attack
    var thr = 0.18 * peak, on = 0;
    for (var j = 0; j < d.length; j++) { if (Math.abs(d[j]) >= thr) { on = j; break; } }
    var start = Math.max(0, on - Math.floor(sr * 0.004));
    // tail: keep up to 180ms of the clack
    var len = Math.min(0.18, buf.duration - start / sr);
    var norm = peak > 0.001 ? (0.5 / peak) : 1;   // normalize peaks toward a common level
    return { buffer: buf, start: start / sr, len: len, gain: norm };
  }

  function load() {
    if (loading || samples.length) return;
    if (!ensureCtx()) return;
    loading = true;
    FILES.forEach(function (url) {
      fetch(url + "?v=1")
        .then(function (r) { return r.arrayBuffer(); })
        .then(function (b) { return ctx.decodeAudioData(b); })
        .then(function (buf) { samples.push(analyze(buf)); })
        .catch(function () {});
    });
  }

  function play() {
    if (!ctx || !samples.length) { load(); return; }
    if (ctx.state === "suspended") ctx.resume();

    // pick a random sample, avoid immediate repeat
    var i = (Math.random() * samples.length) | 0;
    if (samples.length > 1 && i === last) i = (i + 1) % samples.length;
    last = i;
    var s = samples[i];

    var now = ctx.currentTime;
    var MASTER = 0.32;                 // overall quiet level
    var vol = MASTER * s.gain;
    var len = s.len;

    var src = ctx.createBufferSource();
    src.buffer = s.buffer;
    src.playbackRate.value = 0.96 + Math.random() * 0.08;   // subtle pitch variation

    var g = ctx.createGain();
    var fadeOut = Math.min(0.05, len * 0.4);
    g.gain.setValueAtTime(0, now);
    g.gain.linearRampToValueAtTime(vol, now + 0.004);
    g.gain.setValueAtTime(vol, now + Math.max(0.01, len - fadeOut));
    g.gain.linearRampToValueAtTime(0, now + len);

    var hp = ctx.createBiquadFilter();
    hp.type = "highpass"; hp.frequency.value = 180; hp.Q.value = 0.7;

    src.connect(hp); hp.connect(g); g.connect(ctx.destination);
    try { src.start(now, s.start, len + 0.02); src.stop(now + len + 0.05); } catch (e) {}
  }

  function init() {
    load();
    var hero = document.getElementById("heroSound");
    if (hero) {
      hero.addEventListener("pointerdown", function () {
        if (ctx && ctx.state === "suspended") ctx.resume();
        hero.classList.add("tapped");
        play();
      });
    }
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
