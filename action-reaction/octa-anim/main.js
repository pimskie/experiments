import * as Utils from 'https://rawgit.com/pimskie/utils/master/utils.js';

const ctx = Utils.qs('canvas').getContext('2d');

const W = Utils.clamp(window.innerWidth - 150, 200, 500);
const H = W;

const MID_X = W * 0.5;
const MID_Y = H * 0.5;

const PIPI = Math.PI * 2;

ctx.canvas.width = W;
ctx.canvas.height = H;

const draw = (points, iteration = 0, scale = 1) => {
	const color = iteration % 2 === 0 ? '#000' : '#ff0000';
	const rotation = (iteration + 1) * 90 * (Math.PI / 180);

	ctx.fillStyle = color;

	ctx.save();
	ctx.translate(MID_X, MID_Y);
	ctx.scale(scale, scale);
	ctx.rotate(rotation);

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
const NUM_SHAPES = 100
let scale = 1;

const points = new Array(NUM_EDGES).fill().map((_, i) => {
	const x = Math.cos(i * (PIPI / NUM_EDGES)) * MID_X;
	const y = Math.sin(i * (PIPI / NUM_EDGES)) * MID_X;

	return { x, y };
});

const shapes = new Array(NUM_SHAPES).fill().map((_, i) => {
	const shape = {
		points,
		scale,
		scaleOrig: scale,
	};

	scale *= 0.86;

	return shape;
});

const clear = () => {
	ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
};

const loop = () => {
	clear();

	for (let i = 0; i < shapes.length; i++) {
		const shape = shapes[i];
		const { points, scale } = shape;

		draw(points, i, scale);

		shape.scale *= 1.004;

		if (shape.scale >= 2) {
			shape.scale = 0.01;
		}
	}

	shapes.sort((a, b) => {
		if (a.scale < b.scale) {
			return 1;
		}

		if (a.scale > b.scale) {
			return -1;
		}

		return 0;
	});

	requestAnimationFrame(loop);
};

loop();
