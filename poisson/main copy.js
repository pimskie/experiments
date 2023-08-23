// https://medium.com/@hemalatha.psna/implementation-of-poisson-disc-sampling-in-javascript-17665e406ce1
//  Robert Bridson, called Fast Poisson Disk Sampling in Arbitrary Dimensions
// https://www.cs.ubc.ca/~rbridson/docs/bridson-siggraph07-poissondisk.pdf
const DIMENSION = 500;
const PI2 = Math.PI * 2;

const randomArrayValue = arr => arr[Math.floor(Math.random() * arr.length)];
const randomBetween = (min, max) => Math.random() * (max - min) + min;
const distanceBetween = (vec1, vec2) => Math.hypot(vec2.x - vec1.x, vec2.y - vec1.y);

const getCellRowByPosition = ({ x, y }) => ({
	x: Math.floor(x / cellSize),
	y: Math.floor(y / cellSize),
});


const drawPoint = (position) => {
	const radius = 2;
	const radiusH = radius * 0.5;

	ctx.save();
	ctx.beginPath();
	ctx.fillStyle = `hsl(${hue}, 50%, 50%)`;
	ctx.arc((position.x), (position.y), radius, 0, PI2);

	ctx.closePath();
	ctx.fill();
	ctx.restore();
};

const ctx = document
	.querySelector('#canvas')
	.getContext('2d');

ctx.canvas.width = ctx.canvas.height = DIMENSION;

const r = 10;
const k = 30;
const cellSize = Math.floor(r / Math.sqrt(2));

const cols = Math.ceil(DIMENSION / cellSize) + 1;
const rows = Math.ceil(DIMENSION / cellSize) + 1;
const grid = new Array(cols).fill(-1).map(() => new Array(rows).fill(-1));
let activeList = new Array();

let hue = 0;

const addPointToGrid = (point) => {
	const col = Math.floor(point.x / cellSize);
  const row = Math.floor(point.y / cellSize);

  grid[col][row] = point;
};

const p1 = {
	x: Math.random() * DIMENSION,
	y: Math.random() * DIMENSION,
};

drawPoint(p1);
addPointToGrid(p1);
activeList.push(p1);

const isValidPoint = (point) => {
	if (point.x < 0 || point.x > DIMENSION || point.y < 0 || point.y > DIMENSION) {
		return false;
	}

	// TODO: dry
	const col = Math.floor(point.x / cellSize);
  const row = Math.floor(point.y / cellSize);

	const xmin = Math.max(col - 1, 0);
	const xmax = Math.min(col + 1, cols - 1);
	const ymin = Math.max(row - 1, 0);
	const ymax = Math.min(row + 1, rows - 1);

	// loop horizontally
	for (let x = xmin; x <= xmax; x++ ) {
		// loop vertically
		for (let y = ymin; y <= ymax; y++ ) {
			const cell = grid[x][y];

			if (cell !== -1) {
				const distance = distanceBetween(cell, point);

				if (distance < r) {
					return false;
				}
			}
		}
	}

	return true;
};

const poisson = (point) => {
	let hasPoint = false;

	for (let i = 0; i < k; i++) {
		const angle = Math.random() * PI2;
		const length = randomBetween(r, r * 2);

		const point2 = {
			x: point.x + (Math.cos(angle) * length),
			y: point.y + (Math.sin(angle) * length),
		};

		if (isValidPoint(point2)) {
			hue += 0.1;

			ctx.save();
			ctx.strokeStyle = '#999';
			ctx.beginPath();
			ctx.moveTo(point.x, point.y)
			ctx.lineTo(point2.x, point2.y);
			ctx.stroke();
			ctx.closePath();
			ctx.restore();

			// drawPoint(point2);
			addPointToGrid(point2);
			activeList.push(point2)

			hasPoint = true;

			// break;
		}
	}

	if (!hasPoint) {
		activeList = activeList.filter(p => p !== point);
	}
};

const loop = () => {
	if (!activeList.length) {
		console.log('empty');
		return;
	}

	const p1 = randomArrayValue(activeList);

	poisson(p1);

	requestAnimationFrame(loop);
};

loop();
