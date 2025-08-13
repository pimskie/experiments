import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { createNoise2D } from "simplex-noise";

import GUI from "lil-gui";

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

const updateCubes = (config, cubes) => {
  const { noiseScale } = config;

  cubes.forEach(({ mesh, height }, index) => {
    const { x, y } = mesh.position;
    mesh.rotation.set(0, noise2D(x * noiseScale, y * noiseScale), 0);
  });
};

const spread = 20;

const config = {
  noiseScale: 0.01,
};

const cubes = new Array(300).fill(0).map((_, index) => {
  const x = -spread / 2 + Math.random() * spread;
  const z = Math.random() * (spread * 2);

  const height = 5 + Math.random() * 5;
  const w = 2 + Math.random();
  const d = 2 + Math.random();

  const cube = new THREE.Mesh(
    new THREE.BoxGeometry(w, height, d),
    new THREE.MeshPhongMaterial({
      color: randomArrayValue(palette),
    })
  );

  cube.position.set(x, height * 0.5, z);

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
  const elapsedTime = clock.getElapsedTime();

  controls.update();
  renderer.render(scene, camera);
}
renderer.setAnimationLoop(animate);
