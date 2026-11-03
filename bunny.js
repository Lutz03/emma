// 3D bunny ballerina doing pirouettes (Three.js, built from simple shapes)
import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js";

const box = document.getElementById("bunny");
if (box) init(box);

function init(box) {
  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  } catch {
    box.remove(); // no WebGL: just hide the bunny
    return;
  }
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  box.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(28, 1, 0.1, 50);
  camera.position.set(0, 2.05, 8.6);
  camera.lookAt(0, 1.9, 0);

  scene.add(new THREE.HemisphereLight(0xffffff, 0xf3c4d0, 1.6));
  const sun = new THREE.DirectionalLight(0xffffff, 1.6);
  sun.position.set(3, 6, 5);
  scene.add(sun);

  // ---------- materials ----------
  const mat = (color, extra = {}) => new THREE.MeshStandardMaterial({ color, roughness: 0.65, ...extra });
  const fur = mat(0xfffafa);
  const pinkInner = mat(0xf7b3c2);
  const leotard = mat(0xf28fa6);
  const tutuA = mat(0xf9c6d3, { side: THREE.DoubleSide, roughness: 0.9 });
  const tutuB = mat(0xfde4ea, { side: THREE.DoubleSide, roughness: 0.9 });
  const shoe = mat(0xf4a6b8, { roughness: 0.35 });
  const black = mat(0x2b1d22, { roughness: 0.2 });
  const white = mat(0xffffff, { emissive: 0xffffff, emissiveIntensity: 0.6 });
  const cheek = mat(0xf7a1b5, { transparent: true, opacity: 0.75 });
  const lilac = mat(0xc9b0e6);
  const gold = mat(0xf6cf6b, { roughness: 0.3, metalness: 0.3 });

  const sphere = (r, m) => new THREE.Mesh(new THREE.SphereGeometry(r, 32, 24), m);
  const capsule = (r, len, m) => new THREE.Mesh(new THREE.CapsuleGeometry(r, len, 8, 16), m);

  // Ruffled tutu layer: a flared cone with a wavy edge
  function tutuLayer(top, bottom, h, waves, m) {
    const g = new THREE.CylinderGeometry(top, bottom, h, 96, 1, true);
    const p = g.attributes.position;
    for (let i = 0; i < p.count; i++) {
      if (p.getY(i) < 0) {
        const a = Math.atan2(p.getZ(i), p.getX(i));
        p.setY(i, p.getY(i) + Math.sin(a * waves) * 0.06);
      }
    }
    g.computeVertexNormals();
    return new THREE.Mesh(g, m);
  }

  // ---------- build the bunny (origin at the floor) ----------
  const bunny = new THREE.Group();
  scene.add(bunny);

  // Standing leg on pointe
  const legL = capsule(0.13, 0.75, fur);
  legL.position.set(0.08, 0.55, 0);
  bunny.add(legL);
  const shoeL = new THREE.Mesh(new THREE.ConeGeometry(0.13, 0.3, 16), shoe);
  shoeL.rotation.x = Math.PI;
  shoeL.position.set(0.08, 0.12, 0);
  bunny.add(shoeL);

  // Passé leg: bent with the toe at the standing knee
  const thigh = capsule(0.13, 0.4, fur);
  thigh.position.set(-0.22, 0.98, 0.08);
  thigh.rotation.z = -1.0;
  bunny.add(thigh);
  const shin = capsule(0.12, 0.35, fur);
  shin.position.set(-0.18, 0.68, 0.12);
  shin.rotation.z = 0.9;
  bunny.add(shin);
  const shoeR = sphere(0.13, shoe);
  shoeR.position.set(0.0, 0.55, 0.12);
  bunny.add(shoeR);

  // Body in a pink leotard
  const body = sphere(0.48, leotard);
  body.scale.set(1, 1.15, 0.9);
  body.position.y = 1.55;
  bunny.add(body);

  // Tutu (two ruffled layers)
  const tutu1 = tutuLayer(0.42, 1.15, 0.22, 14, tutuA);
  tutu1.position.y = 1.28;
  const tutu2 = tutuLayer(0.42, 0.95, 0.2, 11, tutuB);
  tutu2.position.y = 1.36;
  bunny.add(tutu1, tutu2);

  // Fluffy tail
  const tail = sphere(0.16, fur);
  tail.position.set(0, 1.42, -0.45);
  bunny.add(tail);

  // Arms raised in an "en haut" curve, with paws
  function arm(side) {
    const g = new THREE.Group();
    g.position.set(0.38 * side, 1.85, 0);
    const upper = capsule(0.09, 0.45, fur);
    upper.position.set(0.18 * side, 0.22, 0);
    upper.rotation.z = -0.7 * side;
    const lower = capsule(0.085, 0.4, fur);
    lower.position.set(0.32 * side, 0.62, 0);
    lower.rotation.z = 0.35 * side;
    const paw = sphere(0.1, fur);
    paw.position.set(0.22 * side, 0.86, 0);
    g.add(upper, lower, paw);
    bunny.add(g);
    return g;
  }
  const armL = arm(1);
  const armR = arm(-1);

  // Head
  const head = new THREE.Group();
  head.position.y = 2.38;
  bunny.add(head);
  const skull = sphere(0.56, fur);
  skull.scale.set(1.08, 0.95, 1);
  head.add(skull);

  for (const s of [-1, 1]) {
    const eye = sphere(0.075, black);
    eye.position.set(0.2 * s, 0.05, 0.5);
    const shine = sphere(0.025, white);
    shine.position.set(0.2 * s + 0.025, 0.08, 0.565);
    const blush = sphere(0.1, cheek);
    blush.scale.set(1, 0.6, 0.3);
    blush.position.set(0.34 * s, -0.12, 0.44);
    head.add(eye, shine, blush);
  }
  const nose = sphere(0.055, pinkInner);
  nose.scale.set(1.2, 0.8, 1);
  nose.position.set(0, -0.06, 0.55);
  head.add(nose);

  // Ears (pivot at the base so they can wiggle)
  function ear(side) {
    const pivot = new THREE.Group();
    pivot.position.set(0.22 * side, 0.42, -0.05);
    pivot.rotation.z = -0.18 * side;
    const outer = capsule(0.14, 0.75, fur);
    outer.scale.z = 0.55;
    outer.position.y = 0.48;
    const inner = capsule(0.08, 0.6, pinkInner);
    inner.scale.z = 0.4;
    inner.position.set(0, 0.48, 0.05);
    pivot.add(outer, inner);
    head.add(pivot);
    return pivot;
  }
  const earL = ear(1);
  const earR = ear(-1);

  // Flower crown like Emma's headband, plus a tiny gold tiara
  const crown = new THREE.Group();
  crown.position.set(0, 0.42, 0.18);
  crown.rotation.x = -0.35;
  [[0, 0xf28fa6], [-0.22, 0xc9b0e6], [0.22, 0xa9c8f0]].forEach(([x, c]) => {
    const flower = new THREE.Group();
    flower.position.set(x, x === 0 ? 0.04 : 0, 0);
    for (let i = 0; i < 5; i++) {
      const a = (i / 5) * Math.PI * 2;
      const petal = sphere(0.055, mat(c));
      petal.position.set(Math.cos(a) * 0.06, Math.sin(a) * 0.06, 0);
      flower.add(petal);
    }
    flower.add(sphere(0.04, gold));
    crown.add(flower);
  });
  head.add(crown);

  // Soft floor shadow
  const sc = document.createElement("canvas");
  sc.width = sc.height = 64;
  const ctx = sc.getContext("2d");
  const grad = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
  grad.addColorStop(0, "rgba(201,86,110,0.35)");
  grad.addColorStop(1, "rgba(201,86,110,0)");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 64, 64);
  const shadow = new THREE.Mesh(
    new THREE.PlaneGeometry(2.2, 2.2),
    new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(sc), transparent: true, depthWrite: false })
  );
  shadow.rotation.x = -Math.PI / 2;
  scene.add(shadow);

  // Sparkles circling her
  const sparkles = new THREE.Group();
  scene.add(sparkles);
  const sparkleMats = [gold, mat(0xf28fa6, { emissive: 0xf28fa6, emissiveIntensity: 0.4 }), lilac];
  for (let i = 0; i < 10; i++) {
    const s = new THREE.Mesh(new THREE.OctahedronGeometry(0.06), sparkleMats[i % 3]);
    s.userData = { a: (i / 10) * Math.PI * 2, y: 0.6 + (i % 5) * 0.55, r: 1.35 + (i % 2) * 0.25 };
    sparkles.add(s);
  }

  // ---------- sizing ----------
  function resize() {
    const w = box.clientWidth, h = box.clientHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }
  new ResizeObserver(resize).observe(box);
  resize();

  // ---------- dance ----------
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const clock = new THREE.Clock();
  let visible = true;
  new IntersectionObserver(([e]) => (visible = e.isIntersecting)).observe(box);

  // Cycle: 2.2s gentle sway, then a 1.3s full pirouette
  const SWAY = 2.2, SPIN = 1.3, CYCLE = SWAY + SPIN;
  const ease = (x) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);

  function frame() {
    requestAnimationFrame(frame);
    if (!visible) return;
    const t = reduceMotion ? 0 : clock.getElapsedTime();
    const c = t % CYCLE;
    const turns = Math.floor(t / CYCLE);

    if (c < SWAY) {
      // swaying, arms breathing, slight hop
      const k = c / SWAY;
      bunny.rotation.y = turns * Math.PI * 2 + Math.sin(k * Math.PI * 2) * 0.35;
      bunny.position.y = Math.abs(Math.sin(k * Math.PI * 2)) * 0.06;
      bunny.rotation.z = Math.sin(k * Math.PI * 2) * 0.05;
    } else {
      // pirouette! rise up on pointe and spin once
      const k = (c - SWAY) / SPIN;
      bunny.rotation.y = turns * Math.PI * 2 + ease(k) * Math.PI * 2;
      bunny.position.y = Math.sin(k * Math.PI) * 0.18;
      bunny.rotation.z = 0;
    }

    armL.rotation.z = Math.sin(t * 2.4) * 0.12;
    armR.rotation.z = -Math.sin(t * 2.4) * 0.12;
    earL.rotation.z = -0.18 + Math.sin(t * 3) * 0.12;
    earR.rotation.z = 0.18 - Math.sin(t * 3 + 0.6) * 0.12;
    head.rotation.z = Math.sin(t * 1.5) * 0.06;
    tutu1.rotation.y = Math.sin(t * 4) * 0.08;

    const lift = bunny.position.y;
    shadow.scale.setScalar(1 - lift * 1.5);

    sparkles.children.forEach((s) => {
      const d = s.userData;
      const a = d.a + t * 0.8;
      s.position.set(Math.cos(a) * d.r, d.y + Math.sin(t * 2 + d.a) * 0.15, Math.sin(a) * d.r);
      s.rotation.y = t * 3;
      s.scale.setScalar(0.7 + Math.sin(t * 4 + d.a * 3) * 0.3);
    });

    renderer.render(scene, camera);
  }
  frame();
}
