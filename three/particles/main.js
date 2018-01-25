/* globals THREE: false, */

const PI2 = Math.PI * 2;

const scene = new THREE.Scene();
scene.background = new THREE.Color(0xffffff);

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const group = new THREE.Group();
scene.add(group);


const numGeoms = 50;
const R = 10;
const circumference = PI2 * R;
let phase = 0;
const speed = 0.005;

const circleR = (circumference / numGeoms) / 2;

const material = new THREE.MeshBasicMaterial({ color: 0x000000 });
const geometry = new THREE.SphereGeometry(circleR, 20, 20);
// const geometry = new THREE.BoxGeometry(1, 1, 1);

const updateMesh = (mesh, total, index, phase = 0) => {
	const angle = phase + (PI2 / total) * index;
	const r = R; // (R / (total)) * index;
	const scale = Math.cos((index * 0.1) + (phase * 5));

	const x = Math.cos(angle) * r;
	const y = Math.sin(angle) * r;
	const z = scale * 4; // Math.cos(angle) * r;

	mesh.position.set(x, y, z);
	mesh.scale.set(scale, scale, scale);
};

for (let i = 0; i < numGeoms; i++) {
	const mesh = new THREE.Mesh(geometry, material);

	updateMesh(mesh, numGeoms, i, phase);

	group.add(mesh);
}


camera.position.z = 20;

function animate() {
	const { children, children: { length } } = group;

	children.forEach((c, i) => {
		updateMesh(c, length, i, phase);
	});

	group.rotation.y += speed * 0.5;
	phase += speed;

	renderer.render(scene, camera);
	requestAnimationFrame(animate);
}
animate();
