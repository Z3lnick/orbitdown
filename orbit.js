import {
  animate,
  createTimeline,
  stagger,
} from "./assets/vendor/anime.esm.min.js";

const root = document.documentElement;
const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)");
const themeButton = document.querySelector(".appearance-toggle");
const motionButton = document.querySelector(".motion-toggle");
const instrument = document.querySelector(".instrument");
const phone = document.querySelector(".scene-phone");
const scrubber = document.querySelector("#time-scrubber");
const momentButtons = [...document.querySelectorAll("[data-moment]")];
const moments = [
  { title: "Birthday", days: "06", symbol: "✦", color: "#e7b296" },
  { title: "Next trip", days: "18", symbol: "✈", color: "#b1e4c7" },
  { title: "Launch day", days: "32", symbol: "↗", color: "#e7d8ab" },
];
let selectedMoment = 1;
let pausedByUser = false;
let inView = true;
let contextAvailable = true;
let scene = null;
let phase = 0;
let scrub = 0;
let scrollProgress = 0;
let pointerX = 0;
let pointerY = 0;
let currentX = 0;
let currentY = 0;
let dragging = false;
let dragStart = 0;
let dragValue = 50;
let clock = null;
const loops = [];

function applyTheme(theme, persist = false) {
  root.dataset.theme = theme;
  root.style.colorScheme = theme;
  themeButton.setAttribute(
    "aria-label",
    `Switch to ${theme === "dark" ? "light" : "dark"} theme`,
  );
  themeButton.setAttribute("aria-pressed", String(theme === "dark"));
  document.querySelector('meta[name="theme-color"]').content =
    theme === "dark" ? "#141714" : "#f1eee5";
  if (persist) {
    try {
      localStorage.setItem("orbit-theme", theme);
    } catch {
      /* Theme still works without storage. */
    }
  }
  scene?.setTheme(theme);
  render();
}
applyTheme(root.dataset.theme === "light" ? "light" : "dark");
themeButton.addEventListener("click", () =>
  applyTheme(root.dataset.theme === "dark" ? "light" : "dark", true),
);

function setMoment(index) {
  selectedMoment = index;
  const moment = moments[index];
  phone.querySelector("[data-moment-title]").textContent = moment.title;
  phone.querySelector("[data-moment-days]").textContent = moment.days;
  phone.querySelector(".phone-symbol").textContent = moment.symbol;
  phone.style.color = moment.color;
  momentButtons.forEach((button, i) =>
    button.setAttribute("aria-pressed", String(i === index)),
  );
  if (!reducedMotion.matches)
    animate(".phone-count", {
      opacity: [0.35, 1],
      y: [8, 0],
      duration: 450,
      ease: "outCubic",
    });
}
momentButtons.forEach((button, i) =>
  button.addEventListener("click", () => {
    scrubber.value = String(i * 50);
    scrub = (i - 1) * Math.PI * 0.7;
    setMoment(i);
    render();
  }),
);
function scrubTime(value) {
  scrub = (value / 100 - 0.5) * Math.PI * 1.4;
  const index = value < 33 ? 0 : value > 66 ? 2 : 1;
  if (index !== selectedMoment) setMoment(index);
  render();
}
scrubber.addEventListener("input", () => scrubTime(Number(scrubber.value)));
// Horizontal dragging changes the moment. Vertical gestures remain native scrolling.
instrument.addEventListener("pointerdown", (event) => {
  if (event.target.closest("button") || event.button !== 0) return;
  dragging = true;
  dragStart = event.clientX;
  dragValue = Number(scrubber.value);
  instrument.setPointerCapture(event.pointerId);
});
instrument.addEventListener("pointermove", (event) => {
  const bounds = instrument.getBoundingClientRect();
  if (dragging) {
    const value = Math.max(
      0,
      Math.min(
        100,
        dragValue + ((event.clientX - dragStart) / bounds.width) * 130,
      ),
    );
    scrubber.value = String(Math.round(value));
    scrubTime(value);
  }
  if (!reducedMotion.matches && event.pointerType !== "touch") {
    pointerX = (event.clientX - bounds.left) / bounds.width - 0.5;
    pointerY = (event.clientY - bounds.top) / bounds.height - 0.5;
  }
});
const stopDrag = () => {
  dragging = false;
};
instrument.addEventListener("pointerup", stopDrag);
instrument.addEventListener("pointercancel", stopDrag);
instrument.addEventListener("lostpointercapture", stopDrag);
instrument.addEventListener("pointerleave", () => {
  pointerX = 0;
  pointerY = 0;
});

const demoCard = document.querySelector(".demo-card");
for (const kind of ["palette", "type", "texture"]) {
  const buttons = [...document.querySelectorAll(`button[data-${kind}]`)];
  buttons.forEach((button) =>
    button.addEventListener("click", () => {
      demoCard.dataset[kind] = button.dataset[kind];
      buttons.forEach((other) =>
        other.setAttribute("aria-pressed", String(other === button)),
      );
      document.querySelector("#style-status").textContent =
        `${demoCard.dataset.palette} palette, ${demoCard.dataset.type} typography, ${demoCard.dataset.texture} atmosphere.`;
      if (!reducedMotion.matches)
        animate(demoCard, {
          scale: [0.975, 1],
          duration: 500,
          ease: "outCubic",
        });
    }),
  );
}
const phrases = [
  [
    "Stretch break in 45 minutes",
    "Stretch break",
    "In 45 minutes · One-time countdown",
  ],
  [
    "Dinner this Saturday at 7pm",
    "Dinner",
    "Saturday at 19:00 · One-time countdown",
  ],
  ["Launch day in 32 days", "Launch day", "In 32 days · One-time countdown"],
];
const phraseButtons = [...document.querySelectorAll("[data-phrase]")];
phraseButtons.forEach((button, i) =>
  button.addEventListener("click", () => {
    const [phrase, title, date] = phrases[i];
    document.querySelector("#phrase-text").textContent = phrase;
    document.querySelector("#parse-title").textContent = title;
    document.querySelector("#parse-time").textContent = date;
    phraseButtons.forEach((other) =>
      other.setAttribute("aria-pressed", String(other === button)),
    );
    if (!reducedMotion.matches)
      createTimeline()
        .add(".phrase-display p", {
          opacity: [0.3, 1],
          x: [-5, 0],
          duration: 400,
        })
        .add(
          ".parsed-moment",
          { opacity: [0.3, 1], y: [10, 0], duration: 450 },
          160,
        );
  }),
);
const widgetButtons = [...document.querySelectorAll("[data-widget]")];
widgetButtons.forEach((button) =>
  button.addEventListener("click", () => {
    document.querySelector(".widget-universe").dataset.layout =
      button.dataset.widget;
    widgetButtons.forEach((other) =>
      other.setAttribute("aria-pressed", String(other === button)),
    );
    if (!reducedMotion.matches)
      animate(".transform-widget", {
        rotate: [-7, 0, -7],
        duration: 800,
        ease: "outCubic",
      });
  }),
);

// One-shot section animations never hide content before JavaScript loads.
const revealTargets = [
  ...document.querySelectorAll(
    ".life-heading,.section-intro,.style-lab,.quick-lab,.product-title,.product-window,.quiet-promises>div",
  ),
];
const revealObserver = new IntersectionObserver(
  (entries) => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      if (!reducedMotion.matches)
        animate(entry.target, {
          opacity: [0.2, 1],
          y: [24, 0],
          duration: 850,
          ease: "outCubic",
        });
      revealObserver.unobserve(entry.target);
    }
  },
  { threshold: 0.15 },
);
revealTargets.forEach((element) => revealObserver.observe(element));
if (!reducedMotion.matches) {
  createTimeline({ defaults: { ease: "outCubic" } })
    .add(
      ".electric-copy > *",
      { opacity: [0.15, 1], y: [18, 0], duration: 1000, delay: stagger(85) },
      0,
    )
    .add(".scene-phone", { opacity: [0, 1], duration: 1100 }, 250)
    .add(
      ".satellite",
      { opacity: [0, 1], duration: 1000, delay: stagger(140) },
      550,
    );
}

function syncMotion() {
  const canMove = !reducedMotion.matches && !pausedByUser && !document.hidden;
  if (canMove && inView && contextAvailable) clock?.resume();
  else clock?.pause();
  loops.forEach(({ animation, element }) => {
    const bounds = element.getBoundingClientRect();
    if (canMove && bounds.bottom > 0 && bounds.top < innerHeight)
      animation.resume();
    else animation.pause();
  });
  motionButton.hidden = reducedMotion.matches;
  motionButton.setAttribute("aria-pressed", String(pausedByUser));
  motionButton.innerHTML = pausedByUser
    ? 'Play motion <span aria-hidden="true">▷</span>'
    : 'Pause motion <span aria-hidden="true">Ⅱ</span>';
}
motionButton.addEventListener("click", () => {
  pausedByUser = !pausedByUser;
  syncMotion();
});
reducedMotion.addEventListener("change", () => {
  pointerX = pointerY = currentX = currentY = 0;
  if (reducedMotion.matches) {
    phase = 0;
    document.getAnimations().forEach((animation) => animation.finish());
  }
  syncMotion();
  render();
});
document.addEventListener("visibilitychange", syncMotion);
new IntersectionObserver(
  ([entry]) => {
    inView = entry.isIntersecting;
    syncMotion();
  },
  { rootMargin: "80px" },
).observe(instrument);
// Scroll-controlled assembly: the scattered moments settle into the library row.
const lifeCards = [...document.querySelectorAll(".life-card")];
const libraryAssembly = createTimeline({
  autoplay: false,
  defaults: { ease: "outCubic", duration: 1000 },
});
lifeCards.forEach((card, i) =>
  libraryAssembly.add(
    card,
    {
      x: [
        [-45, 0],
        [15, 0],
        [45, 0],
      ][i],
      y: [
        [45, 0],
        [-20, 0],
        [60, 0],
      ][i],
      rotate: [
        [-11, 0],
        [7, 0],
        [-8, 0],
      ][i],
      opacity: [0.45, 1],
    },
    0,
  ),
);
function updateLibraryAssembly() {
  const bounds = document
    .querySelector(".life-section")
    .getBoundingClientRect();
  const progress = reducedMotion.matches
    ? 1
    : Math.max(
        0,
        Math.min(1, (innerHeight * 0.96 - bounds.top) / (innerHeight * 0.45)),
      );
  libraryAssembly.seek(progress * 1000);
}
updateLibraryAssembly();
reducedMotion.addEventListener("change", updateLibraryAssembly);
let scrollScheduled = false;
window.addEventListener(
  "scroll",
  () => {
    if (scrollScheduled) return;
    scrollScheduled = true;
    requestAnimationFrame(() => {
      scrollScheduled = false;
      const hero = document.querySelector(".electric-hero");
      scrollProgress = Math.max(
        0,
        Math.min(1, -hero.getBoundingClientRect().top / hero.offsetHeight),
      );
      syncMotion();
      updateLibraryAssembly();
      if (inView && !reducedMotion.matches) render();
    });
  },
  { passive: true },
);

function render() {
  if (!scene || !contextAvailable) return;
  currentX += (pointerX - currentX) * 0.07;
  currentY += (pointerY - currentY) * 0.07;
  const move = reducedMotion.matches ? 0 : phase;
  scene.render(
    move,
    scrub,
    currentX,
    currentY,
    reducedMotion.matches ? 0 : scrollProgress,
  );
  const depth = reducedMotion.matches ? 0 : scrollProgress;
  phone.style.transform = `translate3d(${currentX * 17}px,${currentY * 10 - depth * 55}px,0) rotate(${9 + Math.sin(move * 1.8) * 2 + currentX * 5 - depth * 12}deg) scale(${1 - depth * 0.08})`;
  document.querySelectorAll(".satellite").forEach((card, i) => {
    const a = move * 1.5 + i * 2.1 + scrub * 0.3;
    card.style.transform = `translate3d(${Math.cos(a) * (10 + i * 3) + currentX * 24}px,${Math.sin(a) * 15 - depth * (30 + i * 18)}px,0) rotate(${[-9, 8, -7][i] + Math.sin(a) * 3}deg)`;
  });
}

async function initScene() {
  const THREE = await import(
    "./assets/vendor/three.module.min.js?v=0.186.1-local"
  );
  const canvas = document.querySelector("#orbit-canvas");
  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    alpha: true,
    powerPreference: "low-power",
  });
  renderer.setPixelRatio(
    Math.min(devicePixelRatio, innerWidth < 760 ? 1.4 : 1.75),
  );
  renderer.setClearColor(0x000000, 0);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.25;
  const world = new THREE.Scene();
  // A small studio environment gives the ribbon real specular reflections without remote textures.
  const studio = new THREE.Scene();
  studio.add(
    new THREE.Mesh(
      new THREE.BoxGeometry(14, 14, 14),
      new THREE.MeshBasicMaterial({ color: 0x56695b, side: THREE.BackSide }),
    ),
  );
  for (const [x, y, z, color, intensity] of [
    [-4, 4, 3, 0xffe9c4, 5],
    [4, 1, 2, 0xb9e5d2, 3],
    [0, -3, -4, 0xffd18e, 4],
  ]) {
    const softbox = new THREE.Mesh(
      new THREE.PlaneGeometry(3, 5),
      new THREE.MeshBasicMaterial({ color, side: THREE.DoubleSide }),
    );
    softbox.material.color.multiplyScalar(intensity);
    softbox.position.set(x, y, z);
    softbox.lookAt(0, 0, 0);
    studio.add(softbox);
  }
  const pmrem = new THREE.PMREMGenerator(renderer);
  const environment = pmrem.fromScene(studio, 0.06);
  world.environment = environment.texture;
  world.environmentIntensity = 0.65;
  pmrem.dispose();
  studio.traverse((object) => {
    if (object.isMesh) {
      object.geometry.dispose();
      object.material.dispose();
    }
  });
  const camera = new THREE.PerspectiveCamera(35, 1, 0.1, 60);
  camera.position.set(0, 0, 11.5);
  const sculpture = new THREE.Group();
  world.add(sculpture);
  world.add(new THREE.AmbientLight(0xd6e7c6, 2.2));
  const key = new THREE.DirectionalLight(0xffe7b1, 4.5);
  key.position.set(-3, 5, 5);
  world.add(key);
  const jadeLight = new THREE.DirectionalLight(0x98ffd1, 3);
  jadeLight.position.set(4, -2, 2);
  world.add(jadeLight);
  const rim = new THREE.DirectionalLight(0xecc48d, 4);
  rim.position.set(1, 4, -4);
  world.add(rim);
  const jade = new THREE.MeshPhysicalMaterial({
    color: 0x286b4c,
    metalness: 0.75,
    roughness: 0.23,
    clearcoat: 0.7,
    side: THREE.DoubleSide,
  });
  const gold = new THREE.MeshStandardMaterial({
    color: 0xd3b779,
    metalness: 0.82,
    roughness: 0.25,
  });
  // A parametric half-twisted ribbon: real mesh normals, metallic surfaces and gold edge tubes.
  function ribbon(radius, width, segments = 200) {
    const vertices = [],
      indices = [],
      edgeA = [],
      edgeB = [];
    for (let i = 0; i <= segments; i++) {
      const u = (i / segments) * Math.PI * 2;
      for (const side of [-1, 1]) {
        const v = side * width;
        const r = radius + v * Math.cos(u / 2);
        const point = new THREE.Vector3(
          r * Math.cos(u),
          r * Math.sin(u),
          v * Math.sin(u / 2),
        );
        vertices.push(point.x, point.y, point.z);
        (side < 0 ? edgeA : edgeB).push(point);
      }
      if (i < segments) {
        const k = i * 2;
        indices.push(k, k + 1, k + 2, k + 1, k + 3, k + 2);
      }
    }
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute(
      "position",
      new THREE.Float32BufferAttribute(vertices, 3),
    );
    geometry.setIndex(indices);
    geometry.computeVertexNormals();
    const group = new THREE.Group();
    group.add(new THREE.Mesh(geometry, jade));
    for (const points of [edgeA, edgeB]) {
      const curve = new THREE.CatmullRomCurve3(points);
      group.add(
        new THREE.Mesh(
          new THREE.TubeGeometry(curve, segments, 0.014, 5, false),
          gold,
        ),
      );
    }
    return group;
  }
  const ribbonA = ribbon(2.2, 0.24);
  ribbonA.rotation.set(0.85, -0.43, -0.45);
  sculpture.add(ribbonA);
  const ribbonB = ribbon(2.55, 0.12);
  ribbonB.rotation.set(-0.52, 1.05, 0.6);
  sculpture.add(ribbonB);
  const dial = new THREE.Group();
  dial.rotation.set(0.32, 0.3, -0.23);
  sculpture.add(dial);
  // All 144 clock marks render in one instanced draw call.
  const tickGeometry = new THREE.BoxGeometry(0.012, 0.1, 0.012);
  const ticks = new THREE.InstancedMesh(tickGeometry, gold, 144);
  const tickPose = new THREE.Object3D();
  for (let i = 0; i < 144; i++) {
    const angle = (i / 144) * Math.PI * 2;
    tickPose.position.set(Math.sin(angle) * 2.91, Math.cos(angle) * 2.91, 0);
    tickPose.rotation.z = -angle;
    tickPose.scale.y = i % 12 === 0 ? 2.2 : i % 6 === 0 ? 1.5 : 0.65;
    tickPose.updateMatrix();
    ticks.setMatrixAt(i, tickPose.matrix);
    ticks.setColorAt(i, new THREE.Color(i % 6 === 0 ? 0xffffff : 0x8f9a7b));
  }
  dial.add(ticks);
  dial.add(new THREE.Mesh(new THREE.TorusGeometry(3.05, 0.008, 4, 160), gold));
  const orbitalGroups = [];
  const lineMaterial = new THREE.LineBasicMaterial({
    color: 0xb6985b,
    transparent: true,
    opacity: 0.55,
  });
  for (let i = 0; i < 3; i++) {
    const orbit = new THREE.Group();
    const radius = 2.9 + i * 0.15;
    const points = Array.from({ length: 161 }, (_, j) => {
      const a = (j / 160) * Math.PI * 2;
      return new THREE.Vector3(Math.cos(a) * radius, Math.sin(a) * radius, 0);
    });
    orbit.add(
      new THREE.LineLoop(
        new THREE.BufferGeometry().setFromPoints(points),
        lineMaterial,
      ),
    );
    const planet = new THREE.Mesh(
      new THREE.SphereGeometry(i === 0 ? 0.12 : 0.055, 16, 12),
      gold,
    );
    planet.position.x = radius;
    orbit.add(planet);
    orbit.rotation.set(0.55 + i * 0.8, i * 0.5, i * 0.85);
    sculpture.add(orbit);
    orbitalGroups.push(orbit);
  }
  const stars = [];
  for (let i = 0; i < 75; i++) {
    const a = i * 2.39996,
      r = 2.5 + ((i % 17) / 17) * 0.95;
    stars.push(Math.cos(a) * r, Math.sin(a) * r, Math.sin(i * 12.3) * 0.7);
  }
  const starGeometry = new THREE.BufferGeometry();
  starGeometry.setAttribute(
    "position",
    new THREE.Float32BufferAttribute(stars, 3),
  );
  const dust = new THREE.Points(
    starGeometry,
    new THREE.PointsMaterial({
      color: 0xe5c88d,
      size: 0.016,
      transparent: true,
      opacity: 0.55,
    }),
  );
  sculpture.add(dust);
  const size = () => {
    const { width, height } = instrument.getBoundingClientRect();
    if (!width || !height) return;
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.position.z = camera.aspect < 1 ? 13.4 : 11.5;
    camera.updateProjectionMatrix();
    render();
  };
  const resize = new ResizeObserver(size);
  resize.observe(instrument);
  scene = {
    render(t, offset, x, y, scroll) {
      sculpture.rotation.set(
        y * 0.15 + scroll * 0.4,
        x * 0.22 + offset * 0.32,
        -0.08 + scroll * 0.25,
      );
      ribbonA.rotation.z = -0.45 + Math.sin(t * 1.7 + offset) * 0.16;
      ribbonA.rotation.y = -0.43 + t * 0.35 + offset * 0.6;
      ribbonB.rotation.z = 0.6 - t * 0.2 - offset * 0.4;
      dial.rotation.z = -0.23 + t * 0.2 + offset * 0.25;
      dust.rotation.z = -t * 0.15;
      orbitalGroups.forEach((orbit, i) => {
        orbit.rotation.z = i * 0.85 + t * (i % 2 ? -0.3 : 0.45) + offset;
      });
      renderer.render(world, camera);
    },
    setTheme(theme) {
      lineMaterial.color.set(theme === "light" ? 0x8b6a37 : 0xb6985b);
    },
  };
  canvas.addEventListener("webglcontextlost", (event) => {
    event.preventDefault();
    contextAvailable = false;
    instrument.classList.remove("scene-ready");
    syncMotion();
  });
  canvas.addEventListener("webglcontextrestored", () => {
    contextAvailable = true;
    instrument.classList.add("scene-ready");
    size();
    syncMotion();
  });
  size();
  scene.setTheme(root.dataset.theme);
  render();
  instrument.classList.add("scene-ready");
  const state = { phase: 0 };
  let completedTurns = 0;
  clock = animate(state, {
    phase: Math.PI * 2,
    duration: 110000,
    ease: "linear",
    loop: true,
    autoplay: false,
    frameRate: innerWidth < 760 ? 30 : 60,
    onLoop() {
      completedTurns += Math.PI * 2;
    },
    onUpdate() {
      phase = completedTurns + state.phase;
      render();
    },
  });
  syncMotion();
}
// Below-fold ornamental motion pauses independently of the hero and when the document is hidden.
const widgetUniverse = document.querySelector(".widget-universe");
const widgetOrbit = animate(".widget-orbits", {
  rotate: [0, 360],
  duration: 160000,
  ease: "linear",
  loop: true,
  autoplay: false,
});
loops.push({ animation: widgetOrbit, element: widgetUniverse });
new IntersectionObserver(syncMotion).observe(widgetUniverse);
initScene().catch((error) => {
  console.warn("Orbit Down scene fallback:", error.message);
  // WebGL/module failures leave the complete SVG/CSS scene and all product content usable.
  instrument.classList.remove("scene-ready");
  syncMotion();
});
window.addEventListener("pagehide", () => {
  clock?.pause();
  loops.forEach(({ animation }) => animation.pause());
});
window.addEventListener("pageshow", syncMotion);
