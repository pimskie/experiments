import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { createNoise3D } from "simplex-noise";

const noise3D = createNoise3D();

const textureLoader = new THREE.TextureLoader();
const clock = new THREE.Clock();
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
camera.position.z = 5;

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);

const controls = new OrbitControls(camera, renderer.domElement);

document.body.appendChild(renderer.domElement);

const cardTexture = textureLoader.load("card.jpg");
const planeGeom = new THREE.PlaneGeometry(2, 3, 20, 20);
const planeMaterial = new THREE.MeshBasicMaterial({
  map: cardTexture,
  side: THREE.DoubleSide,
  // wireframe: true,
});

const plane = new THREE.Mesh(planeGeom, planeMaterial);
plane.rotation.x = -1;
plane.rotation.z = 1;
plane.position.x = -10;

scene.add(plane);

const transformCard = (tick) => {
  const position = plane.geometry.getAttribute("position");
  const noiseScale = 0.05;
  const noiseRotationX = noise3D(
    plane.position.x * noiseScale,
    plane.position.y * noiseScale,
    tick * noiseScale
  );
  const noiseRotationY = noise3D(
    plane.position.x * noiseScale,
    tick * noiseScale,
    plane.position.y * noiseScale
  );
  const noisePositionX = noise3D(
    plane.position.x * noiseScale,
    plane.position.y * noiseScale,
    tick * noiseScale
  );

  for (let i = 0; i < position.count; i++) {
    const y = position.getY(i);
    const z = Math.cos(y * 0.6 + tick) * 1.5;

    position.setZ(i, z);
  }

  plane.rotation.x = noiseRotationX;
  plane.rotation.y = noiseRotationY;
  plane.position.x += 0.1;

  position.needsUpdate = true;
};

function animate() {
  const elapsedTime = clock.getElapsedTime();

  transformCard(elapsedTime);

  // plane.rotation.y += 0.01;
  controls.update();
  renderer.render(scene, camera);
}
renderer.setAnimationLoop(animate);

