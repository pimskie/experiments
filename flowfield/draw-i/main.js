// https://generateme.wordpress.com/2016/04/24/drawing-vector-field/

import * as Utils from './utils.js';

const ctx = Utils.qs('canvas').getContext('2d');
const TAU = Math.PI * 2;

const W = 500;
const H = 500;
const MID_X = W >> 1;
const MID_Y = H >> 1;
const HYPO = Math.hypot(W, H);

const PALETTES = [
	'https://coolors.co/app/05668d-028090-00a896-02c39a-f0f3bd', // sea weed
	'https://coolors.co/264653-2a9d8f-e9c46a-f4a261-e76f51', // flame
	'https://coolors.co/app/247ba0-70c1b3-b2dbbf-f3ffbd-ff1654', // red, yellow,blue pale
	'https://coolors.co/app/f2d7ee-d3bcc0-a5668b-69306d-0e103d', // space
	'https://coolors.co/app/6699cc-fff275-ff8c42-ff3c38-a23e48', // bright
];

const options = {
	noiseScale: 0.09,
	noiseMultiplier: 5,
	noiseFunction: 'perlin3',
	formula1: 'none',
	formula2: 'none',
	timeUpdate: 0.1,
};

const hexToRgb = (hex) => {
	const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);

	return result ? [
		parseInt(result[1], 16),
		parseInt(result[2], 16),
		parseInt(result[3], 16)
	] : null;
}
// http://www.wolframalpha.com/widgets/view.jsp?id=4e37f43fcbe8be03c20f977f32e20d15
const formulas = {
	none: () => new Vector(0, 0),

	astroid: (x, y) => {
		const xt = Math.pow(Math.cos(x), 3);
		const yt = Math.pow(Math.sin(y), 3);

		return new Vector(xt, yt);
	},

	maltese: (x, y) => {
		const xt = 2 * Math.cos(x) / Math.sqrt(Math.sin(4 * x));
		const yt = 2 * Math.sin(y) / Math.sqrt(Math.sin(4 * y));

		return new Vector(xt, yt);
	},

	// cycloid of Ceva
	cycloid: (x, y) => {
		const xt = Math.cos(x) * (2 * Math.cos(2 * x) + 1);
		const yt = Math.sin(y) * (2 * Math.cos(2 * y) + 1);

		return new Vector(xt, yt);
	},

	tschirnhausen: (x, y) => {
		const xt = 1 - (3 * Math.pow(x, 2));
		const yt = 3 - Math.pow(y, 2);

		return new Vector(xt, yt);
	},
};

let imagedata = null;
let colors = [];
let points = [];
let time = 0;
let rafId = null;

ctx.canvas.width = W;
ctx.canvas.height = H;

const getColors = () => Utils.randomArrayValue(PALETTES)
	.split('-')
	.splice(1)
	.map(hex => hexToRgb(`#${hex}`));

const getPointColor = (pos) => {
	const dist = Utils.distanceBetween(new Vector(), pos);
	const colorIndex = Math.round((colors.length - 1) * (dist / HYPO));
	const rgb = colors[colorIndex];

	return rgb;
};

const drawPoint = (ctx, point, rgb) => {
	ctx.beginPath();
	ctx.fillStyle = `rgb(${rgb.join(', ')})`;
	ctx.arc(point.x, point.y, 0.66, 0, TAU, false);
	ctx.fill();
	ctx.closePath();
};

const clear = () => {
	ctx.fillStyle = '#000';
	ctx.globalAlpha = 1;
	ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
};

const draw = () => {
	let { noiseScale, noiseMultiplier, timeUpdate, noiseFunction, formula1, formula2 } = options;
	const hasFormula1 = formula1 !== 'none';
	const hasFormula2 = formula2 !== 'none';
	const hasFormula = hasFormula1 || hasFormula2;

	noiseScale *= 0.1;

	points.forEach((point) => {
		const { pos, rgb } = point;

		const noiseValue = noise[noiseFunction](pos.x * noiseScale, pos.y * noiseScale, time) * noiseMultiplier;
		let acc = new Vector();

		if (hasFormula) {
			const formulaVector1 = formulas[formula1](noiseValue, noiseValue);
			const formulaVector2 = formulas[formula2](noiseValue, noiseValue);

			const formulaNoise1 = noise.perlin2(formulaVector1.x, formulaVector1.y);
			const formulaNoise2 = noise.perlin2(formulaVector2.x, formulaVector2.y);

			acc.addSelf(new Vector(
				Math.cos(TAU * formulaNoise1),
				Math.sin(TAU * formulaNoise1))
			);

			acc.addSelf(new Vector(
				Math.cos(TAU * formulaNoise2),
				Math.sin(TAU * formulaNoise2))
			);

		} else {
			const angle = TAU * noiseValue;

			acc = new Vector(Math.cos(angle), Math.sin(angle));
		}

		pos.addSelf(acc);

		drawPoint(ctx, pos, rgb);

		if (pos.x > W || pos.x < 0 || pos.Y > H || pos.y < 0) {
			pos.x = Math.random() * W;
			pos.y = Math.random() * H;

			point.rgb = getPointColor(pos);

		}
	});

	time += timeUpdate * 0.01;
};

const loop = () => {
	draw();

	rafId = requestAnimationFrame(loop);
};

const run = () => {
	clear();
	cancelAnimationFrame(rafId);

	noise.seed(Math.random());

	imagedata = ctx.getImageData(0, 0, W, H);

	colors = getColors();
	ctx.globalAlpha = 0.1;

	points = [];

	const spacing = W / 50;

	for (let x = 0; x < W; x += spacing) {
		for (let y = 0; y < H; y += spacing) {
			const pos = new Vector(
				x + (Utils.randomGaussian(1) * 10),
				y + (Utils.randomGaussian(1) * 10),
			);

			const rgb = getPointColor(pos);

			points.push({ pos, rgb });
		}
	}

	loop();
};

const gui = new dat.GUI();

gui.add(options, 'noiseScale').step(0.01).min(0.01).max(0.5).onFinishChange(run);
gui.add(options, 'noiseMultiplier', [1, 5, 10, 30, 50, 100, 300]).onFinishChange(run);
gui.add(options, 'noiseFunction', [
	'perlin2',
	'perlin3',
	'simplex2',
	'simplex3',
]).onFinishChange(run);
const c = gui.add(options, 'timeUpdate').min(0.1).max(1).step(0.1).onFinishChange(run);
gui.add(options, 'formula1', ['none', ...Object.keys(formulas)]).onFinishChange(run);
gui.add(options, 'formula2', ['none', ...Object.keys(formulas)]).onFinishChange(run);

c.disabled = true;

ctx.canvas.addEventListener('click', run);
run();

