const q = (sel) => document.querySelector(sel);

const canvas = q('canvas');
const ctx = canvas.getContext('2d');
const PI2 = Math.PI * 2;

// all set in `setStage`
const w = 500;
const h = 500;
const hw = w * 0.5;
const hh = h * 0.5;

canvas.width = w;
canvas.height = h;


const clear = () => {
	ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
};

const loop = () => {
	clear();

	requestAnimationFrame(loop);
};

loop();
