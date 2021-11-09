const map = (value, start1, stop1, start2, stop2) => ((value - start1) / (stop1 - start1)) * (stop2 - start2) + start2;

const wrappBBox = (vec, w, h) => {
	if (vec.x < 0) {
		vec.x = w;
	} else if (vec.x > w) {
		vec.x = 0;
	}
}

const W = 350;
const H = W;

const COLS = 30;
const ROWS = COLS;

const NUM_LINES = 10;

const simplex = new SimplexNoise(performance.now());
const ctx = document.querySelector('.js-lines').getContext('2d');

ctx.canvas.width = W;
ctx.canvas.height = H;

const lines = new Array(NUM_LINES).fill().map((_, i) => ({
	index: i,
	x: 0,
	y: (H / NUM_LINES) * (1 + i),
	angle: 0,
	velocity: 0.5 + (Math.random() * 0.5),
}));

const clear = () => {
	ctx.clearRect(0, 0, W, H);
};

const drawGrid = () => {
	ctx.strokeStyle = '#aaa';
	ctx.lineWidth = 1;

	for (let i = 1; i < COLS; i++) {
		const x = (W / COLS) * i;

		ctx.beginPath();
		ctx.moveTo(x, 0);
		ctx.lineTo(x, H);
		ctx.stroke();
		ctx.closePath();
	}

	for (let i = 1; i < ROWS; i++) {
		const y = (H / ROWS) * i;

		ctx.beginPath();
		ctx.moveTo(0, y);
		ctx.lineTo(W, y);
		ctx.stroke();
		ctx.closePath();
	}
};

const drawNoiseVector = (x, y, angle) => {
	const length = (W / COLS) / 2;

	const endX = x + (Math.cos(angle) * length);
	const endY = y + (Math.sin(angle) * length);

	ctx.lineWidth = 1;
	ctx.beginPath();
	ctx.moveTo(x, y);
	ctx.lineTo(endX, endY);
	ctx.stroke();
	ctx.closePath();
};

const drawNoise = () => {
	const colWidth = W / COLS;
	const rowHeight = H / ROWS;


	for (let i = 0; i < COLS * ROWS; i++) {
		const col = i % COLS;
		const row = Math.floor(i / COLS);

		const x = col * colWidth + (colWidth / 2);
		const y = row * rowHeight + (rowHeight / 2);

		const noise = getNoiseValue(x, y);
		const angle = noise * (Math.PI / 2);

		drawNoiseVector(x, y, angle);
	}
};

const getNoiseValue = (x, y, i = 1) => {
	const noiseScaleX = 0.009;
	const noiseScaleY = 0.001;

	const noise = simplex.noise3D(x * noiseScaleX, y * noiseScaleY, i);

	return noise;
};

const drawLines = () => {
	lines.forEach((line) => {
		const lineCurrent = { ...line };
		const noise = getNoiseValue(lineCurrent.x, lineCurrent.y);
		const angle = (Math.PI / 2) * noise;
		const lightness = map(noise, -1, 1, 30, 200);
		const lineWidth = map(noise, -1, 1, 1, 4);

		line.angle = angle;
		line.x += line.velocity;
		line.y += Math.sin(line.angle) * line.velocity;

		ctx.strokeStyle = `rgb(${lightness}, ${lightness}, ${lightness})`;
		ctx.lineWidth = lineWidth;

		ctx.beginPath();
		ctx.moveTo(lineCurrent.x, lineCurrent.y);
		ctx.lineTo(line.x, line.y);

		ctx.stroke();
		ctx.closePath();

		wrappBBox(line, W, H);
	});
};

const draw = () => {
	// clear();
	// drawGrid();
	// drawNoise();
	drawLines();

	requestAnimationFrame(draw);
};

draw();
