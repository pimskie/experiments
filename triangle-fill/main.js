import * as Utils from 'https://rawgit.com/pimskie/utils/master/utils.js';

noise.seed(Math.random());

const ctx = Utils.qs('canvas').getContext('2d');
const TAU = Math.PI * 2;

const W = 500;
const H = 500;
const NOISE_SCALE = 0.01;

let gap;
let shiftSize;

let imageData = null;
let lines = [];
let time = 0;

const IMG_URL = './ik.jpg';

ctx.canvas.width = W;
ctx.canvas.height = H;

const drawPoint = (ctx, point) => {
	ctx.beginPath();

	ctx.arc(point.x, point.y, 5, 0, TAU, false);
	ctx.fill();
	ctx.closePath();
};

const drawTriangle = (ctx, p1, p2, p3, rgba) => {
	ctx.beginPath();
	ctx.fillStyle = `rgba(${rgba})`;
	// ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';/

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

const createTriangles = (imageData) => {
	lines = [];

	// same concept, half the code:
	// https://codepen.io/timseverien/pen/ajeJdE?editors=0010
	const cols = Math.ceil(W / gap) + 1;
	const rows = cols;

	let shift = -1;
	let x = 0;
	let y = 0;

	for (let row = 0; row < rows; row++) {
		const line = [];

		x = 0;

		for (let col = 0; col < cols; col++) {
			const pixelIndex = Utils.pixelIndex(x + (shiftSize * shift), y, imageData);

			const r = imageData.data[pixelIndex];
			const g = imageData.data[pixelIndex + 1];
			const b = imageData.data[pixelIndex + 2];
			const a = 1; // imageData.data[pixelIndex + 3] / 255;

			const rgba = `${[r, g, b, a].join(',')}`;
			const posX = x + (shiftSize * shift);
			const posY = y;


			line.push({
				posOrig: { x: posX, y: posY },
				pos: { x: posX, y: posY },
				rgba,
			});

			x += gap;
		}

		lines.push(line);
		y += gap;
		shift *= -1;
	}
};

const deformTriangles = () => {
	lines.forEach((line, index) => {
		line.forEach((point, index2) => {
			const n = noise.perlin3(point.posOrig.x * NOISE_SCALE, point.posOrig.y * NOISE_SCALE, time) * 30;

			point.pos.x = point.posOrig.x + n;
			point.pos.y = point.posOrig.y + n;
		});
	});
};

const drawTriangles = (ctx) => {
	let isEven = true;

	for (let i = 0; i < lines.length - 1; i += 1) {
		const pointsOnLine = lines[i];
		const pointsOnNextLine = lines[i + 1];

		for (let q = 0; q < pointsOnLine.length - 1; q++) {
			// down
			const p1 = pointsOnLine[q].pos;
			const p2 = pointsOnLine[q + 1].pos;
			const p3 = pointsOnNextLine[q + (isEven ? 0 : 1)].pos;

			drawTriangle(ctx, p1, p2, p3, pointsOnLine[q].rgba);

			// up
			const p4 = pointsOnNextLine[q].pos;
			const p5 = pointsOnNextLine[q + 1].pos;
			const p6 = pointsOnLine[q + (isEven ? 1 : 0)].pos;

			drawTriangle(ctx, p4, p5, p6, pointsOnNextLine.rgba);
		}

		isEven = !isEven;
	}
};

const loop = () => {
	ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

	deformTriangles();
	drawTriangles(ctx);

	time += 0.005;

	requestAnimationFrame(loop);
};

const generate = (img) => {
	gap = 10;
	shiftSize = gap * 0.25;

	imageData = getImageData(ctx, img);

	createTriangles(imageData);

	loop();
};

const img = new Image();
img.crossOrigin = 'Anonymous';

img.addEventListener('load', (e) => generate(e.target));
img.src = IMG_URL;
