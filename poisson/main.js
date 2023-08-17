const DIMENSION = 300;
const MID = DIMENSION * 0.5;
const NOISE_SCALE = 0.001;
const TAU = Math.PI * 2;

const randomArrayValue = arr => arr[Math.floor(Math.random() * arr.length)];

const getPositionByIndex = (index, cols) => ({
	x: index % cols,
	y: Math.floor(index / cols),
});

const getIndexByPosition = (totalCols, col, row) => (row * totalCols) + col;

const drawRegion = (ctx, position, radius, cellSize) => {
	ctx.save();
	ctx.beginPath();
	ctx.strokeStyle = '#aaa';
	ctx.arc((position.x * cellSize) + (cellSize * 0.5), (position.y * cellSize) + (cellSize * 0.5), radius, 0, Math.PI * 2);

	ctx.closePath();
	ctx.stroke();
	ctx.restore();
};

const drawPoint = (ctx, position, radius, cellSize) => {
	ctx.save();
	ctx.beginPath();
	ctx.fillStyle = '#000';
	ctx.arc((position.x * cellSize) + (cellSize * 0.5), (position.y * cellSize) + (cellSize * 0.5), radius, 0, Math.PI * 2);

	ctx.closePath();
	ctx.fill();
	ctx.restore();
};

const ctx = document
	.querySelector('#canvas')
	.getContext('2d');

ctx.canvas.width = ctx.canvas.height = DIMENSION;

const minDistance = 100;

const radius = minDistance / Math.sqrt(2);
const cellSize = radius / Math.sqrt(2);

const cols = Math.floor(DIMENSION / cellSize);
const rows = Math.floor(DIMENSION / cellSize);
const numPoints = cols * rows;

const grid = new Array(numPoints);
const points = new Array(numPoints);
const activeList = new Array();

for (let i = 0; i < numPoints; i++) {
	const position = getPositionByIndex(i, cols);

	drawRegion(ctx, position, radius, cellSize);
}

const x0 = { x: 2, y: 3 };
const index = getIndexByPosition(cols, x0.x, x0.y);

drawPoint(ctx, x0, 3, cellSize);

activeList.push(index);

const i = randomArrayValue(activeList);
const k = 5;
