const TAU = Math.PI * 2;

const W = 500;
const H = W;
const COLS = 50;
const ROWS = COLS;

const SPACEX = W / COLS;
const SPACEY = H / ROWS;

const NUM_LINES = 10;
const COLORS = [
	['#F1DDBF', '#525E75', '#78938A', '#92BA92'],
	['#e63946', '#f1faee', '#a8dadc', '#457b9d', '#1d3557'],
	['#ccd5ae', '#e9edc9', '#fefae0', '#faedcd', '#d4a373'],
	['#3A3845', '#F7CCAC', '#C69B7B', '#826F66'],
];

const simplex =  new SimplexNoise(Math.random() * 10000);
const pick = arr => arr[Math.floor(Math.random() * arr.length)];
const randBetween = (min, max) => min + (Math.random() * (max - min));

let phase = 0;

const ctx = document.querySelector('.js-lines').getContext('2d');
ctx.canvas.width = W;
ctx.canvas.height = H;

const generateLines = () => {
	const palette = pick(COLORS);

	return new Array(NUM_LINES).fill().map((_, i) => ({
		v: 2,
		color: pick(palette),
		x: 0,
		y:  (H / NUM_LINES) * (i + 1),
	}));
};

const getNoiseValue = (x, y) => {
	const scale = 0.02;
	const noisePhase = performance.now() * 0.0005;

	return simplex.noise3D(x * scale, y * scale, noisePhase);
};

const clear = () => ctx.clearRect(0, 0, W, H);

const drawFill = (from, to, color) => {
	ctx.fillStyle = color;
	ctx.strokeStyle = color;
	ctx.lineWidth = 2;

	ctx.beginPath();
	ctx.moveTo(from.x, from.y);
	ctx.lineTo(to.x, to.y);
	ctx.lineTo(to.x, H);
	ctx.lineTo(from.x, H);
	ctx.lineTo(from.x, from.y);
	ctx.closePath();
	ctx.fill();
	ctx.stroke();
};

const drawShape = (line, index) => {
	const { x, y } = line;

	const col = Math.ceil(x / SPACEX);
	const row = Math.ceil(y / SPACEY);
	const noise = getNoiseValue(col, row);

	const angle = noise * (Math.PI * 0.5);
	const nextX = x + line.v;
	const nextY = y + (Math.sin(angle) * line.v);

	const outlineWidth = 5;

	drawFill(
		{ x, y: y - outlineWidth },
		{ x: nextX, y: nextY - outlineWidth },
		'#000',
	);

	drawFill(
		{ x, y },
		{ x: nextX, y: nextY },
		line.color,
	);

	line.x = nextX;
	line.y = nextY;

	if (line.x > W) {
		ctx.fillStyle = 'rgba(255, 255, 255, 0.02)';
		ctx.fillRect(0, 0, W, H);

		line.x = 0;
		line.y = (H / NUM_LINES) * (index + 1);
	}
};

const loop = () => {
	lines.forEach(drawShape);

	phase += 1;

	requestAnimationFrame(loop);
};

ctx.canvas.addEventListener('click', () => {
	clear();
	lines = generateLines();

});

lines = generateLines();

loop();
