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
	ground,
	world,
	worldReflection,
	controls,
	scene,
	camera,
	cubeCamera,
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
	camera.position.set(1, 1, 100);
	camera.lookAt({
		x: 0,
		y: 0,
		z: 0
	});


	renderer = new THREE.WebGLRenderer();
	renderer.setSize(winW, winH);
	renderer.setClearColor( 0xffffff, 1);
	renderer.shadowMapEnabled = true;

	controls = new THREE.OrbitControls(camera);
	document.body.appendChild(renderer.domElement);
}

/**
 * Create and add all the assets
 **/
function setupWorld() {
	world = new THREE.Object3D();
	scene.add(world);

	// create sphere
	var radius = 2;

	var sphere1 = new THREE.Mesh(
		new THREE.SphereGeometry(radius, 30, 30),
		new THREE.MeshLambertMaterial({
			color: 0xff0000,
			emissive: 0x000000,
			combine: THREE.MixOperation,
			reflectivity: 2
		}));
	sphere1.position.y = 2;
	sphere1.castShadow = true;
	world.add(sphere1);

	var sphere2 = new THREE.Mesh(
		new THREE.SphereGeometry(radius * 2, 30, 30),
		new THREE.MeshPhongMaterial({
			color: 0x7ab202,
			emissive: 0x000000,
			combine: THREE.MixOperation,
			reflectivity: 2
		})
	);
	sphere2.position.set(6, 4, 6);
	sphere2.castShadow = true;
	world.add(sphere2);

	var sphere3 = new THREE.Mesh(
		new THREE.SphereGeometry(radius * 2, 30, 30),
		new THREE.MeshLambertMaterial({
			color: 0x02b0b2,
			emissive: 0x000000,
			combine: THREE.MixOperation,
			reflectivity: 2
		})
	);
	sphere3.position.set(0, 4, -10);
	sphere3.castShadow = true;
	world.add(sphere3);

	// ground
	var groundMaterial = new THREE.MeshPhongMaterial({
			color: 0xffffff,
			opacity: 0.8,
			transparent: true,
			doubleSided: true
		});
	ground = new THREE.Mesh(new THREE.BoxGeometry(100, 100, 2, 2, 2, 1), groundMaterial);
	ground.position.y = -1;
	ground.rotation.x = -Math.PI / 2;
	ground.receiveShadow = true;
	scene.add(ground);

	// scene.add(new THREE.AmbientLight(0xffffff));

	// hex, intensity, distance
	var sunLight = new THREE.PointLight(0xffffff, 1, 100);
	sunLight.position.set(0, 50, 0);
	scene.add(sunLight);

	// point light
	/*
	var light = new THREE.PointLight( 0xffffff, 1, 100 );
	light.position.set(0, 25, 40);
	light.shadowCameraVisible = true;
	scene.add( light );
	*/

	/*
	// spotlight
	var light = new THREE.SpotLight( 0xffffff );
	light.position.set(0, 25, 40);

	light.castShadow = true;
	light.shadowCameraVisible = true;

	light.shadowMapWidth = 1024;
	light.shadowMapHeight = 1024;

	var lightWidth = 10;
	light.shadowCameraNear = 2;
	light.shadowCameraLeft = -lightWidth;
	light.shadowCameraRight = lightWidth;
	light.shadowCameraTop = lightWidth;
	light.shadowCameraBottom = -lightWidth;

	scene.add( light );
	*/

	light = new THREE.DirectionalLight(0xffffff, 1);
	light.position.set(0, 20, 40);
	light.target.position.set(0, 0, -4);

	light.castShadow = true;
	light.shadowDarkness = 0.4;
	light.shadowCameraVisible = false;

	var lightWidth = 60;
	light.shadowCameraNear = 2;
	light.shadowCameraLeft = -lightWidth;
	light.shadowCameraRight = lightWidth;
	light.shadowCameraTop = lightWidth;
	light.shadowCameraBottom = -lightWidth;

	scene.add(light);

	worldReflection = world.clone();
	worldReflection.rotation.set(0, 0, Math.PI);
	worldReflection.position.set(0, 0, 0);
	scene.add(worldReflection);
}


function loop() {
	var timer = Date.now() * 0.0002,
		dist = 60;

	// camera.position.x = Math.cos(timer) * dist;
	// camera.position.y = dist;
	// camera.position.z = Math.sin(timer) * dist;
	// camera.lookAt(scene.position);

	controls.update();
	renderer.render(scene, camera);

	window.requestAnimationFrame(loop);
}