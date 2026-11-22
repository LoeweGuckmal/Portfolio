import * as THREE from "three";
import { getTheme, onThemeChange } from "./theme.js";

/**
 * Soft, slowly drifting low-poly doodles behind the page.
 * - a little mouse parallax, a little scroll parallax
 * - shapes in the hovered card's color grow slightly (focus)
 * - renders a single still frame when the user prefers reduced motion
 *
 * @param {HTMLCanvasElement} canvas
 * @param {{ colors: string[], reduceMotion?: boolean }} options
 * @returns {{ focus(color: string | null): void } | null}
 */
export function initBackground(canvas, { colors, reduceMotion = false }) {
  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: "low-power" });
  } catch (error) {
    console.warn("WebGL not available, skipping background.", error);
    return null;
  }
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setClearColor(0x000000, 0);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(40, 1, 0.1, 100);
  camera.position.set(0, 0, 22);
  const lookTarget = new THREE.Vector3(0, 0, -4);

  const hemi = new THREE.HemisphereLight(0xffffff, 0xcfc6b8, 2.4);
  const sun = new THREE.DirectionalLight(0xffffff, 2.2);
  sun.position.set(6, 10, 12);
  scene.add(hemi, sun);

  /* ---------- shapes ---------- */
  const random = mulberry32(7); // seeded → same layout on every visit
  const geometries = [
    new THREE.IcosahedronGeometry(1, 0),
    new THREE.OctahedronGeometry(1.05, 0),
    new THREE.TetrahedronGeometry(1.2, 0),
    new THREE.DodecahedronGeometry(0.95, 0),
    new THREE.BoxGeometry(1.25, 1.25, 1.25),
    new THREE.TorusGeometry(0.72, 0.3, 5, 10),
    new THREE.ConeGeometry(0.85, 1.5, 5),
  ];
  const edgeGeometries = geometries.map((g) => new THREE.EdgesGeometry(g, 20));

  const palette = colors.length ? colors : ["#e03e3e", "#2d4fa8", "#ee7418", "#2f9e44"];

  const area = window.innerWidth * window.innerHeight;
  const count = Math.round(THREE.MathUtils.clamp(area / 70000, 9, 18));
  const cols = Math.ceil(Math.sqrt(count * (window.innerWidth / window.innerHeight)));
  const rows = Math.ceil(count / cols);

  const shapes = [];
  for (let i = 0; i < count; i++) {
    const col = i % cols;
    const row = Math.floor(i / cols);
    const geoIndex = Math.floor(random() * geometries.length);
    const baseColor = new THREE.Color(palette[i % palette.length]);

    const fillMaterial = new THREE.MeshToonMaterial({ color: 0xffffff, transparent: true });
    const lineMaterial = new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.6 });
    const mesh = new THREE.Mesh(geometries[geoIndex], fillMaterial);
    mesh.add(new THREE.LineSegments(edgeGeometries[geoIndex], lineMaterial));
    mesh.rotation.set(random() * Math.PI, random() * Math.PI, 0);
    scene.add(mesh);

    shapes.push({
      mesh,
      baseColor,
      fillMaterial,
      lineMaterial,
      // normalized position inside the (slightly oversized) viewport
      u: ((col + 0.15 + random() * 0.7) / cols) * 2 - 1,
      v: ((row + 0.15 + random() * 0.7) / rows) * 2 - 1,
      z: -10 + random() * 9,
      size: 0.55 + random() * 0.6,
      spin: new THREE.Vector3((random() - 0.5) * 0.35, (random() - 0.5) * 0.35, (random() - 0.5) * 0.2),
      bobAmp: 0.15 + random() * 0.3,
      bobSpeed: 0.25 + random() * 0.35,
      phase: random() * Math.PI * 2,
      scale: 0,
      targetScale: 1,
    });
  }

  const white = new THREE.Color(0xffffff);
  function applyColors() {
    const dark = getTheme() === "dark";
    const paperCss = getComputedStyle(document.documentElement).getPropertyValue("--paper").trim();
    const paper = new THREE.Color(paperCss || (dark ? "#17161b" : "#fbf8f3"));
    for (const s of shapes) {
      // light: soft pastel solids · dark: ghosted glassy doodles with brighter outlines
      s.fillMaterial.color.copy(s.baseColor).lerp(paper, dark ? 0.35 : 0.55);
      s.fillMaterial.opacity = dark ? 0.32 : 1;
      s.lineMaterial.color.copy(s.baseColor).lerp(white, dark ? 0.3 : 0);
      s.lineMaterial.opacity = dark ? 0.55 : 0.6;
    }
    hemi.intensity = dark ? 1.4 : 2.4;
    sun.intensity = dark ? 1.6 : 2.2;
  }
  applyColors();
  onThemeChange(() => {
    applyColors();
    if (reduceMotion) render(0);
  });

  /* ---------- input ---------- */
  const pointer = new THREE.Vector2();
  if (!reduceMotion) {
    window.addEventListener(
      "pointermove",
      (e) => pointer.set((e.clientX / window.innerWidth) * 2 - 1, (e.clientY / window.innerHeight) * 2 - 1),
      { passive: true }
    );
  }

  function resize() {
    const w = window.innerWidth;
    const h = window.innerHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    if (reduceMotion) render(0);
  }
  window.addEventListener("resize", resize);

  /* ---------- frame ---------- */
  const tanHalfFov = Math.tan(THREE.MathUtils.degToRad(camera.fov / 2));
  const wrap = (value, min, max) => {
    const range = max - min;
    return ((((value - min) % range) + range) % range) + min;
  };

  function render(time, dt = 0) {
    const scrollY = reduceMotion ? 0 : window.scrollY;

    camera.position.x += (pointer.x * 0.9 - camera.position.x) * 0.035;
    camera.position.y += (-pointer.y * 0.6 - camera.position.y) * 0.035;
    camera.lookAt(lookTarget);

    for (const s of shapes) {
      const halfH = tanHalfFov * (camera.position.z - s.z);
      const halfW = halfH * camera.aspect;
      const rangeY = halfH * 1.3;

      // scroll parallax: far shapes move slower than the page, near ones a bit faster
      const worldPerPx = (2 * halfH) / window.innerHeight;
      const depth = (s.z + 10) / 9; // 0 = far, 1 = near
      const scrollShift = scrollY * worldPerPx * (0.18 + depth * 0.22);

      const bob = Math.sin(time * s.bobSpeed + s.phase) * s.bobAmp;
      const y = wrap(s.v * rangeY + scrollShift + bob, -rangeY, rangeY);
      s.mesh.position.set(s.u * halfW * 1.08, y, s.z);

      s.mesh.rotation.x += s.spin.x * dt;
      s.mesh.rotation.y += s.spin.y * dt;
      s.mesh.rotation.z += s.spin.z * dt;

      s.scale += (s.targetScale - s.scale) * (reduceMotion ? 1 : Math.min(1, dt * 3));
      s.mesh.scale.setScalar(s.size * s.scale);
    }

    renderer.render(scene, camera);
  }

  resize();

  if (reduceMotion) {
    for (const s of shapes) s.scale = 1;
    render(0);
  } else {
    const clock = new THREE.Clock();
    renderer.setAnimationLoop(() => {
      const dt = Math.min(clock.getDelta(), 0.05);
      render(clock.elapsedTime, dt);
    });
  }
  requestAnimationFrame(() => canvas.classList.add("is-ready"));

  /* ---------- public API ---------- */
  return {
    focus(color) {
      const hex = color ? new THREE.Color(color).getHex() : null;
      for (const s of shapes) {
        if (hex === null) s.targetScale = 1;
        else s.targetScale = s.baseColor.getHex() === hex ? 1.35 : 0.85;
      }
      if (reduceMotion) render(0);
    },
  };
}

/** Small deterministic PRNG so the doodles land in the same spots every time. */
function mulberry32(seed) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
