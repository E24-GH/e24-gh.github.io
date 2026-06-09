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

  /* ----- image fade-in: non-hero images fade in when they scroll into view,
     but only once they've finished loading (so slow/late images never pop) ----- */
  (function () {
    var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) return;
    var imgs = Array.prototype.filter.call(
      document.querySelectorAll("img"),
      function (img) { return !img.closest(".hero, .hero-stage, .hero-sound"); }
    );
    if (!imgs.length) return;

    function reveal(img) {
      // play the fade only when BOTH the image is loaded AND it's in view
      if (img._loaded && img._inview && !img.classList.contains("loaded")) {
        img.classList.add("loaded");
      }
    }

    var io = ("IntersectionObserver" in window)
      ? new IntersectionObserver(function (entries) {
          entries.forEach(function (e) {
            if (e.isIntersecting) {
              e.target._inview = true;
              reveal(e.target);
              io.unobserve(e.target);
            }
          });
        }, { rootMargin: "0px 0px -8% 0px", threshold: 0.05 })
      : null;

    imgs.forEach(function (img) {
      img.classList.add("fade-img");
      function onLoad() {
        img._loaded = true;
        reveal(img);
      }
      if (img.complete && img.naturalWidth > 0) {
        img._loaded = true;
      } else {
        img.addEventListener("load", onLoad, { once: true });
        img.addEventListener("error", onLoad, { once: true });
      }
      if (io) {
        io.observe(img);
      } else {
        // no IntersectionObserver: fall back to load-based reveal
        img._inview = true;
        if (img._loaded) requestAnimationFrame(function () { reveal(img); });
        else img.addEventListener("load", function () { reveal(img); }, { once: true });
      }
    });
  })();
})();
