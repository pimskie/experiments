const q = (sel) => document.querySelector(sel);

const canvas = q('canvas');
const ctx = canvas.getContext('2d');
const PI2 = Math.PI * 2;

const width = 500;
const height = 500;
const widthHalf = width * 0.5;
const heightHalf = height * 0.5;

canvas.width = width;
canvas.height = height;


const clear = () => {
	ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
};

const loop = () => {
	clear();

	requestAnimationFrame(loop);
};

loop();
