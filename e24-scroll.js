/* e24 — shared UI: back-to-top button (scroll-reveal removed; content is static) */
(function () {
  var btn = document.getElementById("toTop");
  if (!btn) return;
  var SHOW_AT = 600;
  function onScroll() {
    var y = window.scrollY || document.documentElement.scrollTop;
    btn.classList.toggle("show", y > SHOW_AT);
  }
  btn.addEventListener("click", function () {
    var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    window.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" });
  });
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  // open the target <details> when a reset-link (or any in-page #faq- link) is followed
  function openTarget(id) {
    if (!id) return;
    var el = document.getElementById(id);
    if (el && el.tagName.toLowerCase() === "details") {
      el.open = true;
      try { el.scrollIntoView({ behavior: "smooth", block: "start" }); } catch (e) { el.scrollIntoView(); }
    }
  }
  document.addEventListener("click", function (e) {
    var a = e.target.closest && e.target.closest('a[href^="#faq-"]');
    if (!a) return;
    openTarget(a.getAttribute("href").slice(1));
  });
  if (location.hash.indexOf("#faq-") === 0) {
    setTimeout(function () { openTarget(location.hash.slice(1)); }, 60);
  }

  /* ----- image load-fade: non-hero images fade in once they finish loading ----- */
  (function () {
    var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) return;
    var imgs = document.querySelectorAll("img");
    Array.prototype.forEach.call(imgs, function (img) {
      // skip hero imagery — it should be present immediately
      if (img.closest(".hero, .hero-stage, .hero-sound")) return;
      img.classList.add("fade-img");
      function show() { img.classList.add("loaded"); }
      if (img.complete && img.naturalWidth > 0) {
        // already cached — reveal on next frame so the transition can run
        requestAnimationFrame(function () { requestAnimationFrame(show); });
      } else {
        img.addEventListener("load", show, { once: true });
        img.addEventListener("error", show, { once: true });
      }
    });
  })();
})();
