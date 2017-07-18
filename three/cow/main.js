/**
 * Pallets used:
 * http://www.colourlovers.com/palette/1179667/The_Color_of_Air_I
 * http://www.colourlovers.com/palette/1616282/Space_Travels
 * from http://www.colourlovers.com/palettes/search?query=Space
 *
 *
 **/

// utils
function randomBetween(min, max, round) {
	var num = Math.random() * (max - min + 1) + min;

	if (round) {
		return Math.floor(num);
	} else {
		return num;
	}
}

var Cow  = (function() {

	function Cow(position, amplitude, frequency, angle, speed) {
		this.positionOriginal = position;
		this.position = position;
		this.amplitude = amplitude;
		this.frequency = frequency;
		this.angle = angle || 0;
		this.speed = speed || 0.1;

		this.parts = {};

		// create
		this.instance = this.create();
		this.instance.rotation.y = randomBetween(0, Math.PI);

		this.randomDepth();
	}

	Cow.prototype = {
		create: function() {
			// create stuff
			var cow = new THREE.Object3D(),
				headHolder = new THREE.Object3D(),
				materialGray = new THREE.MeshBasicMaterial({color: 0xcccccc}),
				materialBlack = new THREE.MeshBasicMaterial({color: 0x000000}),
				materialBlue = new THREE.MeshBasicMaterial({color: 0xC6DBE8}),
				tailGeometry = new THREE.BoxGeometry(6, 2, 2),
				legGeometry = new THREE.BoxGeometry(2, 4, 2);

			// pivot point to right center
			tailGeometry.applyMatrix( new THREE.Matrix4().makeTranslation(-3, 0, 0));

			// pivot point to center top (instead of center)
			legGeometry.applyMatrix( new THREE.Matrix4().makeTranslation(0, -2, 0));

			var body = new THREE.Mesh(
					new THREE.BoxGeometry(16, 10, 10),
					new THREE.MeshPhongMaterial({color: 0xFDFEF3})
				),
				head = new THREE.Mesh(
					new THREE.BoxGeometry(8, 8, 8),
					new THREE.MeshBasicMaterial({color: 0x433A3C})
				),
				nose = new THREE.Mesh(
					new THREE.BoxGeometry(4, 6, 6),
					materialBlue
				),
				earR = new THREE.Mesh(
					this.createGeometry(3, 1, 3, {x:0, y:0, z:1.5}),
					materialGray
				),
				earL = new THREE.Mesh(
					this.createGeometry(3, 1, 3, {x:0, y:0, z:-1.5}),
					materialGray
				),
				eyeR = new THREE.Mesh(
					new THREE.SphereGeometry(1, 32, 32),
					new THREE.MeshBasicMaterial({color: 0xFDFEF3})
				),
				eyeL = eyeR.clone(),

				// I don't know the English name, no
				sack = new THREE.Mesh(
					new THREE.BoxGeometry(4, 4, 4),
					materialBlue
				),
				tail = new THREE.Mesh(
					tailGeometry,
					materialGray
				),

				// create legs
				// RightBack, RightFront, LeftBack, LeftFront
				legRB = new THREE.Mesh(
					legGeometry,
					materialBlack
				),
				legRF = legRB.clone(),
				legLB = legRB.clone(),
				legLF = legRB.clone();

			// position stuff
			head.position.set(0, -4, 0);
			headHolder.position.set(12, 6, 0);
			headHolder.rotation.set(0, 0, 0.2);
			headHolder.name = 'headHolder';

			nose.position.set(6, -5, 0);

			earR.position.set(-1, -1, 4);
			earR.rotation.x = 1;
			earR.name = 'earR';

			earL.position.set(-1, -1, -4);
			earL.rotation.x = -1;
			earL.name = 'earL';

			eyeR.position.set(2, -3, 4);
			eyeL.position.set(2, -3, -4);

			tail.position.set(-8, 4, 0);
			tail.rotation.set(0, 0, Math.PI >> 1);
			tail.name = 'tail';

			sack.position.set(-3, -7, 0);

			legRB.position.set(-7, -5, 4);
			this.parts.legRB = legRB;

			legRF.position.set(7, -5, 4);
			this.parts.legRF = legRF;

			legLB.position.set(-7, -5, -4);
			this.parts.legLB = legLB;

			legLF.position.set(7, -5, -4);
			this.parts.legLF = legLF;

			// legRB.rotation.z = -0.5;
			// legRF.rotation.z = -0.5;
			// legLB.rotation.z = -0.5;
			// legLF.rotation.z = -0.5;

			// assemble the space cow
			headHolder.add(head);
			headHolder.add(nose);
			headHolder.add(earR);
			headHolder.add(earL);
			headHolder.add(eyeR);
			headHolder.add(eyeL);
			cow.add(body);

			cow.add(headHolder);
			cow.add(sack);
			cow.add(tail);
			cow.add(legRB);
			cow.add(legRF);
			cow.add(legLB);
			cow.add(legLF);

			body.castShadow = true;
			head.castShadow = true;
			tail.castShadow = true;
			legRB.castShadow = true;
			legRF.castShadow = true;
			legLB.castShadow = true;
			legLF.castShadow = true;
			sack.castShadow = true;

			// set position
			cow.position.set(this.position.x, this.position.y, this.position.z);

			return cow;
		},

		createGeometry: function(width, height, depth, pivot) {
			var g = new THREE.BoxGeometry(3, 1, 3);
			g.applyMatrix( new THREE.Matrix4().makeTranslation(pivot.x, pivot.y, pivot.z));
			return g;
		},

		randomDepth: function() {
			setTimeout(this.setRandomDepth.bind(this), randomBetween(500, 5000, true));
		},

		setRandomDepth: function() {

			var newZ = this.positionOriginal.z + randomBetween(-100, 100),
				newX = randomBetween(-100, 100),
				rotationX = newZ < this.instance.position.z ? -0.5 : 0.5;
				rotationY = newX < this.instance.position.x ? -1 : 1;

			TweenMax.to(this.instance.position, 10, {
				x: newX,
				z: newZ,
				ease: Power1.easeInOut,
				onComplete: this.setRandomDepth.bind(this)
			});
			TweenMax.to(this.instance.rotation, 3, {x: rotationX});
			TweenMax.to(this.instance.rotation, 3, {x: 0, delay: 7});

			TweenMax.allTo([
				this.parts.legRB.rotation,
				this.parts.legLB.rotation,
				this.parts.legRF.rotation,
				this.parts.legLF.rotation
				], 3, {x: rotationX});

			TweenMax.allTo([
				this.parts.legRB.rotation,
				this.parts.legLB.rotation,
				this.parts.legRF.rotation,
				this.parts.legLF.rotation
				], 3, {x: 0, delay: 7});

			// TweenMax.to(this.instance.rotation, 10,{y: randomBetween(-Math.PI, Math.PI)});
		},

		setRandomHeight: function() {
			var tail = this.instance.getObjectByName('tail'),
				newY = this.positionOriginal.y + randomBetween(-400, 400),
				rotation = newY < this.instance.position.y ? -1 : 1;

			TweenMax.to(this.instance.position, 10, {
				y: newY,
				ease: Power0.easeIn,
				onComplete: this.setRandomHeight.bind(this)
			});
			TweenMax.to(tail.rotation, 5, {z: rotation});
			TweenMax.to(tail.rotation, 2, {z: Math.PI >> 1, delay: 8});
		}
	};

	return Cow;
})();


// define some global vars
var NUM_COWS = 10,
	cows = [],
	winW,
	winH,
	aspect,
	scene,
	camera,
	controls,
	renderer;


scale();
setupStage();
setupWorld();
camera.position.z = 50;

loop();

function scale() {
	winW = window.innerWidth;
	winH = window.innerHeight;
	aspect = winW / winH;
}

function setupStage() {
	scene = new THREE.Scene();

	camera = new THREE.PerspectiveCamera(85, aspect, 0.1, 1000);
	renderer = new THREE.WebGLRenderer();
	renderer.setSize(winW, winH);
	renderer.setClearColor( 0x323131, 1);
	renderer.shadowMapEnabled = true;
	renderer.shadowMapSoft = true;

	document.body.appendChild(renderer.domElement);

	controls = new THREE.OrbitControls(camera);
}


/**
 * Create and add all the assets
 **/
function setupWorld() {
	addLights();
	addCows();
}

/**
 * Create and add ground
 **/
function addGround() {
	// create ground
	var groundMaterial = new THREE.MeshPhongMaterial({
		color: 0xcccccc
	});

	plane = new THREE.Mesh(new THREE.PlaneGeometry(100, 100), groundMaterial);
	plane.rotation.x = -Math.PI / 2;
	plane.position.y = -15;
	plane.receiveShadow = true;
	scene.add(plane);
}

/**
 * Bring in the cows!
 **/
function addCows() {
	var i,
		cow,
		amplitude,
		frequency,
		speed,
		angle;

		// amplitude, frequency, speed

	for (i = 0; i < NUM_COWS; i++) {
		amplitude = 0.1; //randomBetween(0.1, 0.4);
		frequency = 0.01; // randomBetween(0.5, 2) * 0.005;
		angle = randomBetween(0, 360, true) * (Math.PI / 180);

		cow = new Cow({
			x: randomBetween(-100, 100, true),
			y: randomBetween(-50, 50, true),
			z: randomBetween(-500, 10, true)
		}, amplitude, frequency, angle);

		scene.add(cow.instance);
		cows.push(cow);
	}
}

/**
 * Create lights for the scene
 **/
function addLights() {
	scene.add(new THREE.AmbientLight(0x666666));

	var light = new THREE.DirectionalLight(0xffffff),
		shadowFalloff = 10;

	light.position.set(0, 20, 30);
	light.target.position.set(0, 0, 0);

	light.castShadow = true;
	light.shadowDarkness = 0.2;
	light.shadowCameraVisible = false;

	light.shadowCameraNear = 2;
	light.shadowCameraFar = 150;
	light.shadowCameraLeft = -shadowFalloff;
	light.shadowCameraRight = shadowFalloff;
	light.shadowCameraTop = shadowFalloff;
	light.shadowCameraBottom = -shadowFalloff;
	scene.add(light);
}


function loop() {
	window.requestAnimationFrame(loop);

	cows.forEach(function(cow) {
	});

	controls.update();

	renderer.render(scene, camera);
}
