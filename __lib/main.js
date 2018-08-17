const q = sel => document.querySelector(sel);

const ctx = q('canvas').getContext('2d');
const TAU = Math.PI * 2;

const W = 500;
const H = 500;
const MID_X = W * 0.5;
const MID_Y = H * 0.5;

ctx.canvas.width = W;
ctx.canvas.height = H;


const clear = () => {
	ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
};

const loop = () => {
	clear();

	requestAnimationFrame(loop);
};

// loop();
