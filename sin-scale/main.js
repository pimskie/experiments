import * as Utils from 'https://rawgit.com/pimskie/utils/master/utils.js';

const ctx = document.querySelector('canvas').getContext('2d');

const PI = Math.PI;
const TAU = PI * 2;

const W = 500;
const H = 500;
const MID_X = W * 0.5;
const MID_Y = H * 0.5;
const R = MID_X;

ctx.canvas.width = W;
ctx.canvas.height = H;

const NUM_SHAPES = 30;
const ANGLE_STEP = TAU / NUM_SHAPES;

const shapes = new Array(NUM_SHAPES).fill().map((_, i) => {
	const scaleX = i / NUM_SHAPES;
	const scaleY = 1;
	const rotation = i * ANGLE_STEP;
	const top = {};
	const bottom = {};

	return { scaleX, scaleY, top, bottom, rotation};
});

let phase = 0;

const clear = () => {
	ctx.fillStyle = 'rgba(255, 255, 255, 1)';

	ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
};

const drawCircle = (ctx, x, y, r = 2) => {
	ctx.beginPath();
	ctx.arc(x, y, r, 0, TAU, false);
	ctx.fill();
	ctx.closePath();
}

const drawLine = (ctx, from, to, alpha = 1) => {
	ctx.lineWidth = 0.25;
	ctx.strokeStyle = `rgba(0, 0, 0, ${alpha})`;
	ctx.beginPath();
	ctx.moveTo(from.x, from.y);
	ctx.lineTo(to.x, to.y);
	ctx.stroke();
	ctx.closePath();
};

const drawShape = (ctx, shape, alpha) => {
	const { rotation } = shape;

	ctx.beginPath();
	ctx.lineWidth = 0.5;
	ctx.fillStyle = `rgba(0, 0, 0, 0.05)`;
	ctx.strokeStyle = `rgba(0, 0, 0, ${alpha})`;
	ctx.ellipse(0, 0, R, R, 0, 0, TAU, false);
	ctx.stroke();
	// ctx.fill();
	ctx.closePath();

	const numLines = 2;
	const lineAngleStep = PI / numLines;

	for (let i = 0; i < numLines; i++) {
		const from = {
			x: Math.cos(rotation + (i * lineAngleStep)) * R,
			y: Math.sin(rotation + (i * lineAngleStep)) * R,
		};

		const to = {
			x: Math.cos(rotation + PI + (i * lineAngleStep)) * R,
			y: Math.sin(rotation + PI + (i * lineAngleStep)) * R,
		};

		// drawLine(ctx, from, to);
	}

	const numPoints = 4;
	const pointAngleStep = TAU / numPoints;

	for (let i = 0; i < numPoints; i++) {
		const x = Math.cos(rotation + (i * pointAngleStep)) * R;
		const y = Math.sin(rotation + (i * pointAngleStep)) * R;

		drawCircle(ctx, x, y, 1);
	}
};

const loop = () => {
	clear();

	const scaleSpeed = phase;

	const scaleX = Math.cos(scaleSpeed);
	const scaleY = Math.sin(scaleSpeed);

	shapes.forEach((shape, i) => {
		let shapeScaleX =  Math.cos(scaleSpeed + (i * 0.01)); //  * (i / NUM_SHAPES);
		let shapeScaleY =  Math.sin(scaleSpeed + (i * 0.01)); //  * (i / NUM_SHAPES);

		// shapeScaleX *= atan;
		// shapeScaleY *= atan;

		const shapeAlpha = 1;

		ctx.save();
		ctx.translate(MID_X, MID_Y);
		// ctx.rotate(shape.rotation + phase);
		ctx.scale(shapeScaleX, shapeScaleY);

		drawShape(ctx, shape, shapeAlpha);

		ctx.restore();
	});


	phase += 0.005;

	requestAnimationFrame(loop);
};

loop();
