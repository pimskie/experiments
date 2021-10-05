const clear = () => ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
const randomBetween = (min, max) => Math.round(Math.random() * (max - min) + min);
const angleBetween = (vec1, vec2) => Math.atan2(vec2.y - vec1.y, vec2.x - vec1.x);
const clamp = (value, min, max) => Math.max(min, Math.min(value, max));
const shuffleArray = (array) => {
	for (let i = array.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1));
		[array[i], array[j]] = [array[j], array[i]];
	}

	return array;
}

const DIRECTIONS = {
	'top': { col: 0, row: -1 },
	'right': { col: 1, row: 0 },
	'bottom': { col: 0, row: 1 },
	'left': { col: -1, row: 0 },
};
const width = 500;
const height = 500;

const ctx = document.querySelector('.composition').getContext('2d');
const ctxPath = document.querySelector('.path').getContext('2d');
const ctxGrid = document.querySelector('.grid').getContext('2d');

[...document.querySelectorAll('canvas')].forEach(c => {
	c.width = width;
	c.height = height;
})

const colsTotal = 80;
const rowsTotal = colsTotal;

const spaceX = width / colsTotal;
const spaceY = height / colsTotal;
const grid = new Array(colsTotal * rowsTotal).fill(false);

const walkers = new Array(50).fill().map((_, i) => {
	const col = randomBetween(1, colsTotal - 1);
	const row = randomBetween(1, rowsTotal - 1);
	const directionCol = Math.random() > 0.5 ? (Math.random() > 0.5 ? -1 : 1) : 0;
	const directionRow = directionCol === 0 ? (Math.random() > 0.5 ? -1 : 1) : 0;

	return {
		col,
		row,
		direction: {
			col: directionCol,
			row: directionRow,
		},
	};
});


const drawGrid = (dest) => {
	dest.lineWidth = 0.5;

	for (let i = 1; i < colsTotal; i++) {
		const x = i * spaceX;

		dest.beginPath();
		dest.moveTo(x, 0);
		dest.lineTo(x, height);
		dest.closePath();
		dest.stroke();
	}

	for (let q = 1; q < rowsTotal; q++) {
		const y = q * spaceY;

		dest.beginPath();
		dest.moveTo(0, y);
		dest.lineTo(width, y);
		dest.closePath();
		dest.stroke();
	}
};

const drawWalker = (walker) => {
	ctx.beginPath();
	ctx.arc(walker.col * spaceX, walker.row * spaceY, 2, 0, Math.PI * 2);
	ctx.fill();
	ctx.closePath();
};

const getCell = (col, row) => col + (row * colsTotal);

const getSurroundingCell = (w) => {
	const { col, row } = w;

	const colRight = col + 1;
	const colLeft = col - 1;
	const rowTop = row - 1;
	const rowBottom = row + 1;

	const cellTop = getCell(col, rowTop);
	const cellRight = getCell(colRight, row);
	const cellBottom = getCell(col, rowBottom);
	const cellLeft = getCell(colLeft, row);

	const cells = [
		{ direction: 'top', index: cellTop },
		{ direction: 'right', index: cellRight },
		{ direction: 'bottom', index: cellBottom },
		{ direction: 'left', index: cellLeft },
	].filter(c => c.index > 0 && c.index < grid.length);

	return shuffleArray(cells).find(cell => !grid[cell.index]);

};

const updateWalker = (walker) => {
	const nextCol = walker.col + walker.direction.col;
	const nextRow = walker.row + walker.direction.row;
	const nextCell = getCell(nextCol, nextRow);

	if (grid[nextCell] || nextCol >= colsTotal || nextRow >= rowsTotal || nextCol <= 0 || nextRow <= 0 || Math.random() > 0.9) {
		const surroundingCell = getSurroundingCell(walker);

		if (surroundingCell) {
			walker.direction = DIRECTIONS[surroundingCell.direction];
		}

	} else {
		walker.col += walker.direction.col;
		walker.row += walker.direction.row;

		grid[nextCell] = true;
	}


	if (walker.col > colsTotal) {
		walker.col = 0;
		walker.wrapped = true;
	}

	if (walker.col < 0) {
		walker.col = colsTotal;
		walker.wrapped = true;
	}

	if (walker.row > rowsTotal) {
		walker.row = 0;
		walker.wrapped = true;
	}

	if (walker.row < 0) {
		walker.row = rowsTotal;
		walker.wrapped = true;
	}
};


const update = () => {
	clear();


	walkers.forEach((walker) => {
		ctxPath.beginPath();

		ctxPath.moveTo(walker.col * spaceX, walker.row * spaceY);

		updateWalker(walker);

		ctxPath.lineTo(walker.col * spaceX, walker.row * spaceY);

		if (!walker.wrapped) {
			ctxPath.stroke();
		}

		ctxPath.closePath();

		drawWalker(walker);
		walker.wrapped = false;
	});

	ctx.drawImage(ctxPath.canvas, 0, 0);

	requestAnimationFrame(update);
};

drawGrid(ctxGrid);
update();
