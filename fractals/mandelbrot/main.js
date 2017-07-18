/**
 * http://www.wikihow.com/Plot-the-Mandelbrot-Set-By-Hand
 * http://www.tonkoppens.nl/Tutorial01/test.html
 * http://rembound.com/articles/drawing-mandelbrot-fractals-with-html5-canvas-and-javascript
 * - color and zoom
 *
 * http://slicker.me/fractals/fractals.htm
 * - zoom
 *
 * http://jonisalonen.com/2013/lets-draw-the-mandelbrot-set/
 * Map center of image to (0, 0) (denoted as `c`)
 * Mandelbrot set lies within a circle of radius 2
 * Entire width of the image should have length 4
 * "When the absolute value of z, for a given point, is greater than or equal to 2,
 * that point (and its corresponding square) is said to have escaped the Mandelbrot set."
 *
 * http://selimtezel.com/CompSci/javaScript/MandelbrotZoom/js/MandelbrotZoom.js
 */

/* globals Stats: false, */

const qs = (sel) => document.querySelector(sel);

const stats = new Stats();
stats.showPanel(0);
qs('.js-stats').appendChild(stats.domElement);

const canvas = qs('.js-canvas');
const ctx = canvas.getContext('2d');

const canvasWidth = 500;
const canvasHeight = canvasWidth;

const radius = 4;
let depth = 1;
let maxIterations = 30;
let planeCoords = {};

let zoomOut = false;
let scaleFactor = 4;
let scale = canvasWidth / radius;

let centerX = 0;
let centerY = 0;

canvas.width = canvasWidth;
canvas.height = canvasHeight;

const imageData = ctx.createImageData(canvasWidth, canvasHeight);

const pixelIndex = (x, y, imageData) => (x + y * imageData.width) * 4;

const paintPixel = (x, y, r) => {
	const index = pixelIndex(x, y, imageData);
	const data = imageData.data;
	data[index] = r;
	data[index + 1] = 0;
	data[index + 2] = 0;
	data[index + 3] = 255;
};

const getPlaneCoods = () => {
	let coords = [];

	for (let y = 0; y < canvasHeight; y++) {
		coords[y] = [];

		for (let x = 0; x < canvasWidth; x++) {

			// map the canvas coordinates back to the (-2, -2) - (2, 2) coordinates
			// they reflect the `c` part of the formula
			const { planeX, planeY } = pixelsToPlane(x, y);

			coords[y][x] = [planeX, planeY, 1];
		}
	}

	return coords;
};


// convert pixel coords to coords on the complex (2, 2) plane
const pixelsToPlane = (x, y) => {
	return {
		planeX: centerX + (x - canvasWidth / 2) / scale,
		planeY: centerY + (-y + canvasHeight / 2) / scale,
	};
};

const draw = () => {
	// clear();

	for (let y = 0; y < canvasHeight; y++) {
		for (let x = 0; x < canvasWidth; x++) {

			// TODO: add reference to pen
			let [planeX, planeY, iteration] = planeCoords[y][x];

			let length = planeX * planeX + planeY * planeY;
			let zX = 0;
			let zY = 0;

			while (length <= radius && iteration < maxIterations) {
				const z1x = zX * zX - zY * zY + planeX;
				const z1y = 2 * zX * zY + planeY;

				zX = z1x;
				zY = z1y;

				length = zX * zX + zY * zY;
				iteration++;
			}

			let r = (iteration < maxIterations) ? 0 : 150;

			paintPixel(x, y, r);
		}

	}

	maxIterations++;

	ctx.putImageData(imageData, 0, 0);
};

const loop = () => {
	stats.begin();

	draw();

	stats.end();
	requestAnimationFrame(loop);
};


canvas.addEventListener('click', (e) => {
	const [x, y] = [e.clientX, e.clientY];
	const { planeX, planeY } = pixelsToPlane(x, y);

	centerX = planeX;
	centerY = planeY;

	if (zoomOut) {
		if (depth - 1 > 0) {
			scale /= scaleFactor;
			depth--;
		}
	} else {
		scale *= scaleFactor;
		depth++;
	}

	planeCoords = getPlaneCoods();

	maxIterations = 1;
});

document.body.addEventListener('keydown', (e) => {
	zoomOut = e.key === 'Control';

	document.body.classList.toggle('zoom-out', zoomOut);
});

document.body.addEventListener('keyup', (e) => {
	if (e.key === 'Control') {
		zoomOut = false;
		document.body.classList.remove('zoom-out');
	}
});

planeCoords = getPlaneCoods();
loop();
