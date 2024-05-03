const ctx = document.getElementById('canvas').getContext('2d');
const canvasWidth = 500;
const cellWidth = 10;

const columnCount = canvasWidth / cellWidth;
const rowCount = canvasWidth / cellWidth;
const cellCount = columnCount * rowCount;

let activeCell = undefined;

ctx.canvas.width = canvasWidth;
ctx.canvas.height = canvasWidth;

const getCellIndex = (x, y) => {
    const xPos = Math.floor(x / cellWidth);
    const yPos = Math.floor(y / cellWidth);
    return yPos * columnCount + xPos;
};

const getCellCoordinates = (cellIndex) => {
    const x = (cellIndex % columnCount) * cellWidth;
    const y = Math.floor(cellIndex / columnCount) * cellWidth;
    return { x, y };
};

const getCell = (index) => {
    return {
        index,
        life: 0,
        isActive: false,
        position: getCellCoordinates(index),
    };
};

const cells = new Array(cellCount).fill().map((_, index) => getCell(index));

const drawGrid = () => {
    // Draw grid lines
    ctx.strokeStyle = 'rgba(100, 100, 100, 1)';
    ctx.lineWidth = 0.5;

    for (let i = 0; i <= rowCount; i++) {
        const y = i * cellWidth;
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvasWidth, y);
        ctx.stroke();
    }

    for (let j = 0; j <= columnCount; j++) {
        const x = j * cellWidth;
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvasWidth);
        ctx.stroke();
    }
};

ctx.canvas.addEventListener('pointermove', (e) => {
    const cellIndex = getCellIndex(e.offsetX, e.offsetY);
    

    if (activeCell !== cellIndex) {
        cells[cellIndex].life = 1;
    }

    activeCell = cellIndex;
});

const getAdjacentCells = (cellIndex) => {
    const adjacentCells = [
        // top left
        // cellIndex - columnCount - 1,
        
        // top
        cellIndex - columnCount,
        
        // top right
        // cellIndex - columnCount + 1,

        // left
        cellIndex - 1,

        // right
        // cellIndex + 1,

        // bottom left
        // cellIndex + columnCount - 1,

        // bottom
        cellIndex + columnCount,

        // bottom right
        // cellIndex + columnCount + 1,
    ]
    .filter((index) => index >= 0 && index < cellCount)
    .map((index) => cells[index]);

    // Fisher-Yates shuffle
    for (let i = adjacentCells.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [adjacentCells[i], adjacentCells[j]] = [adjacentCells[j], adjacentCells[i]];
    }

    return adjacentCells;
};

const drawSingleCell = (cell) => {
    ctx.fillStyle = `rgba(0, 0, 0, ${cell.life})`;
    ctx.fillRect(cell.position.x, cell.position.y, cellWidth, cellWidth);
};


const highlightOtherCells = (cellIndex, num, life = 1) => {
    if (num <= 0 || Math.random() > 0.5) {
        return;
    };

    cells[cellIndex].life = life;

    const adjacentCells = getAdjacentCells(cellIndex); //.slice(0, num + 1); 

    adjacentCells.filter(c => c.life < 0.3).forEach((cell) => {
        cell.life = life;
        highlightOtherCells(cell.index, num - 1, life * 0.6);
    });
}

const drawCells = () => {
    cells.forEach((cell) => {
        cell.life *= 0.99; 

        drawSingleCell(cell);

        if (cell.life > 0.85) {
            highlightOtherCells(cell.index, 3, cell.life);
        }
    });
};

const loop = () => {
    const then = performance.now();;

    ctx.clearRect(0, 0, canvasWidth, canvasWidth);

    drawGrid();
    drawCells();

    const now = performance.now();

    // console.log(now-then)

    requestAnimationFrame(loop);
};

loop();
