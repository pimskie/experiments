
// Any live cell with fewer than two live neighbours dies, as if by underpopulation.
// Any live cell with two or three live neighbours lives on to the next generation.
// Any live cell with more than three live neighbours dies, as if by overpopulation.
// Any dead cell with exactly three live neighbours becomes a live cell, as if by reproduction

const randomArrayValue = arr => arr[Math.floor(Math.random() * arr.length)];
const randomBetween = (min, max) => Math.floor(Math.random() * (max - min) + min);

const toggle = document.body.querySelector('[data-ref=play]');

const canvasState = document.body.querySelector('[data-ref=state]');
const ctxState = canvasState.getContext('2d');

const canvasGrid = document.body.querySelector('[data-ref=grid]');
const ctxGrid = canvasGrid.getContext('2d');

const WIDTH = 700;
const HEIGHT = WIDTH;

const COLS = 100;
const ROWS = COLS;
const NUM_CELLS = COLS * ROWS;

const CELL_WIDTH = WIDTH / COLS;
const CELL_HEIGHT = HEIGHT / ROWS;

canvasState.width =  canvasGrid.width = WIDTH;
canvasState.height = canvasGrid.height = HEIGHT;


const spawnThing = (e) => {
    const { offsetX: x, offsetY: y } = e;

    const col = Math.floor(x / CELL_WIDTH);
    const row = Math.floor(y / CELL_HEIGHT);
    const cell = state.grid[row * COLS + col];

    cell.alive = true;

    drawState();
}

const getMooreAlive = (cell, grid) => {
    const { col, row, index } = cell;

    const nwIndex = col > 0 && row > 0 ? index - (COLS + 1) : false;
    const nIndex = row > 0 ? index - COLS : false;
    const neIndex = col < COLS - 1 && row > 0 ? index - (COLS - 1) : false;
    const wIndex = col > 0 ? index - 1 : false;
    const eIndex = col < COLS - 1 ? index + 1 : false;
    const swIndex = col > 0 && row < ROWS - 1 ? index + (COLS - 1) : false;
    const sIndex = row < ROWS - 1 ? index + COLS : false;
    const seIndex = col < COLS - 1 && row < ROWS - 1 ? index + (COLS + 1) : false;

    const aliveMooreNeighbors = [nwIndex, nIndex, neIndex, wIndex, eIndex, swIndex, sIndex, seIndex]
        .filter(i => i !== false)
        .map(i => grid[i])
        .filter(c => c.alive);

    return aliveMooreNeighbors;

}

const getGrid = (cols, rows) => new Array(cols * rows).fill().map((_, index) => {
    const col = index % cols;
    const row = Math.floor(index / cols);

    const x = col * CELL_WIDTH;
    const y = row * CELL_HEIGHT;
    const alive = false;
    const age = 0;

    return { index, col, row, x, y, alive, age };
});

const state = {
    grid: getGrid(COLS, ROWS),
    isSpawning: false,
    rafId: null,
}

const clear = () => ctxState.clearRect(0, 0, ctxState.canvas.width, ctxState.canvas.height);

const drawGrid = () => {
    ctxGrid.beginPath();
    ctxGrid.lineWidth = 0.5;
    ctxGrid.strokeStyle = '#ccc';

    for (let col = 0; col <= COLS; col++) {
        const x = CELL_WIDTH * col;
        ctxGrid.moveTo(x, 0);
        ctxGrid.lineTo(x, HEIGHT);
    }

    for (let row = 0; row <= ROWS; row++) {
        const y = CELL_HEIGHT * row;
        ctxGrid.moveTo(0, y);
        ctxGrid.lineTo(WIDTH, y);
    }

    ctxGrid.stroke();
}


const fillCell = (cell, color = '#000') => {
    const { x, y } = cell;

    ctxState.beginPath();
    ctxState.fillStyle = color;
    ctxState.rect(x, y, CELL_WIDTH, CELL_HEIGHT);
    ctxState.closePath();
    ctxState.fill();
}

const drawState = () => {
    const { grid } = state;
    const aliveCells = grid.filter(c => c.alive);

    for (let i = 0; i < aliveCells.length; i++) {
       fillCell(aliveCells[i]);
    }
}

const updateState = () => {
    const { grid } = state;
    const gridSnapshot = structuredClone(grid);

    const alive = grid.filter(c => c.alive);
    const dead = grid.filter(c => !c.alive);

    alive.forEach((cell) => {
        const aliveNeighbors = getMooreAlive(cell, gridSnapshot);
        const shouldDie = aliveNeighbors.length < 2 || aliveNeighbors.length > 3;

        grid[cell.index].alive = !shouldDie;
        grid[cell.index].age += shouldDie ? 0 : 1;
    });

    dead.forEach((cell) => {
        const aliveNeighbors = getMooreAlive(cell, gridSnapshot);
        const shouldLive = aliveNeighbors.length === 3;

        grid[cell.index].alive = shouldLive;
    });
}

const reset = () => {
    clear();

    cancelAnimationFrame(state.rafId);

    state.grid = getGrid(COLS, ROWS);
    state.rafId = null;
}

const update = () => {
    clear();
    updateState();
    drawState();
}

const loop = () => {
    update();
    
    state.rafId = requestAnimationFrame(loop);
}

canvasState.addEventListener('pointerdown', () => {
    canvasState.addEventListener('pointermove', spawnThing);
    state.isSpawning = true;
});

document.body.addEventListener('pointerup', () => {
    canvasState.removeEventListener('pointermove', spawnThing);
    state.isSpawning = false;
});

toggle.addEventListener('click', () => {
    if (state.rafId) {
        reset();
    } else {
        loop();
    }

    toggle.textContent = state.rafId ? "Stop" : "Play";
});

drawGrid();
update();