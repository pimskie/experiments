const q = sel => document.querySelector(sel);

const ctx = q('canvas').getContext('2d');
const TAU = Math.PI * 2;

const W = 500;
const H = 500;
const MID_X = W * 0.5;
const MID_Y = H * 0.5;

const GAP = 30;
const GAP_HALF = GAP * 0.5;
const SHIFT_SIZE = GAP * 0.25;

const IMG_URL = './ik.jpg';

ctx.canvas.width = W;
ctx.canvas.height = H;

const drawPoint = (ctx, pos, color = '#000') => {
	ctx.beginPath();
	ctx.fillStyle = color;
	ctx.arc(pos.x, pos.y, 2, 0, TAU, false);
	ctx.fill();
	ctx.closePath();
}

const drawTriangle = (ctx, p1, p2, p3, fill = 'red') => {
	ctx.beginPath();
	ctx.fillStyle = fill;
	ctx.moveTo(p1.x, p1.y);
	ctx.lineTo(p2.x, p2.y);
	ctx.lineTo(p3.x, p3.y);
	ctx.lineTo(p1.x, p1.y);

	ctx.stroke();
	ctx.fill();
	ctx.closePath();

};

const points = [];
const lines = [];

// same concept, half the code:
// https://codepen.io/timseverien/pen/ajeJdE?editors=0010
const cols = Math.ceil(W / GAP);
const rows = cols;

let shift = -1;
let x = GAP_HALF;
let y = GAP_HALF;

for (let row = 0; row < rows; row++) {
	const line = [];
	x = GAP_HALF;

	for (let col = 0; col < cols; col++) {
		const point = { x: x + (SHIFT_SIZE * shift), y };

		line.push(point);
		drawPoint(ctx, point);

		x += GAP;
	}

	lines.push(line);
	 y += GAP;
	 shift *= -1;
}

let isEven = true;

for (let i = 0; i < lines.length - 1; i += 1) {
	const pointsOnLine = lines[i];
	const pointsOnNextLine = lines[i + 1];

	for (let q = 0; q < pointsOnLine.length - 1; q++) {
		// down
		const p1 = pointsOnLine[q];
		const p2 = pointsOnLine[q + 1];
		const p3 = pointsOnNextLine[q + (isEven ? 0 : 1)];

		drawTriangle(ctx, p1, p2, p3)

		// up
		const p4 = pointsOnNextLine[q];
		const p5 = pointsOnNextLine[q + 1];
		const p6 = pointsOnLine[q + (isEven ? 1 : 0)];

		drawTriangle(ctx, p4, p5, p6, 'green')
	}

	isEven = !isEven;
}

const clear = () => {
	ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
};

const loop = () => {
	clear();

	requestAnimationFrame(loop);
};

// loop();
