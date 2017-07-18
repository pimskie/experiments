/**
 * http://codepen.io/alexpierre/pen/PqKEGg
 **/

function Pixel(x, y, z, color) {
	this.x = x;
	this.y = y;
	this.z = z;
	this.color = color;
	this.colorAsString = 'rgba(' + color.r + ', ' +color.g + ', ' + color.b + ', ' + color.a + ')';
	this.colorAsHex = rgbToHex(color.r, color.g, color.b);
	this.alpha = color.a;
}

function componentToHex(c) {
	var hex = c.toString(16);
	return hex.length == 1 ? "0" + hex : hex;
}

function rgbToHex(r, g, b) {
	return "#" + componentToHex(r) + componentToHex(g) + componentToHex(b);
}

var img = document.querySelector('.js-image'),
	imgW = img.width,
	imgH = img.height,
	canvas = document.querySelector('.js-canvas'),
	ctx = canvas.getContext('2d'),
	numTiles = 100,
	pixels = [],
	pixelData;

// set canvas dimensions
canvas.width = imgW;
canvas.height = imgH;

// draw image on canvas
ctx.drawImage(img, 0, 0, imgW, imgH);

// get the pixel data
pixelData = ctx.getImageData(0, 0, imgW, imgH).data;

// loop through and save to array
var x = 0,
	y = 0,
	i,
	pixel,
	color;

// + 4: 1 pixel holds 4 channels (rgba)
for (i = 0; i < pixelData.length; i += 4) {

	var opacity = pixelData[i + 3] / 255;
		if (opacity === 0) {
		continue;
	}


	if (i % imgW === 0) {
		y += 1;
		x = 0;
	}

	x = parseInt(i / 4) % imgW;


	color = {
		r: pixelData[i],
		g: pixelData[i + 1],
		b: pixelData[i + 2],
		a: opacity.toFixed(2)
	};
	pixels.push(new Pixel(x, y, 0, color));
}

console.log(pixels.length);

// setup THREE
// bring in the vars
var frame = 0,
	winW,
	winH,
	scene,
	camera,
	controls,
	objectHolder,
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
	camera.position.set(30, 30, 30);

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

	controls = new THREE.OrbitControls(camera);
	document.body.appendChild(renderer.domElement);
}

/**
 * Create and add all the assets
 **/
function setupWorld() {
	// add floor
	plane = new THREE.Mesh(
		new THREE.PlaneGeometry(100, 100),
		new THREE.MeshPhongMaterial({color: 0xcccccc})
	);
	plane.rotation.x = 0; // -Math.PI / 2;
	plane.position.y = 0;
	plane.receiveShadow = true;
	scene.add(plane);

	objectHolder = new THREE.Object3D();
	scene.add(objectHolder);

	// add image as cubes
	drawImage();

	// add lights
	scene.add(new THREE.AmbientLight(0x666666));

	var light = new THREE.DirectionalLight(0xffffff);
	light.position.set(0, 20, 20);
	light.target.position.set(0, 0, 0);

	light.castShadow = true;
	light.shadowDarkness = 0.2;
	light.shadowCameraVisible = false;

	light.shadowCameraNear = 2;
	light.shadowCameraFar = 150;
	light.shadowCameraLeft = -2.5;
	light.shadowCameraRight = 2.5;
	light.shadowCameraTop = 2.5;
	light.shadowCameraBottom = -2.5;
	scene.add(light);
}

function drawImage() {
	var winH = window.innerHeight,
		ratio = Math.round(window.innerWidth / imgW),
		cubeMat,
		cube;

	pixels.forEach(function(pixel, index) {
		cube = new THREE.Mesh(
			new THREE.BoxGeometry(1, 1, 10),
			new THREE.MeshPhongMaterial({color: pixel.colorAsHex})
		);
		cube.position.set(pixel.x, -(pixel.y / 3), pixel.z);

		objectHolder.add(cube);
	});

}

function loop() {
	window.requestAnimationFrame(loop);

	// var timer = Date.now() * 0.0002,
	// 	dist = 30;

	// camera.position.x = Math.cos(timer) * dist;
	// camera.position.y = dist;
	// camera.position.z = Math.sin(timer) * dist;
	// camera.lookAt(scene.position);

	controls.update();
	renderer.render(scene, camera);
}