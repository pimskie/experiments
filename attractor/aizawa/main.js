/*!
 * Reference:
 * http://chaoticatmospheres.com/mathrules-strange-attractors
 * https://mir-s3-cdn-cf.behance.net/project_modules/max_1200/f9c9237618879.560aea2359102.jpg
 */

const bgColor = 0x000000;

// input for the attractor
const a = 0.95;
const b = 0.7;
const c = 0.6;
const d = 3.5;
const e = 0.25;
const f = 0.1;
const time = 0.01;

const numParticles = 25000;
let particles;

// vars for screen dimensions, all set in `setStage`
let canvasWidth;
let canvasHeight;
let midX;
let midY;

let rafId = null;

// setup threeJS

// create scene and container (world) for all geometries
const scene = new THREE.Scene();
scene.fog = new THREE.Fog(bgColor, 0.015, 1700);
const world = new THREE.Object3D();
scene.add(world);
world.rotation.x = Math.PI / 1.4;

// camera
const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.01, 2000);
camera.position.z = 1000;

// renderer and shader passes
const renderer = new THREE.WebGLRenderer({ alpha: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setClearColor(bgColor);
renderer.setPixelRatio( window.devicePixelRatio );

const composer = new THREE.EffectComposer(renderer);
const renderPass = new THREE.RenderPass(scene, camera);

const focusShader = new THREE.ShaderPass(THREE.FocusShader);
focusShader.uniforms.screenWidth.value = window.innerWidth;
focusShader.uniforms.screenHeight.value = window.innerHeight;
focusShader.uniforms.sampleDistance.value = 0.8;
focusShader.uniforms.waveFactor.value = 0.001;
focusShader.renderToScreen = true;

composer.addPass(renderPass);
composer.addPass(focusShader);

// controller
const controls = new THREE.OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.9;
controls.enableZoom = true;

const setStage = () => {
	canvasWidth = window.innerWidth;
	canvasHeight = window.innerHeight;
	midX = canvasWidth >> 1;
	midY = canvasHeight >> 1;
}

const create = () => {
	// scale x, y, z position by this factor
	const scale = 200;

	// begin position
	let x = 0.1;
	let y = 0;
	let z = 0;

	// threeJS objects
	const line = new THREE.Geometry();
	const color = new THREE.Color(0xe63d06);
	const material = new THREE.LineBasicMaterial({ color: color  });

	let colors = [];

	let num = numParticles;

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

		// addd new vector to the geometry
		const vector = new THREE.Vector3(x * scale, -y * scale, (z * scale) - 100);
		line.vertices.push(vector);
	}

	line.colors = colors;
	particles = new THREE.Line(line, material);
	world.add(particles);
}

const loop = () => {
	world.rotation.z += 0.01;

	camera.lookAt(scene.position);
	composer.render();

	rafId = requestAnimationFrame(loop);
}

window.addEventListener('resize', () => {
	setStage();

	var pixelRatio = renderer.getPixelRatio();
	var newWidth  = Math.floor( canvasWidth / pixelRatio ) || 1;
	var newHeight = Math.floor( canvasHeight / pixelRatio ) || 1;

	focusShader.uniforms.screenWidth.value = canvasWidth;
	focusShader.uniforms.screenHeight.value = canvasHeight;

	composer.setSize( newWidth, newHeight );

	camera.aspect = canvasWidth / canvasHeight;
	camera.updateProjectionMatrix();
	renderer.setSize(canvasWidth, canvasHeight);
});

setStage();
create();
loop();

document.body.appendChild(renderer.domElement);
