import * as Utils from 'https://rawgit.com/pimskie/utils/master/utils.js';

const ctx = document.querySelector('.js-canvas').getContext('2d');

const W = Utils.clamp(Math.min(window.innerWidth, window.innerHeight) - 100, 200, 800);
const H = W;

const WW = W * 4;
const HH = H * 4;

const MID_X = W * 0.5;
const MID_Y = H * 0.5;

ctx.canvas.width = W;
ctx.canvas.height = H;

const SPACING = 20;

const drawLine = (ctx, from, to, lineWidth = 0.25, color = '#000') => {
	ctx.lineWidth = lineWidth;
	ctx.strokeStyle = color;

	ctx.beginPath();
	ctx.moveTo(...from);
	ctx.lineTo(...to);
	ctx.closePath();
	ctx.stroke();
};

const drawGrid = (percent = 1) => {
	const lightness = (1 - percent) * 100;
	const alpha = 1 - percent;
	const lineWidth = 0.5;

	const color = `hsla(0, 0%, ${lightness}%, ${alpha})`;

	for (let y = -HH; y < HH; y += SPACING) {
		const from = [-W, y];
		const to = [WW, y];

		drawLine(ctx, from, to, lineWidth, color);
	}
};


const ITERATIONS = 10;

for (let i = 0; i < ITERATIONS; i++) {
	const rotation = Math.PI * (i / ITERATIONS);

	ctx.save();
	ctx.translate(MID_X, MID_Y);
	ctx.rotate(rotation);

	drawGrid(i / ITERATIONS);

	ctx.restore();
}
