// https://codepen.io/kangax/pen/bhiKl
// https://dev.to/ascorbic/a-more-realistic-html-canvas-paint-tool-313b

const clamp = (value, min, max) => Math.max(min, Math.min(value, max));

const ctx = document.querySelector('.js-canvas').getContext('2d');
const { canvas } = ctx;

let width;
let height;
let isDrawing = false;
let hue = 140;

const brushDetail = 500;

const drops = new Array(brushDetail).fill().map((_, i) => {
	const radius = 1 + (Math.random() * 3);
	const alpha = 0.25 + (Math.random() * 0.1);
	const angle = Math.PI * 2 * Math.random();
	const lightness = 40 + (Math.random() * 10);
	const spread = Math.random();

	return { radius, alpha, angle, spread, lightness };
});

const generateBrush = (drops, size) => {
	const brush = drops.map((drop, i) => {
		const { angle, radius, spread, alpha, lightness } = drop;
		const length = spread * size;

		const position = { x: Math.cos(angle) * length, y: Math.sin(angle) * length };

		return { position, radius, alpha, lightness };
	});

	return brush;
};

const brush = generateBrush(drops, 25);
const from = {};
const to = {};

const clear = (ctx) => {
	ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
};

const draw = (brush, from, to) => {
	brush.forEach((drop) => {
		const { position, radius, alpha, lightness } = drop;
		const dropFromX = position.x + from.x;
		const dropFromY = position.y + from.y;

		const dropToX = position.x + to.x;
		const dropToY = position.y + to.y;

		ctx.save();
		ctx.lineCap = 'round';
		ctx.beginPath();
		ctx.lineWidth = radius;
		ctx.strokeStyle = `hsla(${hue}, 100%, ${lightness}%, ${alpha})`;
		ctx.moveTo(dropFromX, dropFromY);
		ctx.lineTo(dropToX, dropToY);
		ctx.stroke();
		ctx.closePath();
		ctx.restore();

	});
};

const onMouseDown = () => {
	hue = Math.random() * 360;
	isDrawing = true;
};

const onMouseUp = () => {
	isDrawing = false;
};

const onPointerMove = (e) => {
	const target = (e.touches && e.touches.length) ? e.touches[0] : e;
	const { clientX: x, clientY: y } = target;

	from.x = to.x;
	from.y = to.y;

	to.x = x;
	to.y = y;

	if (isDrawing) {
		const distance = Math.hypot(to.y - from.y, to.x - from.y);
		const distanceNorm = clamp((distance / 500), 0, 1);
		const radius = 25 + (25 * distanceNorm);
		const brush = generateBrush(drops, radius);

		draw(brush, from, to);
	}
};

const onKeyDown = (e) => {
	if (e.code === 'Space') {
		clear(ctx);
	}
};

const setSize = () => {
	width = window.innerWidth;
	height = window.innerHeight;

	canvas.width = width;
	canvas.height = height;
};

const setup = () => {
	setSize();

	window.addEventListener('resize', setSize);
	canvas.addEventListener('mousemove', onPointerMove);
	canvas.addEventListener('touchmove', onPointerMove);
	canvas.addEventListener('mousedown', onMouseDown);
	canvas.addEventListener('mouseup', onMouseUp);
	document.body.addEventListener('keydown', onKeyDown);
};


const loop = () => {
	requestAnimationFrame(loop);
};

setup();
loop();
