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
      let tiltFrame = 0;
      let targetRotateX = 2;
      let targetRotateY = 0;
      let currentRotateX = 2;
      let currentRotateY = 0;

      const renderTilt = () => {
        currentRotateX += (targetRotateX - currentRotateX) * .18;
        currentRotateY += (targetRotateY - currentRotateY) * .18;

        const deltaX = Math.abs(targetRotateX - currentRotateX);
        const deltaY = Math.abs(targetRotateY - currentRotateY);
        const settled = deltaX < .01 && deltaY < .01;

        if (settled) {
          currentRotateX = targetRotateX;
          currentRotateY = targetRotateY;
        }

        tiltingDevice.style.setProperty("--tilt-rotate-x", `${currentRotateX.toFixed(2)}deg`);
        tiltingDevice.style.setProperty("--tilt-rotate-y", `${currentRotateY.toFixed(2)}deg`);
        tiltFrame = settled ? 0 : window.requestAnimationFrame(renderTilt);
      };

      const requestTiltFrame = () => {
        if (tiltFrame) return;
        tiltFrame = window.requestAnimationFrame(renderTilt);
      };

      const resetTilt = () => {
        if (targetRotateX === 2 && targetRotateY === 0 && Math.abs(currentRotateX - 2) < .01 && Math.abs(currentRotateY) < .01) return;
        targetRotateX = 2;
        targetRotateY = 0;
        requestTiltFrame();
      };

      window.addEventListener("pointermove", (event) => {
        const bounds = stage.getBoundingClientRect();
        const isInsideStage = event.clientX >= bounds.left && event.clientX <= bounds.right && event.clientY >= bounds.top && event.clientY <= bounds.bottom;
        if (!isInsideStage) {
          resetTilt();
          return;
        }

        const x = Math.max(-.5, Math.min(.5, (event.clientX - bounds.left) / bounds.width - .5));
        const y = Math.max(-.5, Math.min(.5, (event.clientY - bounds.top) / bounds.height - .5));
        targetRotateY = x * 3.5;
        targetRotateX = 2 - y * 3;
        requestTiltFrame();
      }, { passive: true });

      stage.addEventListener("pointerleave", resetTilt, { passive: true });
      window.addEventListener("pointercancel", resetTilt, { passive: true });
    }
  }
})();
