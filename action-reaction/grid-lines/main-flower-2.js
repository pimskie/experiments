const clamp = (value, min, max) => Math.max(min, Math.min(value, max));
const ctx = document.querySelector('.js-canvas').getContext('2d');
const ctxGhost = document.querySelector('.js-canvas-ghost').getContext('2d');

const W = clamp(Math.min(window.innerWidth, window.innerHeight) - 100, 200, 800);
const H = W;

const MID_X = W * 0.5;
const MID_Y = H * 0.5;

const PIPI = Math.PI * 2;

ctx.canvas.width = W;
ctx.canvas.height = H;

ctxGhost.canvas.width = W;
ctxGhost.canvas.height = H;

const SPACING = 20;

const drawLine = (ctx, from, to, lineWidth = 0.25, color = '#000') => {
	ctx.lineWidth = lineWidth;
	ctx.strokeStyle = color;

	ctx.beginPath();
	ctx.moveTo(...from);
	ctx.lineTo(...to);
	ctx.closePath();
	ctx.stroke();
};

const drawGrid = () => {
	const gradient = ctxGhost.createLinearGradient(0, 0, ctxGhost.canvas.width, 0);

	gradient.addColorStop(0.1, 'rgba(255, 255, 255, 0)');
	gradient.addColorStop(.5, 'rgba(255, 255, 255, 1)');
	gradient.addColorStop(0.9, 'rgba(255, 255, 255, 0)');

	const lineWidth = 0.25;
	const color = gradient;

	for (let y = 0; y < H; y += SPACING) {
		const from = [0, y];
		const to = [W, y];

		drawLine(ctxGhost, from, to, lineWidth, color);
	}
};

drawGrid();

const numLayers = 20;
let phase = PIPI;
const speed = 0.005;

const loop = () => {
	ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

	for (let i = 0; i < numLayers; i++) {
		const percent = i / numLayers;
		const rotation = phase * percent;

		ctx.save();
		ctx.translate(MID_X, MID_Y);

		ctx.rotate(rotation);
		ctx.drawImage(ctxGhost.canvas, -MID_X, -MID_Y);

		ctx.restore();
	}

	phase += speed;

	requestAnimationFrame(loop);
};

loop();
