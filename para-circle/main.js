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

let phase = 0;

canvas.width = W;
canvas.height = H;

const drawCircle = (scale = 1, iteration) => {
	ctx.save();
	ctx.translate(W >> 1, H >> 1);
	ctx.scale(scale, scale);
	ctx.strokeStyle = 'rgba(50, 50, 50, 0.75)';

	for (let i = 0; i < NUM_LINES; i++) {
		const angle = LINE_ANGLE_STEP * i;
		const LINE_DEGREE_TO = LINE_ANGLE_STEP * 2 * (iteration * 0.2);
		const angleIteration = iteration * 0.05;

		ctx.beginPath();
		ctx.moveTo(Math.cos(angle - angleIteration) * R, Math.sin(angle) * R);
		ctx.lineTo(Math.cos(angle + angleIteration) * R2, Math.sin(angle - angleIteration) * R2);
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
	drawCircle(1, phase);

	phase++;

	requestAnimationFrame(loop);
};

loop();
