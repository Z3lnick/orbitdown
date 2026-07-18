(() => {
  const header = document.querySelector("[data-header]");
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const updateHeader = () => header?.classList.toggle("is-scrolled", window.scrollY > 18);
  updateHeader();
  window.addEventListener("scroll", updateHeader, { passive: true });

  const reveals = document.querySelectorAll("[data-reveal]");
  if (reduceMotion || !("IntersectionObserver" in window)) {
    reveals.forEach((element) => element.classList.add("is-visible"));
  } else {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -5%" });
    reveals.forEach((element) => observer.observe(element));
  }

  const tilt = document.querySelector("[data-tilt]");
  const stage = tilt?.closest(".product-stage");
  if (tilt && stage && !reduceMotion && window.matchMedia("(pointer: fine)").matches) {
    stage.addEventListener("pointermove", (event) => {
      const box = stage.getBoundingClientRect();
      const x = (event.clientX - box.left) / box.width - 0.5;
      const y = (event.clientY - box.top) / box.height - 0.5;
      tilt.style.transform = `rotateY(${(-7 + x * 4).toFixed(2)}deg) rotateX(${(2 - y * 4).toFixed(2)}deg) rotateZ(1deg)`;
    });
    stage.addEventListener("pointerleave", () => {
      tilt.style.transform = "rotateY(-7deg) rotateX(2deg) rotateZ(1deg)";
    });
  }
})();
