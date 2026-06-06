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
})();
