import * as Utils from 'https://rawgit.com/pimskie/utils/master/utils.js';

const ctx = Utils.qs('.js-canvas').getContext('2d');
const ctxInverted = Utils.qs('.js-canvas-inverted').getContext('2d');

const PIPI = Math.PI * 2;

const W = 400;
const H = 400;
const MID_X = W * 0.5;
const MID_Y = H * 0.5;

ctx.canvas.width = W;
ctx.canvas.height = H;

ctxInverted.canvas.width = W;
ctxInverted.canvas.height = H;

const CIRCLE_CENTER_RADIUS = 25;
const NUM_STROKES = 100;

const drawStrokes = (ctx) => {
	const FROM_R = MID_X - 10;
	const SPREAD = 0.25;
	const ANGLE_DIFF = NUM_STROKES * 0.25;

	for (let i = 0; i < NUM_STROKES; i++) {
		ctx.beginPath();

		const topLeft = [
			MID_X + Math.cos((i - SPREAD) * (PIPI / NUM_STROKES)) * FROM_R,
			MID_Y + Math.sin((i - SPREAD) * (PIPI / NUM_STROKES)) * FROM_R,
		];

		const topRight = [
			MID_X + Math.cos((i + SPREAD) * (PIPI / NUM_STROKES)) * FROM_R,
			MID_Y + Math.sin((i + SPREAD) * (PIPI / NUM_STROKES)) * FROM_R,
		];

		const angleTo = (i + ANGLE_DIFF) * (PIPI / NUM_STROKES);

		const to = [
			MID_X + Math.cos(angleTo) * CIRCLE_CENTER_RADIUS,
			MID_Y + Math.sin(angleTo) * CIRCLE_CENTER_RADIUS,
		];

		ctx.moveTo(...topLeft);
		ctx.lineTo(...topRight);
		ctx.lineTo(...to);
		ctx.lineTo(...topLeft);

		ctx.fill();

		ctx.closePath();
	}

};

drawStrokes(ctx);

ctxInverted.beginPath();
ctxInverted.fillStyle = '#000';
ctxInverted.rect(0, 0, ctxInverted.canvas.width, ctxInverted.canvas.height);
ctxInverted.fill();
ctxInverted.closePath();

ctxInverted.globalCompositeOperation = 'xor';
ctxInverted.drawImage(ctx.canvas, 0, 0)
