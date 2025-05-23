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
	const color = iteration % 2 === 0 ? '#000' : '#fff';
	const rotation = (iteration + 1) * 40 * (Math.PI / 180);

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
const NUM_SHAPES = 30;

let scale = 1;
const points = new Array(NUM_EDGES).fill().map((_, i) => {
	const x = Math.cos(i * (PIPI / NUM_EDGES)) * MID_X;
	const y = Math.sin(i * (PIPI / NUM_EDGES)) * MID_X;

	return { x, y };
});

for (let i = 0; i < NUM_SHAPES; i++) {
	draw(points, i, scale);

	scale *= 0.88;
}
