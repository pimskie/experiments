const angleBetween = (vec1, vec2) => Math.atan2(vec2.y - vec1.y, vec2.x - vec1.x);

const width = 500;
const height = 500;
const canvas = document.querySelector('canvas');
const ctx = canvas.getContext('2d');

canvas.width = width;
canvas.height = height;

const colsTotal = 10;
const rowsTotal = colsTotal;

const spaceX = width / colsTotal;
const spaceY = height / colsTotal;
const grid = new Array(colsTotal * rowsTotal).fill(false);

const walker = {
  x: 3 * spaceX,
  y: 3 * spaceY,
  angle: 0,
};

const clear = () => ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

const drawGrid = () => {
  ctx.lineWidth = 0.5;

  for (let i = 1; i < colsTotal; i++) {
    const x = i * spaceX;
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, height);
    ctx.closePath();
    ctx.stroke();
  }

  for (let q = 1; q < rowsTotal; q++) {
    const y = q * spaceY;
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(width, y);
    ctx.closePath();
    ctx.stroke();
  }
};

const col = Math.ceil(walker.x / spaceX);
const row =  Math.ceil(walker.y / spaceY);
const cell = col + ((row - 1) * colsTotal);

const drawWalker = () => {
  ctx.beginPath();
  ctx.arc(walker.x, walker.y, 4, 0, Math.PI * 2);
  ctx.fill();
  ctx.closePath();
};

const changeWalkerDirection = (w) => {
  const rand = Math.random() >= 0.5;
  w.angle += rand
    ? -Math.PI / 2
  : Math.PI  / 2;
};

const getGridPosition = (w) => {
  const { x, y } = w;

  const col = Math.ceil(x / spaceX);
  const row =  Math.ceil(y / spaceY);
  const cell = getCell(col, row);

  return { col, row, cell };
};

const getCell = (col, row) => col + ((row - 1) * colsTotal);

const getSurroundingCells = (w) => {
  const { col, row } = getGridPosition(w);

  const colRight = (col + 1) <= colsTotal ? col + 1 : 0;
  const colLeft = (col - 1) >= 0 ? col - 1 : colsTotal;

  const rowTop = (row - 1) >= 0 ? row - 1 : rowsTotal;
  const rowBottom = (row + 1) <= rowsTotal ? row + 1 : 0;

  const cellRight = getCell(colRight, row);
  const cellLeft = getCell(colLeft, row);
  const cellTop = getCell(col, rowTop);
  const cellBottom = getCell(col, rowBottom);

  return [cellTop, cellRight, cellBottom, cellLeft];
};

const updateWalker = () => {

	const newX = walker.x + Math.cos(walker.angle) * spaceX;
  const newY =  walker.y + Math.sin(walker.angle) * spaceY;

  const newCol = Math.ceil(walker.x / spaceX);
  const newRow =  Math.ceil(walker.y / spaceY);

  const newCell = getCell(newCol, newRow);

  if (grid[newCell]) {
		const surroundingCells = getSurroundingCells(walker);
		const freeCell = surroundingCells.find(i => !grid[i]);
		const freeCellX = (freeCell % colsTotal) * spaceX;
		const freeCellY = Math.ceil(freeCell / colsTotal) * spaceY;

		walker.angle = angleBetween({ x: freeCellX, y: freeCellY }, walker);

		walker.x = walker.x + Math.cos(walker.angle) * spaceX;
  	walker.y = walker.y + Math.sin(walker.angle) * spaceY;

  } else {
    walker.x = newX;
    walker.y = newY;

    grid[newCell] = true;

    if (walker.x > width) {
			walker.x = 0;
		}

		if (walker.x < 0) {
			walker.x = width;
		}

		if (walker.y > height) {
			walker.y = 0;
		}

		if (walker.y < 0) {
			walker.y = height;
		}
  }


};


const update = () => {
  clear();
  drawGrid();
  drawWalker();
  updateWalker();

  setTimeout(update, 100);
};

update();
