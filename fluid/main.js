import Fluid from './Fluid.js';

const N = 200;
const SPACING = 50;

const fluid = new Fluid({ N, size: 20, diffusion: 10 });

const ctx = document.querySelector('canvas').getContext('2d');
ctx.canvas.width = N;
ctx.canvas.height = N;


const drawGrid = (ctx) => {
	const drawLine = (ctx, from, to) => {
		ctx.beginPath();
		ctx.moveTo(from.x, from.y);
		ctx.lineTo(to.x, to.y);
		ctx.stroke();
		ctx.closePath();
	}

	ctx.strokeStyle = '#ccc';

	for (let x = 0; x < N; x += SPACING) {
		drawLine(ctx, { x, y: 0 }, { x, y: N });
	}

	for (let y = 0; y < N; y += SPACING) {
		drawLine(ctx, { x: 0, y }, { x: N, y });
	}
};

const loop = () => {
	ctx.clearRect(0, 0, N, N);

	drawGrid(ctx);

	requestAnimationFrame(loop);
};

loop();
