import * as Utils from 'https://rawgit.com/pimskie/utils/master/utils.js';

const ctx = Utils.qs('canvas').getContext('2d');
const TAU = Math.PI * 2;

const W = 500;
const H = 500;

let gap;
let gapHalf;
let shiftSize;

let imageData = null;

const IMG_URL = './ik.jpg';

ctx.canvas.width = W;
ctx.canvas.height = H;

const drawTriangle = (ctx, imageData, p1, p2, p3) => {
	const centerX = (p1.x + p2.x + p3.x) / 3;
	const centerY = (p1.y + p2.y + p3.y) / 3;
	const pixelIndex = Utils.pixelIndex(centerX, centerY, imageData);

	const r = imageData.data[pixelIndex];
	const g = imageData.data[pixelIndex + 1];
	const b = imageData.data[pixelIndex + 2];
	const a = imageData.data[pixelIndex + 3];

	const rgba = `${[r, g, b, a].join(', ')}`;

	ctx.beginPath();
	ctx.fillStyle = `rgba(${rgba})`;

	ctx.moveTo(p1.x, p1.y);
	ctx.lineTo(p2.x, p2.y);
	ctx.lineTo(p3.x, p3.y);
	ctx.lineTo(p1.x, p1.y);

	// ctx.stroke();
	ctx.fill();
	ctx.closePath();
};

const getImageData = (ctx, image) => {
	ctx.drawImage(image, 0, 0);

	const imageData = ctx.getImageData(0, 0, image.width, image.height);

	ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

	return imageData;
}

const createTriangles = (ctx, imageData) => {
	ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

	const lines = [];

	// same concept, half the code:
	// https://codepen.io/timseverien/pen/ajeJdE?editors=0010
	const cols = Math.ceil(W / gap);
	const rows = cols;

	let shift = -1;
	let x = gapHalf;
	let y = gapHalf;

	for (let row = 0; row < rows; row++) {
		const line = [];

		x = gapHalf;

		for (let col = 0; col < cols; col++) {
			const point = { x: x + (shiftSize * shift), y };

			line.push(point);

			x += gap;
		}

		lines.push(line);
		y += gap;
		shift *= -1;
	}

	let isEven = true;

	for (let i = 0; i < lines.length - 1; i += 1) {
		const pointsOnLine = lines[i];
		const pointsOnNextLine = lines[i + 1];

		for (let q = 0; q < pointsOnLine.length - 1; q++) {
			// down
			const p1 = pointsOnLine[q];
			const p2 = pointsOnLine[q + 1];
			const p3 = pointsOnNextLine[q + (isEven ? 0 : 1)];

			drawTriangle(ctx, imageData, p1, p2, p3)

			// up
			const p4 = pointsOnNextLine[q];
			const p5 = pointsOnNextLine[q + 1];
			const p6 = pointsOnLine[q + (isEven ? 1 : 0)];

			drawTriangle(ctx, imageData, p4, p5, p6, 'green')
		}

		isEven = !isEven;
	}
};

const loop = () => {
	createTriangles(ctx, imageData);

	if (gap > 15) {
		gap--;

		gapHalf = gap * 0.5;
		shiftSize = gap * 0.25;

		requestAnimationFrame(loop);
	}
};

const run = (image) => {
	gap = 200;

	imageData = getImageData(ctx, image);

	loop();
};

const img = new Image();
img.crossOrigin = 'Anonymous';

img.addEventListener('load', (e) => run(e.target));

img.src = IMG_URL;
