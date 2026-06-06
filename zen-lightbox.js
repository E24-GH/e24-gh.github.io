/* ZEN firmware guide — click any figure image to view it enlarged */
(function () {
  var imgs = [].slice.call(document.querySelectorAll(".fw-fig img"));
  if (!imgs.length) return;

  // build lightbox once
  var lb = document.createElement("div");
  lb.className = "lightbox";
  lb.setAttribute("role", "dialog");
  lb.setAttribute("aria-modal", "true");
  lb.innerHTML =
    '<button class="lb-close" aria-label="閉じる"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18M6 6l12 12"/></svg></button>' +
    '<img alt="">' +
    '<div class="lb-cap"></div>';
  document.body.appendChild(lb);
  var lbImg = lb.querySelector("img");
  var lbCap = lb.querySelector(".lb-cap");
  var closeBtn = lb.querySelector(".lb-close");

  function open(src, alt, cap) {
    lbImg.src = src;
    lbImg.alt = alt || "";
    lbCap.textContent = cap || "";
    lb.classList.add("open");
    document.body.style.overflow = "hidden";
  }
  function close() {
    lb.classList.remove("open");
    document.body.style.overflow = "";
  }

  imgs.forEach(function (img) {
    img.addEventListener("click", function () {
      var fig = img.closest("figure");
      var cap = fig && fig.querySelector("figcaption");
      open(img.currentSrc || img.src, img.alt, cap ? cap.textContent.trim() : "");
    });
    // add a small "拡大" tag to the caption
    var fig = img.closest("figure");
    var cap = fig && fig.querySelector("figcaption");
    if (cap && !cap.querySelector(".zoom-tag")) {
      var tag = document.createElement("span");
      tag.className = "zoom-tag";
      tag.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3M11 8v6M8 11h6"/></svg>クリックで拡大';
      cap.appendChild(tag);
    }
  });

  closeBtn.addEventListener("click", close);
  lb.addEventListener("click", function (e) { if (e.target === lb || e.target === lbImg) close(); });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape" && lb.classList.contains("open")) close(); });
})();
