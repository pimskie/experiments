const TAU = Math.PI * 2;

const W = 500;
const H = W;
const COLS = 50;
const ROWS = COLS;

const SPACEX = W / COLS;
const SPACEY = H / ROWS;

const NUM_LINES = 30;
const COLORS = ['#F1DDBF', '#525E75', '#78938A', '#92BA92'];

const simplex =  new SimplexNoise(Math.random() * 10000);
const pick = arr => arr[Math.floor(Math.random() * arr.length)];
const randBetween = (min, max) => min + (Math.random() * (max - min));

let phase = 0;

const ctx = document.querySelector('.js-lines').getContext('2d');
ctx.canvas.width = W;
ctx.canvas.height = H;

const generateLines = () => {
	return new Array(NUM_LINES).fill().map((_, i) => ({
		i,
		v: 2,
		color: pick(COLORS),
		points: [{
			x: 0,
			y:  (H / NUM_LINES) * (i + 1),
		}],
	}));
};
const getNoiseValue = (x, y, phase = 1) => {
	const scale = 0.05;
	const noisePhase = phase * 0.0005;

	return simplex.noise3D(x * scale, y * scale, noisePhase);
};

const clear = () => ctx.clearRect(0, 0, W, H);

const drawForceField = () => {
	for (let i = 0; i < COLS * ROWS; i++) {
		const col = (i % COLS);
		const row = Math.floor(i / ROWS);

		const noise = getNoiseValue(col, row, phase);
		const angle = noise * (Math.PI / 2);

		const x = col * SPACEX;
		const y = row * SPACEY;

		ctx.beginPath();
		ctx.moveTo(x, y);
		ctx.lineTo(x + (Math.cos(angle) * 6), y + (Math.sin(angle) * 6));
		ctx.stroke();
		ctx.closePath();
	}
};

const drawLine = (line, index) => {
	const { points } = line;

	const pointFirst = points[0];
	let pointLast = points[points.length - 1];

	const col = Math.ceil(pointLast.x / SPACEX);
	const row = Math.ceil(pointLast.y / SPACEY);
	const noise = getNoiseValue(col, row, phase);

	const angle = noise * (Math.PI / 2);

	points.push({
		x: pointLast.x + line.v,
		y: pointLast.y + (Math.sin(angle) * line.v),
	});

	ctx.beginPath();
	ctx.fillStyle = line.color;
	ctx.moveTo(pointFirst.x, pointFirst.y);

	let i;
	for (i = 1; i < points.length; i++) {
		ctx.lineTo(points[i].x, points[i].y);
	}

	ctx.lineTo(points[i - 1].x, H);
	ctx.lineTo(0, H);
	ctx.lineTo(pointFirst.x, pointFirst.y);

	ctx.fill();
	ctx.closePath();
};

const draw = () => {
	clear();

	lines.forEach(drawLine);

	phase += 1;

	requestAnimationFrame(draw);
};

ctx.canvas.addEventListener('click', () => {
	phase = Math.random() * 10000;

	lines = generateLines();

});

lines = generateLines();

draw();
