import * as Utils from 'https://rawgit.com/pimskie/utils/master/utils.js';

const ctx = Utils.qs('canvas').getContext('2d');
const PIPI = Math.PI * 2;

const W = 500;
const H = 500;
const MID_X = W * 0.5;
const MID_Y = H * 0.5;

const CIRCLE_CENTER_RADIUS = 50;
const NUM_STROKES = 20;

ctx.canvas.width = W;
ctx.canvas.height = H;


const drawCenter = (ctx) => {
	ctx.save();
	ctx.translate(MID_X, MID_Y);

	ctx.beginPath();
	ctx.arc(0, 0, CIRCLE_CENTER_RADIUS, 0, PIPI, false);
	ctx.stroke();
	ctx.closePath();

	ctx.restore();
};

const drawStrokes = () => {
	const FROM_R = MID_X + 10;
	const SPREAD = 1;

	for (let i = 0; i < NUM_STROKES; i++) {
		ctx.beginPath();

		const angleFrom = i * (PIPI / NUM_STROKES);
		const angleTo = (i + 3) * (PIPI / NUM_STROKES);

		const from = [
			MID_X + Math.cos(angleFrom) * FROM_R,
			MID_Y + Math.sin(angleFrom) * FROM_R,
		];

		const to = [
			MID_X + Math.cos(angleTo) * CIRCLE_CENTER_RADIUS,
			MID_Y + Math.sin(angleTo) * CIRCLE_CENTER_RADIUS,
		];

		ctx.moveTo(...from);
		ctx.lineTo(...to);

		ctx.stroke();

		ctx.closePath();
	}

};

const clear = (ctx) => {
	ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
};

const loop = () => {
	clear(ctx);

	drawCenter(ctx);
	drawStrokes();

	// requestAnimationFrame(loop);
};

loop();
