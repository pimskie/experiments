/*!
 * Reference:
 * http://chaoticatmospheres.com/mathrules-strange-attractors
 * https://mir-s3-cdn-cf.behance.net/project_modules/max_1200/f9c9237618879.560aea2359102.jpg
 */

// input for the attractor
const a = 0.95;
const b = 0.7;
const c = 0.6;
const d = 3.5;
const e = 0.25;
const f = 0.1;
const time = 0.01;

const numParticles = 15000;
let particles;

// vars for screen dimensions, all set in `setStage`
let canvasWidth;
let canvasHeight;
let midX;
let midY;

let rafId = null;

// setup threeJS

const far = 2000;

// create scene and container (world) for all geometries
const scene = new THREE.Scene();
scene.fog = new THREE.Fog(0x000000, 500, far - 500);

const world = new THREE.Object3D();
world.position.y = -100;
scene.add(world);

// renderer
const renderer = new THREE.WebGLRenderer({ alpha: false });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setClearColor(0x000000, 1);
renderer.setPixelRatio(window.devicePixelRatio);
renderer.shadowMap.enabled = false;

// lighting
// https://github.com/mrdoob/three.js/blob/master/examples/webgl_lights_hemisphere.html
hemiLight = new THREE.HemisphereLight(0xffffff, 0x000000, 0.6);
hemiLight.color.setHSL(0.6, 1, 0.6);
hemiLight.groundColor.setHSL(0.1, 1, 0.75);
hemiLight.position.set(0, 500, 0);
scene.add(hemiLight);

//
dirLight = new THREE.DirectionalLight(0xffffff, 0.9);
dirLight.position.set(-1, 2, 1);
dirLight.castShadow = false;
dirLight.shadow.mapSize.width = 2048;
dirLight.shadow.mapSize.height = 2048;

var dir = 250;

dirLight.shadow.camera.left = -dir;
dirLight.shadow.camera.right = dir;
dirLight.shadow.camera.top = dir;
dirLight.shadow.camera.bottom = -dir;
dirLight.shadow.camera.far = far;

scene.add(dirLight);

// camera
const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, far);
camera.position.set(-60, 630, 970);


// controller
const controls = new THREE.OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.9;
controls.enableZoom = true;
controls.minDistance = 100;
controls.maxDistance = 1400;

const setStage = () => {
	canvasWidth = window.innerWidth;
	canvasHeight = window.innerHeight;
	midX = canvasWidth >> 1;
	midY = canvasHeight >> 1;
}

const create = () => {
	// scale x, y, z position by this factor
	const scale = 150;

	// begin position
	let x = 0.1;
	let y = 0;
	let z = 0;

	let maxHeight = 0;
	let maxDepth = 0;
	const points = [];

		// calculate points for attractor and push them in the geometry
	for (let i = 0; i < numParticles; i++) {
		let x1 = (z - b) * x - d * y;
		let y1 = d * x + (z - b) * y;
		let z1 = c + a * z - (Math.pow(z, 3) / 3) - (Math.pow(x, 2) + Math.pow(y, 2)) *	(1 + e * z) + f * z * (Math.pow(x, 3));

		x1 *= time;
		y1 *= time;
		z1 *= time;

		x += x1;
		y += y1;
		z += z1;

		// add new vector to the geometry
		// and yes, it should be x, y, z but i like this better
		const vector = new THREE.Vector3(
			-y * scale,
			z * scale,
			x * scale
		);

		points.push(vector);
	}

	const spline = new THREE.CatmullRomCurve3(points);
	spline.type = 'catmullrom';
	spline.tension = 0;

	const extrudeSettings = {
		steps: numParticles / 2,
		bevelEnabled: false,
		extrudePath: spline
	};

	const shapePoints = [];
	const numPoints = 4;
	const angleStep = (Math.PI * 2) / numPoints;
	const width = 7;

	shapePoints.push(new THREE.Vector2(0, 0));
	shapePoints.push(new THREE.Vector2(width, 0));
	shapePoints.push(new THREE.Vector2(width, width));
	shapePoints.push(new THREE.Vector2(0, width));

	const shape = new THREE.Shape(shapePoints);
	const geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);
	const material = new THREE.MeshLambertMaterial({
		color: 0xb3b3b3,
		emissive: 0x575757,
		fog: true
	});

	const mesh = new THREE.Mesh(geometry, material);
	mesh.castShadow = true;
	mesh.receiveShadow = false;
	world.add(mesh);
}

const loop = () => {
	world.rotation.y += 0.01;
	renderer.render(scene, camera);

	rafId = requestAnimationFrame(loop);
}

window.addEventListener('resize', () => {
	setStage();

	camera.aspect = canvasWidth / canvasHeight;
	camera.updateProjectionMatrix();
	renderer.setSize(canvasWidth, canvasHeight);
});

setStage();
create();
loop();

document.body.appendChild(renderer.domElement);
