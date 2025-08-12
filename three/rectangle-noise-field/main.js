import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { createNoise3D, createNoise2D } from "simplex-noise";

const randomArrayValue = (arr) => arr[Math.floor(Math.random() * arr.length)];
const palette = ["#780000", "#c1121f", "#fdf0d5", "#003049", "#669bbc"];
const noise2D = createNoise2D();

const clock = new THREE.Clock();
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
camera.position.y = 30;
camera.position.z = 30;

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);

const controls = new OrbitControls(camera, renderer.domElement);

const spread = 20;
const noiseScale = 0.1;
document.body.appendChild(renderer.domElement);

for (let count = 0; count < 300; count++) {
  const x = -spread / 2 + Math.random() * spread;
  const z = Math.random() * spread;

  const noiseValue = noise2D(x * noiseScale, z * noiseScale);
  const noiseValue2 = noise2D(z * noiseScale, x * noiseScale);

  const height = 7 + 7 * noiseValue;
  const w = 1 + noiseValue2 * 1;

  const cube = new THREE.Mesh(
    new THREE.BoxGeometry(w, height, w),
    new THREE.MeshBasicMaterial({
      color: randomArrayValue(palette),
    })
  );

  cube.position.set(x, height * 0.5, z);
  cube.rotation.set(0, noise2D(count * 0.001, 1), 0);

  scene.add(cube);
}

const transformCard = (tick) => {};

function animate() {
  const elapsedTime = clock.getElapsedTime();
  transformCard(elapsedTime);

  controls.update();
  renderer.render(scene, camera);
}
renderer.setAnimationLoop(animate);
