/* ZEN — bumper image carousel (prev/next + dots) */
(function () {
  var root = document.querySelector("[data-carousel]");
  if (!root) return;
  var slides = root.querySelectorAll(".carousel-slide");
  var dots = root.querySelectorAll(".carousel-dot");
  var prev = root.querySelector(".carousel-arrow.prev");
  var next = root.querySelector(".carousel-arrow.next");
  if (slides.length < 2) return;

  var i = 0;
  function go(n) {
    i = (n + slides.length) % slides.length;
    slides.forEach(function (s, k) { s.classList.toggle("is-active", k === i); });
    dots.forEach(function (d, k) {
      var on = k === i;
      d.classList.toggle("is-active", on);
      d.setAttribute("aria-selected", on ? "true" : "false");
    });
  }

  if (prev) prev.addEventListener("click", function () { go(i - 1); });
  if (next) next.addEventListener("click", function () { go(i + 1); });
  dots.forEach(function (d, k) { d.addEventListener("click", function () { go(k); }); });

  // keyboard support when focused inside the carousel
  root.addEventListener("keydown", function (e) {
    if (e.key === "ArrowLeft") { go(i - 1); }
    else if (e.key === "ArrowRight") { go(i + 1); }
  });

  // swipe on touch devices
  var x0 = null;
  root.addEventListener("touchstart", function (e) { x0 = e.touches[0].clientX; }, { passive: true });
  root.addEventListener("touchend", function (e) {
    if (x0 === null) return;
    var dx = e.changedTouches[0].clientX - x0;
    if (Math.abs(dx) > 40) { go(dx < 0 ? i + 1 : i - 1); }
    x0 = null;
  }, { passive: true });
})();
