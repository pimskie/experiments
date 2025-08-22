import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { createNoise2D, createNoise3D } from "simplex-noise";

import GUI from "lil-gui";

const randomArrayValue = (arr) => arr[Math.floor(Math.random() * arr.length)];
const palette = ["#780000", "#c1121f", "#fdf0d5", "#003049", "#669bbc"];
const noise2D = createNoise2D();
const noise3D = createNoise3D();

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

const renderer = new THREE.WebGLRenderer({
  alpha: true,
});
renderer.setSize(window.innerWidth, window.innerHeight);

const color = 0xffffff;
const intensity = 3;
const light = new THREE.DirectionalLight(color, intensity);
light.position.set(-1, 2, 4);
scene.add(light);

const controls = new OrbitControls(camera, renderer.domElement);

const updateCubes = (config, cubes, tick = 0) => {
  const { noiseScale } = config;

  cubes.forEach(({ mesh }) => {
    const position = mesh.geometry.attributes.position;
    const originalPositions = mesh.geometry.userData.originalPosition;
    mesh.rotation.set(
      0,
      noise2D(mesh.position.x * noiseScale, mesh.position.y * noiseScale),
      0
    );

    for (let i = 0; i < position.count; i++) {
      const y = originalPositions[i * 3 + 1];
      const z_orig = originalPositions[i * 3 + 0];

      const n2 = noise3D(
        mesh.position.x * noiseScale,
        mesh.position.z * noiseScale,
        tick * 0.2
      );
      const waveZ = Math.sin(y * 0.2 + tick) * 2 * n2;

      position.setX(i, z_orig + waveZ);
    }

    position.needsUpdate = true;
  });
};

let elapsedTime = 0;

const config = {
  noiseScale: 0.01,
};

const cols = 20;
const rows = cols * 1.5;

const cubes = new Array(cols * rows).fill(0).map((_, index) => {
  const x = -((cols / 2) * 3) + (index % cols) * 3;
  const z = -((rows / 1.3) * 3) + Math.floor(index / cols) * 3;

  const height = 5 + Math.random() * 5;
  const w = 1 + Math.random() * 3;
  const d = w; // 1 + Math.random() * 3;

  const cube = new THREE.Mesh(
    new THREE.BoxGeometry(w, height, d, 16, 16, 16),
    new THREE.MeshPhongMaterial({
      color: randomArrayValue(palette),
      side: THREE.DoubleSide,
    })
  );

  cube.position.set(x, height * 0.5, z);
  cube.geometry.userData.originalPosition =
    cube.geometry.attributes.position.array.slice();

  scene.add(cube);

  return {
    mesh: cube,
    height,
    scale: 1,
  };
});

updateCubes(config, cubes);

const gui = new GUI();
gui
  .add(config, "noiseScale", 0.01, 0.3, 0.01)
  .onChange((val) => updateCubes(config, cubes));

document.body.appendChild(renderer.domElement);

function animate() {
  elapsedTime = clock.getElapsedTime();

  updateCubes(config, cubes, elapsedTime);
  controls.update();
  renderer.render(scene, camera);
}
renderer.setAnimationLoop(animate);
