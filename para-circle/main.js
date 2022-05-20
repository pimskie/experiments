const ctx = document.querySelector('canvas').getContext('2d');
const { canvas } = ctx;

const TAU = Math.PI * 2;
const W = 500;
const H = W;
const R = W >> 1;
const R2 = R * 0.25;

const NUM_LINES = 100;
const LINE_ANGLE_STEP = TAU / NUM_LINES;
const LINE_WIDTH_ANGLE = 0.02;

let phase = 3;

canvas.width = W;
canvas.height = H;

const drawCircle = (scale = 1, shift, iteration) => {
	ctx.save();
	ctx.translate(W >> 1, H >> 1);
	ctx.rotate(iteration * 0.2)
	ctx.scale(scale, scale);

	ctx.fillStyle = 'rgba(255, 255, 255, 1)';
	ctx.beginPath();
	ctx.arc(0, 0, R, 0, TAU);
	ctx.closePath();
	ctx.fill();

	ctx.strokeStyle = 'rgba(50, 50, 50, 0.75)';
	ctx.fillStyle = 'rgba(0, 0, 0, 1)';

	for (let i = 0; i < NUM_LINES; i++) {
		const angle = LINE_ANGLE_STEP * i;
		const angleIteration = shift;

		ctx.beginPath();
		ctx.moveTo(Math.cos(angle) * R, Math.sin(angle) * R);
		ctx.lineTo(Math.cos(angle + angleIteration) * R2, Math.sin(angle + angleIteration) * R2);
		ctx.lineTo(Math.cos(angle + LINE_WIDTH_ANGLE) * R, Math.sin(angle + LINE_WIDTH_ANGLE) * R);

		ctx.closePath();
		ctx.stroke();
		ctx.fill();
	}

	ctx.restore();
};

const clear = () => {
	ctx.clearRect(0, 0, W, H);
};

const loop = () => {
	clear();

	const numCircles = 10;
	const shift = 0.9;

	for (let i = 0; i < numCircles; i++) {
		const scale = 1 - (i * (1 / numCircles));

		drawCircle(scale, shift * Math.pow(-1, i), phase * Math.pow(-1, i));
	}

	phase++;

	requestAnimationFrame(loop);
};

loop();
