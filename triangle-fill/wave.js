import * as Utils from 'https://rawgit.com/pimskie/utils/master/utils.js';

noise.seed(Math.random());

const ctx = Utils.qs('canvas').getContext('2d');
const TAU = Math.PI * 2;

const W = 500;
const H = 500;
const MID_X = W * 0.5;
const MID_Y = H * 0.5;

const NOISE_SCALE = 0.01;
const GAP = 15;
const GAP_HALF = GAP >> 1;
const COLS = Math.ceil(W / GAP);
const ROWS = Math.ceil(H / GAP);

ctx.canvas.width = W;
ctx.canvas.height = H;

let time = 0;
let x = GAP_HALF;
let y = GAP_HALF;

const drawPoint = (point) => {
	const n = noise.perlin3(point.x * NOISE_SCALE, point.y * NOISE_SCALE, time) * 20;
	const c = Utils.map(n, -20, 20, 0, 255);

	const x = point.x + n;
	const y = point.y + n;

	ctx.fillStyle = `rgba(${c},${c}, ${c}, 1)`;
	ctx.beginPath();
	ctx.arc(x, y, GAP_HALF, 0, TAU, false);
	ctx.fill();
	ctx.closePath();
};

const points = new Array(COLS * ROWS + 1).fill().map((_, i) => {
	const point = { x, y };

	x += GAP;

	if (i > 0 && i % COLS === 0) {
		y += GAP;
		x = GAP_HALF;
	}

	return point;
});

const clear = () => {
	ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
};

const loop = () => {
	clear();

	points.forEach(drawPoint);

	time += 0.005;

	requestAnimationFrame(loop);
};

loop();
