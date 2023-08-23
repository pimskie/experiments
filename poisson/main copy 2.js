// https://medium.com/@hemalatha.psna/implementation-of-poisson-disc-sampling-in-javascript-17665e406ce1
//  Robert Bridson, called Fast Poisson Disk Sampling in Arbitrary Dimensions
// https://www.cs.ubc.ca/~rbridson/docs/bridson-siggraph07-poissondisk.pdf
// Photo by <a href="https://unsplash.com/@pradologue?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText">Prado</a> on <a href="https://unsplash.com/photos/S89gVhM67lU?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText">Unsplash</a>
// https://unsplash.com/photos/S89gVhM67lU
// https://unsplash.com/photos/a-colorful-parrot-sitting-on-top-of-a-tree-branch-ArQXu1jXdpE

// https://pimskie.dev/public/assets/turban1-resized.jpg
const randomArrayValue = arr => arr[Math.floor(Math.random() * arr.length)];
const randomBetween = (min, max) => Math.random() * (max - min) + min;
const distanceBetween = (vec1, vec2) => Math.hypot(vec2.x - vec1.x, vec2.y - vec1.y);
const getPixelIndex = ({ x, y }, imageWidth) => (~~x + ~~y * imageWidth) * 4;

const PI2 = Math.PI * 2;
const r = 10;
const k = 30;
const cellSize = Math.floor(r / Math.sqrt(2));

let rafId = null;
let grid;
let activeList;
let hue;
let imageData;
let cols;
let rows;
let width;
let height;

const ctx = document.querySelector('#canvas').getContext('2d');
const ctxGhost = document.createElement('canvas').getContext('2d');

// document.body.appendChild(ctxGhost.canvas);

const drawPoint = (position, rgb) => {
	const radius = 2;

	ctx.save();
	ctx.beginPath();
	ctx.fillStyle = 'red'; // `rgb(${rgb.join(', ')})`;
	ctx.arc((position.x), (position.y), radius, 0, PI2);

	ctx.closePath();
	ctx.fill();
	ctx.restore();
};

const getGridPosition = (point) => ({
	col: Math.floor(point.x / cellSize),
	row: Math.floor(point.y / cellSize),
});

const addPointToGrid = (point) => {
	const { col, row } = getGridPosition(point);

  grid[col][row] = point;
};

const isFarEnough = (point) => {
	const { col, row } = getGridPosition(point);

	const xmin = Math.max(col - 1, 0);
	const xmax = Math.min(col + 1, cols - 1);
	const ymin = Math.max(row - 1, 0);
	const ymax = Math.min(row + 1, rows - 1);

	for (let x = xmin; x <= xmax; x++ ) {
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

const isValidPoint = (point, width, height) => {
	if (point.x < 0 || point.x > width || point.y < 0 || point.y > height) {
		return false;
	}

	if (!isFarEnough(point)) {
		return false;
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

			const pixelIndex = getPixelIndex(point2, width);

			const rgb = [
				imageData[pixelIndex],
				imageData[pixelIndex + 1],
				imageData[pixelIndex + 2],
			];

			drawPoint(point2, rgb);

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


const loadImage = (imageUrl) => {
	const img = new Image();

	img.crossOrigin = '';

	return new Promise(function(resolve, reject) {
		img.addEventListener('load', () => {
			resolve(img);
		});

		img.src = imageUrl;
	});
};

const clearCanvas = () => {
	ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
};

const resizeCanvas = (width, height) => {
	ctx.canvas.width = ctxGhost.canvas.width = width;
	ctx.canvas.height = ctxGhost.canvas.height = height;
};

const loop = () => {
	if (!activeList.length) {
		return;
	}

	const p1 = randomArrayValue(activeList);

	poisson(p1);

	rafId = requestAnimationFrame(loop);
};

const start = async () => {
	const imageUrl = 'https://pimskie.dev/public/assets/turban1-resized.jpg';
	const img = await loadImage(imageUrl);

	width = img.width;
	height = img.height;
	cols = Math.ceil(width / cellSize) + 1;
	rows = Math.ceil(height / cellSize) + 1;

	clearCanvas();
	resizeCanvas(width, height);

	ctxGhost.drawImage(img, 0, 0);

	imageData = ctxGhost.getImageData(0, 0, width, height).data;
	grid = new Array(cols).fill(-1).map(() => new Array(rows).fill(-1));
	activeList = new Array();
	hue = 0;

	const p1 = {
		x: Math.random() * width,
		y: Math.random() * height,
	};

	const pixelIndex = getPixelIndex(p1, width);

	const rgb = [
		imageData[pixelIndex],
		imageData[pixelIndex + 1],
		imageData[pixelIndex + 2],
	];

	drawPoint(p1, rgb);
	addPointToGrid(p1);
	activeList.push(p1);

	cancelAnimationFrame(rafId);

	loop();
};


start();
