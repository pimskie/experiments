
const easeOutQuad = (t, b, c, d) => {
	t /= d;
	return -c * t*(t-2) + b;
};

// https://fonts.google.com/specimen/Archivo+Narrow
const IMAGE_URL = 'http://i.imgur.com/CM9pnjh.png';
// const IMAGE_URL = 'http://i.imgur.com/avbAvcz.png';
const TILE_WIDTH = 3;
const SPACING = 1;

const canvas = document.querySelector('.js-canvas');
const ctx = canvas.getContext('2d');

let tick = 0;
let duration = 75;
let rafId = null;

const setCamera = () => {
	let vFOV = 45 * (Math.PI / 180);
	stage.camera.position.z = window.innerHeight / (2 * Math.tan(vFOV / 2) );
}

const stage = {
	scene: new THREE.Scene(),
	camera: new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.01, 2000),

	renderer: new THREE.WebGLRenderer({ alpha: true }),
	targetHolder: new THREE.Object3D()
};

setCamera();

stage.targetHolder.position.x = 400;
stage.targetHolder.position.y = 50;

stage.scene.add(stage.targetHolder);
stage.renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(stage.renderer.domElement);

const getTiles = (img) => {
	const tileHeight = TILE_WIDTH;

	const numCols = Math.round(img.width / TILE_WIDTH);
	const numRows = Math.round(img.height / tileHeight);

	canvas.width = img.width;
	canvas.height = img.height;

	// draw the image on the canvas and get all pixels
	ctx.drawImage(img, 0, 0);

	let imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
	pixelData = imageData.data;

	// QUICK! Make the image black & white
	for(let i = 0; i < pixelData.length; i += 4) {
		var brightness = 0.34 * pixelData[i] + 0.5 * pixelData[i + 1] + 0.16 * pixelData[i + 2];
		pixelData[i] = brightness;
		pixelData[i + 1] = brightness;
		pixelData[i + 2] = brightness;
	}
	ctx.putImageData(imageData,0, 0);

	pixelData = ctx.getImageData(0, 0, canvas.width, canvas.height).data;

	let tileX = 0;
	let tileY = 0;
	let tiles = [];

	for (let y = 0; y < numRows; y++) {
		for (let x = 0; x < numCols; x++) {
			tileX = x * TILE_WIDTH;


			let pixelX = tileX * 4;
			let pixelY = tileY * img.width * 4;
			let pixelIndex = pixelX + pixelY;
			let colorSum = pixelData[pixelIndex] + pixelData[pixelIndex + 1] + pixelData[pixelIndex + 2];
			let startZ = 1000 * (1 - colorSum / (255 * 3));

			if (pixelData[pixelIndex + 3] > 1) {
				tiles.push({
					rgb: [pixelData[pixelIndex], pixelData[pixelIndex + 1], pixelData[pixelIndex + 2]],
					x: tileX - (img.width * 0.5) + (x * SPACING),
					y: -tileY + (img.height * 0.5) - (y * SPACING),
					z: 0,
					startZ
				});
			}
		}

		tileX = 0;
		tileY += tileHeight;
	}

	return tiles;
};

const loadImage = () => {
	image = document.createElement('img');

	image.crossOrigin = '';
	image.src = IMAGE_URL;

	return new Promise(function(resolve, reject) {
		image.addEventListener('load', function() {
			resolve(image);
		});
	});
}


const createScene = (tiles, img) => {
	let geometry = new THREE.Geometry();
	let colors = [];
	let tile;
	let vertex;

	for (i = 0; i < tiles.length; i ++) {
		tile = tiles[i];

		vertex = new THREE.Vector3();

		vertex.x = tile.x;
		vertex.y = tile.y;
		vertex.z = tile.z;
		vertex.startZ = tile.startZ;
		vertex.destZ = tile.destZ;

		geometry.vertices.push(vertex);

		colors[i] = new THREE.Color();
		colors[i].setRGB(tile.rgb[0] / 255, tile.rgb[1] / 255, tile.rgb[2] / 255);
	}

	geometry.colors = colors;

	let material = new THREE.PointsMaterial({
		size: TILE_WIDTH * 2.3,
		vertexColors: THREE.FaceColors
	});

	let particles = new THREE.Points(geometry, material);

	stage.targetHolder.add(particles);

	stage.geometry = particles.geometry;
	stage.material = material;
	stage.particles = particles;
	stage.vertices = particles.geometry.vertices;
}

const render = () => {
	stage.renderer.render(stage.scene, stage.camera);

	if (tick < duration) {
		let i = stage.vertices.length;

		while (i--) {
			let vertice = stage.vertices[i];

			vertice.z = easeOutQuad(tick, vertice.startZ, -vertice.startZ, duration);
			stage.geometry.verticesNeedUpdate = true;
		}

		tick++;
	} else {
		let i = stage.vertices.length;

		while (i--) {
			let vertice = stage.vertices[i];

			vertice.z = 0;
		}
	}

	rafId = window.requestAnimationFrame(render);
}

const reset = () => {
	stage.targetHolder.remove(stage.particles);

	stage.particles = null;

	tick = 0;

	if (stage.material) {
		stage.material.dispose();
	}

	cancelAnimationFrame(rafId);
}

const create = () => {
	loadImage().then((img) => {
		let tiles = getTiles(img);

		createScene(tiles, img);


		console.log('num tiles: ', tiles.length);

		render();
	});
}

create();

window.addEventListener('resize', () => {
	reset();
	create();
});

// http://stackoverflow.com/questions/29366109/three-js-three-projector-has-been-moved-to
document.addEventListener('mousedown', (e) => {
	let raycaster = new THREE.Raycaster(); // create once
	let mouse = new THREE.Vector2(); // create once

	mouse.x = ( event.clientX / stage.renderer.domElement.width ) * 2 - 1;
	mouse.y = - ( event.clientY / stage.renderer.domElement.height ) * 2 + 1;

	raycaster.setFromCamera( mouse, stage.camera );

	let intersects = raycaster.intersectObjects([stage.particles, stage.targetHolder], true );

	console.log(intersects)
});
