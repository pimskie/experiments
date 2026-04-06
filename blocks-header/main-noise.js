const canvas = document.querySelector('.js-canvas');

const ctx = canvas.getContext('2d');
const canvasParent = canvas.parentElement;

const BAR_WIDTH = 20;
const BAR_HEIGHT= 70;

const noise = new SimplexNoise();

let grid = [];
let rafId = null;
let tick = 0;

const SPEED = 0.001;
const NOISE_SCALE = 0.01;

const debounce = (func, timeout = 300) => {
  let timer;

  return (...args) => {
    clearTimeout(timer);

    timer = setTimeout(() => { func.apply(this, args); }, timeout);
  };
}

const getElementDimension = (el) => ({
  width: el.clientWidth,
  height: el.clientHeight,
});

const setCanvas = ({ width, height }) => {
  canvas.width = width;
  canvas.height = height;
}

const clearCanvas = () => ctx.clearRect(0, 0, canvas.width, canvas.height);

const getGrid = ({ cols, rows }) => {
  const numItems = cols * rows;

  const items = new Array(numItems).fill().map((_, index) => {
    const col = (index % cols);
    const row = Math.floor(index / cols);

    return { col, row, index };
  });

  return items;
}

const drawGrid = (grid = []) => {
  const barWidthScaled = BAR_WIDTH * 0.75;
  const barHeightScaled = BAR_HEIGHT * 1.5;

  grid.forEach(({col, row }) => {
    const isEvenRow = row % 2 === 0;
    const colModifier = isEvenRow ? BAR_WIDTH : 0;

    const x = col * BAR_WIDTH * 2 + colModifier;
    const y = row * BAR_HEIGHT;

    const heightScaled = BAR_HEIGHT * 1.75;
    const noiseScaledX = (x / BAR_WIDTH) * NOISE_SCALE;
    const noiseScaledY = (y / BAR_HEIGHT) * NOISE_SCALE;

   const noiseValue = noise.noise3D(noiseScaledX, noiseScaledY, tick);
   const rotation = Math.PI * noiseValue * 0.2;

    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rotation);
    ctx.beginPath();

    ctx.fillStyle = '#e5e2d1';
    ctx.rect(-barWidthScaled >> 1, -barHeightScaled >> 1, barWidthScaled, barHeightScaled);
    ctx.fill();
    ctx.closePath();
    ctx.restore();
  });
}


const loop = () => {
  tick += SPEED;

  clearCanvas();
  drawGrid(grid);

  rafId = requestAnimationFrame(loop);
}

const init = () => {
  cancelAnimationFrame(rafId);

  const { width, height } = getElementDimension(canvasParent);

  const cols = Math.ceil(width / BAR_WIDTH);
  const rows = Math.ceil(height / BAR_HEIGHT);

  clearCanvas();
  setCanvas({ width, height });

  grid = getGrid({ cols, rows });

  loop();
}


init();

const onWindowResize = (e) => {
  init();
}

const resizeHandler = debounce(onWindowResize);

window.addEventListener('resize', resizeHandler);
