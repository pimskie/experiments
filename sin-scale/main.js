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

const NUM_SHAPES = 80;
const ANGLE_STEP = TAU / NUM_SHAPES;

let phase = 0;
let frame = 1;

const clear = () => {
	ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
};

const drawShape = (ctx, scaleX, scaleY, rotation) => {
	ctx.beginPath();
	ctx.lineWidth = 0.25;

	ctx.ellipse(0, 0, R * scaleX, R * scaleY, rotation, 0, TAU, false);
	ctx.stroke();

	ctx.closePath();
};

const loop = () => {
	clear();

	ctx.save();
	ctx.translate(MID_X, MID_Y);
	ctx.rotate(phase);

	const scaleSpeed = phase;
	const scaleX = Math.abs(Math.cos(scaleSpeed));
	const scaleY = Math.abs(Math.sin(scaleSpeed));

	for (let i = 0; i < NUM_SHAPES; i++) {
		const shapeScaleX = scaleX * (i / NUM_SHAPES);
		const shapeScaleY = scaleY * (i / NUM_SHAPES);

		drawShape(ctx, shapeScaleX, shapeScaleY, i * ANGLE_STEP);
	}

	ctx.restore();

	frame += 1;
	phase += 0.005;

	requestAnimationFrame(loop);
};

loop();
