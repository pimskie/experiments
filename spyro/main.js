const q = sel => document.querySelector(sel);

const canvas = q('.js-canvas');
const ctx = canvas.getContext('2d');

const canvas2 = q('.js-canvas-2');
const ctx2 = canvas2.getContext('2d');

const PI2 = Math.PI * 2;

const w = 500;
const h = 500;
const wh = w * 0.5;
const hh = h * 0.5;

canvas.width = canvas2.width = w;
canvas.height = canvas2.height = h;

const MAX_LINES = 100;
const MAX_SHAPES = 10;

let steps = MAX_LINES;
let shapes = MAX_SHAPES;

let percentX = 1;
let percentY = 1;

let phase = 0;

const drawLine = (from, to) => {
	ctx.beginPath();
	ctx.lineWidth = 0.5;
	ctx.moveTo(from.x, from.y);
	ctx.lineTo(to.x, to.y);
	ctx.stroke();
	ctx.closePath();
};


const clear = (context) => {
	context.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
};

const draw = () => {
	const spacing = wh / steps;
	const dups = shapes * 4;

	for (let i = 0; i < steps; i++) {
		// horizontal
		const from = {
			x: i * spacing,
			y: hh,
		};

		// vertical
		const to = {
			x: 0,
			y: i * spacing,
		};

		drawLine(from, to);
	}

	ctx2.save();
	ctx2.translate(wh, hh);

	ctx2.rotate(phase);

	for (let i = 0; i < shapes; i++) {
		const angle = ((Math.PI * 2) / shapes) * percentY;
		const scale = 1 - (1 / shapes);

		ctx2.rotate(angle);
		ctx2.scale(scale, scale);

		for (let q = 0; q < 4; q++) {
			const a = (Math.PI * 2) / 4;

			ctx2.rotate(a);
			ctx2.drawImage(canvas, 0, 0, w, h, 0, -hh, w, h);
		}
	}

	ctx2.restore();
};

const loop = () => {
	clear(ctx);
	clear(ctx2);

	draw();

	phase += 0.002;

	requestAnimationFrame(loop);
};

loop();

const onPointerMove = (e) => {
	const event = (e.touches && e.touches.length) ? e.touches[0] : e;
	const { clientX, clientY } = event;

	const x = clientX - e.target.offsetLeft;
	const y = clientY - e.target.offsetTop;

	percentX = x / canvas.width;
	percentY = y / canvas.height;

	steps = 2 + Math.ceil((MAX_LINES - 2) * percentX);
	// shapes = 1 + Math.ceil((MAX_SHAPES - 1) * percentY);
};

canvas.addEventListener('mousemove', onPointerMove);
canvas.addEventListener('touchmove', onPointerMove);

