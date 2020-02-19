const simplex = new SimplexNoise();

const distanceBetween = (vec1, vec2) => Math.hypot(vec2.x - vec1.x, vec2.y - vec1.y);
const map = (value, start1, stop1, start2, stop2) => ((value - start1) / (stop1 - start1)) * (stop2 - start2) + start2;

const canvas = document.querySelector('.js-canvas');
const ctx = canvas.getContext('2d');

const PI = Math.PI;
const TAU = PI * 2;
let phase = 0;

const width = 500;
const height = 500;

canvas.width = width;
canvas.height = height;

const cols = 25;
const rows = cols;
const padding = 50;

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

const connect = (tl, tr, br, bl) => {
	const { angle } = tl;
	const percent = map(tl.noise, 0, 1, 0, 1) + 0.5;
	const hue = 360 * percent;
	const fill = `hsla(0, 100%, ${percent * 100}%, 1)`;

	ctx.fillStyle = fill;
	ctx.strokeStyle = fill;
	ctx.beginPath();
	ctx.moveTo(tl.x, tl.y);
	ctx.lineTo(tr.x, tr.y);
	ctx.lineTo(br.x, br.y);
	ctx.lineTo(bl.x, bl.y);
	ctx.lineTo(tl.x, tl.y);
	ctx.fill();
	ctx.stroke();
	ctx.closePath();
};

const draw = (dot) => {
	const { i, col, row } = dot;

	if (col + 1 < cols && row + 1 < rows) {
		const topRight = dots[i + 1];
		const bottomRight = dots[i + 1 + rows];
		const bottomLeft = dots[i + rows];

		connect(dot, topRight, bottomRight, bottomLeft)
	}
};

const phaseSpeed = 0.009;
const scale = 0.003 ;
const amplitude = 30;

const loop = () => {
	ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

	dots.forEach((dot, index) => {
		const noise = simplex.noise3D(dot.x * scale, dot.y * scale, phase) * 0.25;
		const angle = noise * TAU;

		dot.noise = noise;
		dot.angle = angle;
		dot.x = dot.startX + (Math.cos(angle) * (amplitude));
		dot.y = dot.startY + (Math.sin(angle) * (amplitude));

		draw(dot);
	});

	phase += phaseSpeed;

	requestAnimationFrame(loop);
};

loop();
