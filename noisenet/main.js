const simplex = new SimplexNoise();

const wrapArrayIndex = (index, array) => (index + 1 + array.length) % array.length;

const canvas = document.querySelector('.js-canvas');
const ctx = canvas.getContext('2d');

const PI = Math.PI;
const TAU = PI * 2;
let phase = 0;

const width = 500;
const height = 500;

canvas.width = width;
canvas.height = height;

const cols = 10;
const rows = cols;
const padding = 150;

const spaceX = (width - padding) / cols;
const spaceY = (height - padding) / rows;

const radius = 3;

const dots = new Array(cols * rows).fill().map((_, i) => {
	const col = i % cols;
	const row = (i - i % rows) / rows;

	const x = (padding / 2) + (spaceX * 0.5) + (col * spaceX);
	const y = (padding / 2) + (spaceY * 0.5) + (row * spaceY);

	const startX = x;
	const startY = y;

	return { i, col, row, x, y, startX, startY };
});

const connect = (from, to) => {
	ctx.beginPath();
	ctx.moveTo(from.x, from.y);
	ctx.lineTo(to.x, to.y);
	ctx.stroke();
	ctx.closePath();
};

const draw = (dot) => {
	const { x, y, i, col, row } = dot;

	if (col + 1 < cols) {
		connect(dot, dots[i + 1]);
	}

	if (row + 1 < rows) {
		connect(dot, dots[i + rows]);
	}
};

const phaseSpeed = 0.004;
const scale = 0.005;
const amplitude = 20;

const loop = () => {
	ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

	dots.forEach((dot, index) => {
		const noise = simplex.noise3D(dot.x * scale, dot.y * scale, phase) * 0.25;
		const angle = noise * TAU;

		dot.x = dot.startX + (Math.cos(angle) * amplitude);
		dot.y = dot.startY + (Math.sin(angle) * amplitude);

		draw(dot);
	});

	phase += phaseSpeed;

	requestAnimationFrame(loop);
};

loop();
