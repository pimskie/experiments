
// vars for screen dimensions, all set in `setStage`
let canvasWidth;
let canvasHeight;
let midX;
let midY;
let aspectRatio;

let push = false;
let rafId = null;

// setup threeJS
const fov = 45 * (Math.PI / 180);
const far = 2000;

const raycaster = new THREE.Raycaster();
const mousePosition = new THREE.Vector2(0, 0);

// create scene and container (world) for all geometries
const scene = new THREE.Scene();
const world = new THREE.Object3D();
scene.add(world);

// renderer
const renderer = new THREE.WebGLRenderer({ alpha: false });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setClearColor(0xffffff, 1);
renderer.setPixelRatio(window.devicePixelRatio);
renderer.shadowMap.enabled = true;
renderer.shadowMapSoft = true;


// lighting
// https://github.com/mrdoob/three.js/blob/master/examples/webgl_lights_hemisphere.html
//
// scene.add(new THREE.AmbientLight(0x666666));

var light = new THREE.DirectionalLight(0xcccccc, 1);
light.position.set(0, 0, 1000);

light.castShadow = true;

light.shadow.mapSize.width = 512;
light.shadow.mapSize.height = 512;

var d = 200;

light.shadow.camera.left = -d;
light.shadow.camera.right = d;
light.shadow.camera.top = d;
light.shadow.camera.bottom = -d;
light.castShadow = true;

light.shadow.camera.far = 2000;
light.position.set(100, 200, 0);
world.add(light);

let helper = new THREE.DirectionalLightHelper(light, 0.51);
world.add(helper);

// camera
const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, far);

// plane
const planeWidth = window.innerWidth;
const planeHeight = window.innerHeight;
const geometry = new THREE.PlaneGeometry(planeWidth, planeHeight, 20, 20);
const material = new THREE.MeshPhongMaterial({
	color: 0xffffff,
	shading: THREE.FlatShading,
	wireframe: false
})

// const material = new THREE.MeshStandardMaterial({
// 	color: 0xffffff,
// 	shading: THREE.FlatShading
// })

const plane = new THREE.Mesh(geometry, material);
plane.castShadow = true;
plane.receiveShadow = true;
plane.rotation.x = -Math.PI / 2;

world.add(plane);

world.rotation.x = Math.PI / 2;

const setStage = () => {
	canvasWidth = window.innerWidth;
	canvasHeight = window.innerHeight;
	midX = canvasWidth >> 1;
	midY = canvasHeight >> 1;
	aspectRatio = canvasWidth / canvasHeight;

	camera.position.z = canvasHeight / (2 * Math.tan(fov / 2));
	camera.aspect = aspectRatio;
	camera.updateProjectionMatrix();

	renderer.setSize(window.innerWidth, window.innerHeight);

	const scaleX = ~~canvasWidth / planeWidth;
	const scaleY = ~~canvasHeight / planeHeight;
}

const create = () => { }

const wave = (position) => {
	const falloff = 100;
	const maxForce = 100;

	for (let i = 0; i < geometry.vertices.length; i++) {
		const vertex = geometry.vertices[i];
		const distance = Calc.distanceBetween(position.x, position.y, vertex.x, vertex.y);

		// const force = Calc.clamp(1 - (distance / falloff), 0, 1);
		// const newZ = (maxForce * force) * (push ? -1 : 1);

		// vertex.z = newZ;

		vertex.z = (distance < 50) ? -50 : 0;
	}
}

const loop = () => {
	raycaster.setFromCamera(mousePosition, camera);

	// calculate objects intersecting the picking ray
	const intersects = raycaster.intersectObjects([plane]);

	if (intersects.length) {
		wave(intersects[0].point);
		geometry.verticesNeedUpdate = true;
	}

	renderer.render(scene, camera);
	rafId = requestAnimationFrame(loop);
}

const onResize = (e) => {
	setStage();
	renderer.setSize(canvasWidth, canvasHeight);
}

const onMouseMove = (e) => {
	mousePosition.x = ( event.clientX / canvasWidth) * 2 - 1;
	mousePosition.y = - ( event.clientY / canvasHeight) * 2 + 1;
}

setStage();
create();
loop();

window.addEventListener('resize', onResize);
document.addEventListener('mousemove', onMouseMove);

document.addEventListener('mousedown', (e) => {
	push = true;
});

document.addEventListener('mouseup', (e) => {
	push = false;
});

document.body.appendChild(renderer.domElement);

