/* ZEN — hero body-color switcher (white / black) */
(function () {
  var stage = document.querySelector(".hero-stage");
  if (!stage) return;
  var imgs = stage.querySelectorAll(".hero-img");
  var btns = stage.querySelectorAll(".hero-color");
  if (!imgs.length || !btns.length) return;

  var KEY = "zen-hero-variant";

  function apply(variant) {
    imgs.forEach(function (img) {
      img.classList.toggle("is-active", img.dataset.variant === variant);
    });
    btns.forEach(function (btn) {
      var on = btn.dataset.variant === variant;
      btn.classList.toggle("is-active", on);
      btn.setAttribute("aria-pressed", on ? "true" : "false");
    });
    try { localStorage.setItem(KEY, variant); } catch (e) {}
  }

  btns.forEach(function (btn) {
    btn.addEventListener("click", function () { apply(btn.dataset.variant); });
  });

  var saved;
  try { saved = localStorage.getItem(KEY); } catch (e) {}
  apply(saved === "black" ? "black" : "white");

  // enable the cross-fade transition only after the initial state is painted,
  // so loading a saved variant doesn't animate on page load
  requestAnimationFrame(function () {
    requestAnimationFrame(function () { stage.classList.add("color-anim"); });
  });
})();
