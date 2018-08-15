// https://generateme.wordpress.com/2016/04/24/drawing-vector-field/

import * as Utils from './utils.js';

const ctx = Utils.qs('canvas').getContext('2d');
const TAU = Math.PI * 2;

const W = 500;
const H = 500;
const MID_X = W >> 1;
const MID_Y = H >> 1;


const PALETTES = [
	'https://coolors.co/app/05668d-028090-00a896-02c39a-f0f3bd',
	'https://coolors.co/264653-2a9d8f-e9c46a-f4a261-e76f51',
	'https://coolors.co/app/247ba0-70c1b3-b2dbbf-f3ffbd-ff1654',
	'https://coolors.co/app/9c89b8-f0a6ca-efc3e6-f0e6ef-b8bedd',
];

const NOISE_SCALE = 0.02;
const NUM_POINTS = 250;

let colors = [];
let points = [];
let time = 0;
let rafId = null;

ctx.canvas.width = W;
ctx.canvas.height = H;
ctx.globalAlpha = 0.1;

const getColors = () => Utils.randomArrayValue(PALETTES)
	.split('-')
	.splice(1)
	.map(hex => `#${hex}`);

const drawPoint = (ctx, point, color) => {
	ctx.beginPath();
	ctx.gloa
	ctx.fillStyle = color;
	ctx.arc(point.x, point.y, 0.66, 0, TAU, false);
	ctx.fill();
	ctx.closePath();
};

const clear = () => {
	ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
};

const ANGLE_SCALE = 0.005;

const draw = () => {
	points.forEach((point, index) => {
		const colorNoise = noise.simplex2(index * NOISE_SCALE, index * NOISE_SCALE);
		const colorNoiseValue = Math.round(Math.abs(colorNoise * 100));

		const colorIndex = (colorNoiseValue + colors.length) % colors.length;
		const color = colors[colorIndex];

		const angleNoise = noise.perlin2(point.x * ANGLE_SCALE, point.y * ANGLE_SCALE, time);
		const angle = TAU * angleNoise;
		const vector = new Vector(Math.cos(angle), Math.sin(angle));

		point.addSelf(vector);

		drawPoint(ctx, point, color);

		if (point.x > W || point.x < 0 || point.Y > H || point.y < 0) {
			point.x = Utils.randomGaussian() * W;
			point.y = Utils.randomGaussian() * H;
		}
	});

	time += 0.001;
};

const loop = () => {
	draw();

	rafId = requestAnimationFrame(loop);
};

const run = () => {
	clear();
	cancelAnimationFrame(rafId);

	noise.seed(Math.random());

	colors = getColors();

	points = new Array(NUM_POINTS).fill().map(() => {
		const x = Utils.randomGaussian() * W;
		const y = Utils.randomGaussian() * H;

		return new Vector(x, y);
	});

	loop();
};


ctx.canvas.addEventListener('click', run);
run();

