// Lightbox for the concept-art grid. Without JS (or <dialog>) each thumbnail
// is still a plain link to the full-size image.
(() => {
  const dlg = document.getElementById("lightbox");
  if (!dlg || typeof dlg.showModal !== "function") return;

  const shots = [...document.querySelectorAll(".gallery .shot")];
  const img = dlg.querySelector(".lb-img");
  const title = dlg.querySelector(".lb-title");
  const group = dlg.querySelector(".lb-group");
  const count = dlg.querySelector(".lb-count");
  let index = 0;
  let opener = null;

  const wrap = (n) => (n + shots.length) % shots.length;
  const captionOf = (a) => a.querySelector(".cap").textContent;
  const groupOf = (a) => a.closest(".group").querySelector("h3").textContent;
  const preload = (n) => { new Image().src = shots[wrap(n)].getAttribute("href"); };

  img.addEventListener("load", () => img.classList.remove("is-loading"));

  function show(n) {
    index = wrap(n);
    const a = shots[index];
    const src = a.getAttribute("href");
    if (img.getAttribute("src") !== src) {
      img.classList.add("is-loading");
      img.src = src;
    }
    img.alt = captionOf(a);
    title.textContent = captionOf(a);
    group.textContent = groupOf(a);
    count.textContent = `${index + 1} / ${shots.length}`;
    preload(index + 1);
    preload(index - 1);
  }

  function open(n, from) {
    opener = from;
    show(n);
    document.documentElement.classList.add("lb-open");
    dlg.showModal();
  }

  dlg.addEventListener("close", () => {
    document.documentElement.classList.remove("lb-open");
    if (opener) opener.focus();
  });

  shots.forEach((a, n) => {
    a.addEventListener("click", (e) => {
      // keep "open in new tab" and friends working
      if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      e.preventDefault();
      open(n, a);
    });
  });

  dlg.querySelector(".lb-prev").addEventListener("click", () => show(index - 1));
  dlg.querySelector(".lb-next").addEventListener("click", () => show(index + 1));
  dlg.querySelector(".lb-close").addEventListener("click", () => dlg.close());

  // Esc is handled by <dialog> itself
  dlg.addEventListener("keydown", (e) => {
    if (e.key === "ArrowLeft") { e.preventDefault(); show(index - 1); }
    if (e.key === "ArrowRight") { e.preventDefault(); show(index + 1); }
  });

  // a click on the dark area around the picture closes the viewer
  dlg.addEventListener("click", (e) => {
    if (e.target === dlg || e.target.classList.contains("lb-figure")) dlg.close();
  });

  // swipe left / right on touch screens
  let x0 = null;
  let y0 = null;
  dlg.addEventListener("touchstart", (e) => {
    if (e.touches.length !== 1) { x0 = null; return; }
    x0 = e.touches[0].clientX;
    y0 = e.touches[0].clientY;
  }, { passive: true });
  dlg.addEventListener("touchend", (e) => {
    if (x0 === null) return;
    const dx = e.changedTouches[0].clientX - x0;
    const dy = e.changedTouches[0].clientY - y0;
    x0 = null;
    if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy) * 1.5) show(index + (dx < 0 ? 1 : -1));
  }, { passive: true });
})();
