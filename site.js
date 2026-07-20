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
    }, { threshold: 0.11, rootMargin: "0px 0px -6%" });
    reveals.forEach((element) => observer.observe(element));
  }

  const stage = document.querySelector("[data-parallax-stage]");
  const tiltingDevice = stage?.querySelector("[data-tilt]");

  if (stage && tiltingDevice && !reduceMotion) {
    let scheduled = false;

    const updateParallax = () => {
      const bounds = stage.getBoundingClientRect();
      const progress = Math.max(-1, Math.min(1, (window.innerHeight / 2 - bounds.top) / window.innerHeight));
      stage.style.setProperty("--parallax-y", `${(progress * 20).toFixed(2)}px`);
      scheduled = false;
    };

    window.addEventListener("scroll", () => {
      if (scheduled) return;
      scheduled = true;
      window.requestAnimationFrame(updateParallax);
    }, { passive: true });
    updateParallax();

    if (window.matchMedia("(pointer: fine)").matches) {
      stage.addEventListener("pointermove", (event) => {
        const bounds = stage.getBoundingClientRect();
        const x = (event.clientX - bounds.left) / bounds.width - .5;
        const y = (event.clientY - bounds.top) / bounds.height - .5;
        const offset = stage.style.getPropertyValue("--parallax-y") || "0px";
        tiltingDevice.style.transform = `translate3d(-50%, ${offset}, 0) rotateY(${(x * 3.5).toFixed(2)}deg) rotateX(${(2 - y * 3).toFixed(2)}deg)`;
      });
      stage.addEventListener("pointerleave", () => {
        tiltingDevice.style.removeProperty("transform");
      });
    }
  }
})();
