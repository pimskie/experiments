/**
 * https://aerotwist.com/tutorials/an-introduction-to-shaders-part-1
 * https://aerotwist.com/tutorials/an-introduction-to-shaders-part-2
 * http://codepen.io/Xanmia/pen/oqIip
 * http://codepen.io/zachernuk/pen/RNxvYx
 **/


// bring in the vars
var frame = 0,
	winW,
	winH,
	scene,
	camera,
	sphere,
	sphereMat,
	renderer;


scale();
setupStage();
setupWorld();
camera.position.z = 50;

loop();

function scale() {
	winW = window.innerWidth;
	winH = window.innerHeight;
}

function setupStage() {
	scene = new THREE.Scene();

	camera = new THREE.PerspectiveCamera(75, winW / winH, 0.1, 1000);
	camera.position.x = 1200;
	camera.position.y = 1000;
	camera.position.z = 1000;

	camera.lookAt({
		x: 0,
		y: 0,
		z: 0
	});

	renderer = new THREE.WebGLRenderer();
	renderer.setSize(winW, winH);
	renderer.setClearColor( 0xffffff, 1);
	renderer.shadowMapEnabled = true;
	renderer.shadowMapSoft = true;

	document.body.appendChild(renderer.domElement);
}

/**
 * Create and add all the assets
 **/
function setupWorld() {
	// create sphere
	var radius = 2,
		sphereGeom = new THREE.SphereGeometry(radius, 30, 30);

	sphereMat = new THREE.MeshBasicMaterial({color: 0xff0000});
	sphere = new THREE.Mesh(sphereGeom, sphereMat);
	sphere.castShadow = true;
	scene.add(sphere);

	var groundMaterial = new THREE.MeshPhongMaterial({
		color: 0xcccccc
	});
	plane = new THREE.Mesh(new THREE.PlaneGeometry(100, 100), groundMaterial);
	plane.rotation.x = -Math.PI / 2;
	plane.position.y = -radius * 2;
	plane.receiveShadow = true;
	scene.add(plane);

	scene.add(new THREE.AmbientLight(0x666666));

	var light = new THREE.DirectionalLight(0xffffff);
	light.position.set(0, 20, 20);
	light.target.position.set(0, 0, 0);

	light.castShadow = true;
	light.shadowDarkness = 0.2;
	light.shadowCameraVisible = true;

	light.shadowCameraNear = 2;
	light.shadowCameraFar = 150;
	light.shadowCameraLeft = -2.5;
	light.shadowCameraRight = 2.5;
	light.shadowCameraTop = 2.5;
	light.shadowCameraBottom = -2.5;
	scene.add(light);
}


function loop() {
	window.requestAnimationFrame(loop);

	var timer = Date.now() * 0.0002,
		dist = 30;

	camera.position.x = Math.cos(timer) * dist;
	camera.position.y = dist;
	camera.position.z = Math.sin(timer) * dist;
	camera.lookAt(scene.position);

	renderer.render(scene, camera);
}