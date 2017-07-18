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
	camera.position.z = -100;

	renderer = new THREE.WebGLRenderer();
	renderer.setSize(winW, winH);
	renderer.setClearColor( 0xffffff, 1);

	document.body.appendChild(renderer.domElement);
}

/**
 * Create and add all the assets
 **/
function setupWorld() {
	// create container for everything
	var world = new THREE.Object3D();
	world.position.setZ(-50);
	scene.add(world);

	// create sphere
	var radius = 30,
		sphereGeom = new THREE.SphereGeometry(radius, 30, 30);

	sphereMat = new THREE.ShaderMaterial({
		attributes: {},
		uniforms: {
			time: { type: 'f', value: 0 },
			radius: { type: 'f', value: radius }
		},
		vertexShader: document.getElementById('vertexshader').textContent,
		fragmentShader: document.getElementById('fragmentshader').textContent
	});
	sphere = new THREE.Mesh(sphereGeom, sphereMat);
	sphere.castShadow = true;
	world.add(sphere);

	// create floor
	 var groundMaterial = new THREE.MeshPhongMaterial({
			color: 0xffffff
		}),
		ground = new THREE.Mesh(new THREE.PlaneGeometry(100, 100, 100, 100), groundMaterial);

	ground.rotation.x = -Math.PI / 2;
	ground.position.y = -radius;
	ground.receiveShadow = true;
	world.add(ground);

	// create light(s)
	// scene.add(new THREE.AmbientLight(0x666666));

	/*
	var light = new THREE.PointLight(0xffffff, 10, 500);
	light.position.set(0,  radius * 2, radius >> 1);
	world.add(light);
	*/

	var light = new THREE.DirectionalLight(0xdfebff, 1.75);
	light.position.set(0, 1400, 0);
	light.position.multiplyScalar(1.3);

	light.castShadow = true;
	light.shadowCameraVisible = true;

	// light.shadowMapWidth = 512;
	// light.shadowMapHeight = 512;

	var lightShpere = new THREE.Mesh(
		new THREE.SphereGeometry(5, 32, 32),
		new THREE.MeshBasicMaterial({color: 0xff0000})
	);
	lightShpere.position.set(light.position.x, light.position.y, light.position.z);

	world.add(lightShpere);
}


function loop() {
	window.requestAnimationFrame(loop);
	// sphere.rotation.x += 0.01;
	// sphere.rotation.y += 0.02;
	sphereMat.uniforms.time.value = frame;
	frame += 0.02;

	var timer = Date.now() * 0.0002;
	camera.position.x = Math.cos(timer) * 200;
	camera.position.y = 100;
	camera.position.z = Math.sin(timer) * 200;
	camera.lookAt(scene.position);

	renderer.render(scene, camera);
}