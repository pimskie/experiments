import * as Utils from 'https://rawgit.com/pimskie/utils/master/utils.js';

const ctx = document.querySelector('.js-canvas').getContext('2d');
const ctxGhost = document.querySelector('.js-canvas-ghost').getContext('2d');

const W = Utils.clamp(Math.min(window.innerWidth, window.innerHeight) - 100, 200, 800);
const H = W;


const MID_X = W * 0.5;
const MID_Y = H * 0.5;

const PIPI = Math.PI * 2;

ctx.canvas.width = W;
ctx.canvas.height = H;

ctxGhost.canvas.width = W;
ctxGhost.canvas.height = H;

const SPACING = 30;

const drawLine = (ctx, from, to, lineWidth = 0.25, color = '#000', percent = 1) => {
	const alpha = 0.1 + (0.9 * percent);

	ctx.lineWidth = lineWidth;
	ctx.strokeStyle = color;

	ctx.beginPath();
	ctx.moveTo(...from);
	ctx.lineTo(...to);
	ctx.closePath();
	ctx.stroke();

	ctx.fillStyle = `rgba(0, 0, 0, ${alpha})`;
	ctx.beginPath();
	ctx.arc(from[0] + 100, from[1], 2, 0, PIPI, false);
	ctx.arc(to[0] - 100, to[1], 2, 0, PIPI, false);
	ctx.closePath();
	ctx.fill();
};

const drawGrid = (percent = 1) => {
	const gradient = ctx.createLinearGradient(0, 0, ctx.canvas.width, 0);

	gradient.addColorStop(0.1, 'rgba(0, 0, 0, 0)');
	gradient.addColorStop(.5, 'rgba(0, 0, 0, 1)');
	gradient.addColorStop(0.9, 'rgba(0, 0, 0, 0)');

	const lineWidth = 0.25;
	const color = gradient;

	for (let y = -HH; y < HH; y += SPACING) {
		const from = [-W, y];
		const to = [WW, y];

		drawLine(ctx, from, to, lineWidth, color);
	}

	// for (let y = 0; y < H; y += SPACING) {
	// 	const from = [0, y];
	// 	const to = [W, y];

	// 	drawLine(ctx, from, to, lineWidth, color, percent);
	// }
};

let phase = PIPI;
const speed = 0.0002;
const numLayers = 4;

const loop = () => {
	ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

	for (let i = 0; i < numLayers; i++) {
		const percent = i / (numLayers - 1);

		ctx.save();

		ctx.translate(MID_X, MID_Y);
		ctx.rotate(Math.PI * percent);


		drawGrid(percent);

		ctx.restore();
	}

	// const endRotation = Math.sin(phase) * PIPI;

	// ctx.save();
	// ctx.translate(MID_X, MID_Y);

	// for (let i = 0; i < numLayers; i++) {
	// 	ctx.rotate(endRotation);
	// 	ctx.drawImage(ctxGhost.canvas, -MID_X, -MID_Y);
	// }

	// ctx.restore();

	// phase += speed;

	// requestAnimationFrame(loop);
};

loop();
