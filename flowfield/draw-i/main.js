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

	// red, yellow,blue pale
	'https://coolors.co/app/247ba0-70c1b3-b2dbbf-f3ffbd-ff1654',
	// 'https://coolors.co/app/9c89b8-f0a6ca-efc3e6-f0e6ef-b8bedd',

	// space
	'https://coolors.co/app/f2d7ee-d3bcc0-a5668b-69306d-0e103d',

	// bright
	'https://coolors.co/app/6699cc-fff275-ff8c42-ff3c38-a23e48',
];

const NOISE_SCALE = 0.005;
const ANGLE_SCALE = 0.01;
const NUM_POINTS = 250;

let colors = [];
let points = [];
let time = 0;
let rafId = null;

ctx.canvas.width = W;
ctx.canvas.height = H;

const getColors = () => Utils.randomArrayValue(PALETTES)
	.split('-')
	.splice(1)
	.map(hex => `#${hex}`);

// const getColors = () => ['red', 'pink', 'yellow', 'blue', 'green'];

const drawPoint = (ctx, point, color) => {
	ctx.beginPath();
	ctx.gloa
	ctx.fillStyle = color;
	ctx.arc(point.x, point.y, 0.66, 0, TAU, false);
	ctx.fill();
	ctx.closePath();
};

const applyLove = (point1, points, vel) => {

};

const clear = () => {
	ctx.fillStyle = '#000';
	ctx.globalAlpha = 1;
	ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
};

const draw = () => {
	points.forEach((point, index) => {
		const { pos, color } = point;

		// const noiseValue = noise.perlin2(pos.x * ANGLE_SCALE, pos.y * ANGLE_SCALE, time);
		// const angle = TAU * noiseValue;
		// const acc = new Vector(Math.cos(angle), Math.sin(angle));

		// http://www.wolframalpha.com/widgets/view.jsp?id=4e37f43fcbe8be03c20f977f32e20d15
		const noiseValue = noise.perlin2(pos.x * ANGLE_SCALE, pos.y * ANGLE_SCALE) * 6;

		const cosNoise = Math.cos(noiseValue);
		const sinNoise = Math.sin(noiseValue);

		// cycloid of Ceva
		// const xt = Math.cos(noiseValue) * (2 * Math.cos(2 * noiseValue) + 1);
		// const yt = Math.sin(noiseValue) * (2 * Math.cos(2 * noiseValue) + 1);

		// Kampyle of Eudoxus
		const sec = 1 / Math.sin(noiseValue);
		const xt = sec;
		const yt = Math.tan(noiseValue) * sec;

		const acc = new Vector(xt, yt);
		pos.addSelf(acc);

		drawPoint(ctx, pos, color);

		if (pos.x > W || pos.x < 0 || pos.Y > H || pos.y < 0) {
			pos.x = Utils.randomGaussian() * W;
			pos.y = Utils.randomGaussian() * H;
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
	// noise.seed(1337);

	colors = getColors();
	ctx.globalAlpha = 0.1;

	points = [];

	const zeroVector = new Vector();
	const SPACING = 10;
	const hypo = Utils.distanceBetween(zeroVector, new Vector(W, H));

	for (let x = 0; x < W; x += SPACING) {
		for (let y = 0; y < H; y += SPACING) {
			const pos = new Vector(
				x + (Utils.randomGaussian(1) * 10),
				y + (Utils.randomGaussian(1) * 10),
			);

			const dist = Utils.distanceBetween(new Vector(), pos);
			const colorIndex = Math.round(colors.length * (dist / hypo));
			const color = colors[colorIndex];

			// const noiseValue = noise.perlin2(x * 0.01, y * 0.01) * 5;
			// const colorIndex = Math.floor(Utils.map(noiseValue, -100, 100, 0, colors.length + 3));
			// const color = colors[colorIndex];

			const mass = Utils.randomBetween(1, 2);

			points.push({
				pos,
				mass,
				color,
				colorIndex,
			});
		}
	}

	loop();
};


ctx.canvas.addEventListener('click', run);
run();

