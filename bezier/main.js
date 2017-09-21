const q = (sel) => document.querySelector(sel);

const canvas = q('canvas');
const ctx = canvas.getContext('2d');
const PI2 = Math.PI * 2;

// all set in `setStage`
let w;
let h;
let midX;
let midY;

let rafId = null;

canvas.width = w;
canvas.height = h;

const setupStage = () => {
	onResize();
};

const onResize = () => {
	w = window.innerWidth;
	h = window.innerHeight;

	midX = w >> 1;
	midY = h >> 1;

	canvas.width = w;
	canvas.height = h;
};

const clear = () => {
	ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
};

const loop = () => {
	rafId = requestAnimationFrame(loop);
};

window.addEventListener('resize', onResize);

setupStage();
loop();
