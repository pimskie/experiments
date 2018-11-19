import * as Utils from 'https://rawgit.com/pimskie/utils/master/utils.js';

const ctx = Utils.qs('canvas').getContext('2d');
const TAU = Math.PI * 2;

const W = 500;
const H = 500;

const MID_X = W * 0.5;
const MID_Y = H * 0.5;

const PIPI = Math.PI * 2;

ctx.canvas.width = W;
ctx.canvas.height = H;

class Shape {
	constructor(numPoints, radius) {

		this.points = new Array(numPoints).fill().map((_, i) => {
			const x = Math.cos(i * (PIPI / numPoints)) * radius;
			const y = Math.sin(i * (PIPI / numPoints)) * radius;

			return { x, y };
		});
	}
};

const clear = () => {
	ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
};

const draw = (shape, iteration = 0, scale = 1) => {
	const { points } = shape;

	const color = iteration % 2 === 0 ? '#000' : '#fff';
	const rotation = iteration * 40 * (Math.PI / 180);

	ctx.fillStyle = color;
	ctx.save();
	ctx.translate(MID_X, MID_Y);
	ctx.rotate(rotation);
	ctx.scale(scale, scale);

	ctx.beginPath();
	ctx.moveTo(points[0].x, points[0].y)

	for (let i = 1; i < points.length; i++) {
		ctx.lineTo(points[i].x, points[i].y)
	}

	ctx.fill();
	ctx.closePath();

	ctx.restore();
};

const NUM_EDGES = 6;
const NUM_SHAPES = 14;

let scaleDec = 0.13;

const loop = () => {
	clear();

	for (let i = 0; i < NUM_SHAPES; i++) {
		const scale = 1 - (i * scaleDec);

		scaleDec *= 0.946;

		draw(new Shape(NUM_EDGES, MID_X * scale), i);
	}
};

loop();
