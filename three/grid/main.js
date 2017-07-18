let scene;
let camera;
let renderer;

let windowW = window.innerWidth;
let windowH = window.innerHeight;

let geometry;
let material;
let mesh;
let grid;

class Grid {
	constructor(options = { cols: 25 }) {
		Object.assign(this, options);

		this.container = new THREE.Object3D();
		this.container.name = 'grid-container';

		this.particles = new Set();
	}

	create(width) {
		let step = width / this.cols;
		let total = this.cols * this.cols;

		let startX = -(width * 0.5);
		let x = startX;
		let y = 0;
		let z = 0;

		let particle;

		for (let i = 1; i <= total; i++) {
			particle = new Particle({x, y, z}, i);

			this.particles.add(particle);
			this.container.add(particle.mesh);

			x += step;

			if (i % this.cols === 0) {
				x = startX;
				z += step;
			}
		}

		this.container.position.set(0, -200, -1600);
		this.container.rotation.x = 0.01;

		return this.container;
	}

	update() {
		for (let particle of this.particles) {
			particle.update();
		}
	}
}

class Particle {
	constructor(pos = { x: 0, y: 0, z: 0 }, index) {
		this.pos = pos;
		this.posOriginal = Object.assign({}, pos);

		this.radius = 10;
		this.step = 0.02;
		this.angle = (index * 2) * this.step;

		this.material = new THREE.MeshBasicMaterial({ color: 0xc3c3c3 });
		this.geom = new THREE.SphereGeometry(2, 5, 5);
		this.mesh = new THREE.Mesh(this.geom, this.material);

		this.setPosition();
	}

	update() {
		this.pos.y = this.posOriginal.y - (Math.sin(this.angle) * this.radius);

		this.setPosition();

		this.angle += this.step;
	}

	setPosition() {
		this.mesh.position.set(this.pos.x, this.pos.y, this.pos.z);
	}

}

function init() {
	createScene();
	createGrid();
}

function createScene() {
	scene = new THREE.Scene();
	scene.fog = new THREE.Fog(0xf5f5f5, 100, 1000);

	camera = new THREE.PerspectiveCamera(75, windowW / windowH, 1, 2000);

	renderer = new THREE.WebGLRenderer({ alpha: true });
	renderer.setSize(windowW, windowH);

	document.body.appendChild(renderer.domElement);
}

function createGrid() {
	grid = new Grid();
	grid.create(windowW);

	scene.add(grid.container);
}

function onWindowResize() {
	windowW = window.innerWidth;
	windowH = window.innerHeight;

	camera.aspect = windowW / windowH;
	camera.updateProjectionMatrix();

	renderer.setSize(windowW, windowH);
}

function animate() {
	grid.update();

	renderer.render(scene, camera);
	requestAnimationFrame(animate);
}

window.addEventListener('resize', onWindowResize, false);

init();
animate();

