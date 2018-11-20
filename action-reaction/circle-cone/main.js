const ctx = document.querySelector('.js-canvas').getContext('2d');
const ctxInverted = document.querySelector('.js-canvas-inverted').getContext('2d');

const PIPI = Math.PI * 2;

const W = 400;
const H = 400;
const MID_X = W * 0.5;
const MID_Y = H * 0.5;

ctx.canvas.width = W;
ctx.canvas.height = H;

ctxInverted.canvas.width = W;
ctxInverted.canvas.height = H;

const CIRCLE_CENTER_RADIUS = 50;
const NUM_STROKES = 60;

const drawStrokes = (ctx, strokeColor, backgroundColor, angleModifier) => {
	const FROM_R = MID_X - 5;
	const CENTER_RADIUS = 20;

	const WIDTH = 0.025;
	const ANGLE_DIFF = 1;

	ctx.fillStyle = backgroundColor;
	ctx.beginPath();
	ctx.rect(0, 0, ctx.canvas.width, ctx.canvas.height)
	ctx.fill();
	ctx.closePath();

	ctx.fillStyle = strokeColor;

	for (let i = 0; i < NUM_STROKES; i++) {
		ctx.beginPath();

		const topLeft = [
			MID_X + Math.cos(i * (PIPI / NUM_STROKES) - WIDTH) * FROM_R,
			MID_Y + Math.sin(i * (PIPI / NUM_STROKES) - WIDTH) * FROM_R,
		];

		const topRight = [
			MID_X + Math.cos(i * (PIPI / NUM_STROKES) + WIDTH) * FROM_R,
			MID_Y + Math.sin(i * (PIPI / NUM_STROKES) + WIDTH) * FROM_R,
		];

		const angleTo = i * (PIPI / NUM_STROKES) + ANGLE_DIFF;

		const to = [
			MID_X + Math.cos(angleTo) * CENTER_RADIUS,
			MID_Y + Math.sin(angleTo) * CENTER_RADIUS,
		];

		ctx.moveTo(...topLeft);
		ctx.lineTo(...topRight);
		ctx.lineTo(...to);

		ctx.fill();
		ctx.closePath();
	}

	ctx.fillStyle = backgroundColor;
	ctx.beginPath();
	ctx.arc(MID_X, MID_Y, CIRCLE_CENTER_RADIUS, 0, PIPI, false);
	ctx.fill();
	ctx.closePath();

};

/**
 * Drawing it twice, including the background and center circle
 * We could also draw only one, copy and invert it onto a other canvas
 * But to me it didn't look that sharp
 */
drawStrokes(ctx, '#000', '#fff', 1);
drawStrokes(ctxInverted, '#fff', '#000', -1);
