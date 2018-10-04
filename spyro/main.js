const q = sel => document.querySelector(sel);

const canvas = q('.js-canvas');
const ctx = canvas.getContext('2d');

const canvas2 = q('.js-canvas-2');
const ctx2 = canvas2.getContext('2d');

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

let automate = true;
let phase = 0;

const drawLine = (ctx, color, from, to) => {
	ctx.beginPath();
	ctx.lineWidth = 0.5;
	ctx.strokeStyle = color;
	ctx.moveTo(from.x, from.y);
	ctx.lineTo(to.x, to.y);
	ctx.stroke();
	ctx.closePath();
};

const drawShape = (hue = '0', rotation = 0, percent = 1) => {
	const spacing = wh / steps;
	const scale = 0.1 + (0.9 * (1 - percent));
	const alpha = 0.1 + (0.9 * (1 - percent));

	drawLine(
		ctx,
		`hsla(${hue}, 100%, 50%, 0.5)`,
		{ x: 0, y: hh },
		{ x: wh, y: hh },
	);

	for (let i = 0; i < steps; i++) {
		const lineColor = `hsla(${hue}, 100%, 20%, ${alpha})`;

		const from = { x: spacing * i, y: hh };
		const to = { x: 0, y: i * spacing };

		drawLine(ctx, lineColor, from, to);
	}

	ctx2.save();
	ctx2.translate(wh, hh);
	ctx2.rotate(rotation);
	ctx2.scale(scale, scale);

	const a = (Math.PI * 2) / 4;

	for (let i = 0; i < 4; i++) {
		ctx2.rotate(a);
		ctx2.drawImage(canvas, 0, 0, w, h, 0, -hh, w, h);
	}

	ctx2.restore();
};

const clear = (context) => {
	context.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
};

const draw = () => {
	for (let i = 0; i < shapes; i++) {
		const rotation = phase + ((Math.PI * 4) / shapes) * i * percentY;

		const percent = i / (shapes - 1);
		const hue = 210 + (130 * percent);

		drawShape(hue, rotation, percent);
	}
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

	const x = clientX;
	const y = clientY;

	percentX = x / document.body.offsetWidth;
	percentY = y / document.body.offsetHeight;

	steps = 2 + Math.ceil((MAX_LINES - 2) * percentX);
};

document.body.addEventListener('mousemove', onPointerMove);
document.body.addEventListener('touchmove', onPointerMove);

