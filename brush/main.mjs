import Brush from './modules/brush.js';
import Dripping from './modules/dripping.js';

const canvas = document.querySelector('.js-canvas');
const ctx = canvas.getContext('2d');

const canvasCursor = document.querySelector('.js-canvas-cursor');
const ctxCursor = canvasCursor.getContext('2d');

let width;
let height;
let brush;

const from = {};
const to = {};
const target = {};
let drippings = [];
let settings = {};

const clearAll = () => {
	drippings = [];
	clear(ctx);
	clear(ctxCursor);
};

const clear = (ctx) => {
	ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
};

const getPointerPosition = (event) => {
	const target = (event.touches && event.touches.length) ? event.touches[0] : event;
	const { clientX: x, clientY: y } = target;

	return { x, y };
}

const resize = () => {
	width = window.innerWidth;
	height = window.innerHeight;

	canvas.width = width;
	canvas.height = height;

	canvasCursor.width = width;
	canvasCursor.height = height;
};

const onPointerMove = (e) => {
	const { x, y } = getPointerPosition(e);

	to.x = x;
	to.y = y;
};

const onPointerDown = (e) => {
	const { x, y } = getPointerPosition(e);

	from.x = x;
	from.y = y;

	target.x = x;
	target.y = y;
};

const setup = () => {
	resize();

	// working with hsv color due to dat.GUI
	settings = {
		size: 25,
		detail: 120,
		color: { h: 0, s: 1, v: 1 },
		isSpraying: false,
		tipDelay: 2,
		clear() { clearAll(); },
	};

	brush = new Brush(canvas, settings);

	const gui = new dat.GUI();

	gui.addColor(settings, 'color').onChange(color => brush.setColor(color));
	gui.add(settings, 'tipDelay').min(0).max(7).step(1);
	gui.add(settings, 'size').min(10).max(50).step(1).onChange(size => brush.setSize(size));
	gui.add(settings, 'detail').min(20).max(300).step(1).onChange(detail => brush.setDetail(detail));
	gui.add(settings, 'isSpraying').onChange(s => brush.setSpraying(s));
	gui.add(settings, 'clear')

	document.querySelector('.js-ui').appendChild(gui.domElement);


	window.addEventListener('resize', resize);
	canvas.addEventListener('mousemove', onPointerMove);
	canvas.addEventListener('touchmove', onPointerMove);
	canvas.addEventListener('pointerdown', onPointerDown);
};

const createDripping = (position, color) => {
	const radius = 2 + (3 * Math.random());
	const velocity = 0.25 + (0.75 * Math.random());

	const dripping = new Dripping(position, radius, color, velocity);

	drippings.push(dripping);
};

const drawCursor = (position, size) => {
	clear(ctxCursor);

	ctxCursor.beginPath();
	ctxCursor.strokeStyle = 'rgba(255, 255, 255, 0.6)';
	ctxCursor.lineWidth = 1;
	ctxCursor.arc(position.x, position.y, size, 0, Math.PI * 2);
	ctxCursor.stroke();
	ctxCursor.closePath();
}

const loop = () => {
	drawCursor(to, brush.size);


	drippings.forEach(drip => drip.draw(ctx));
	drippings = drippings.filter(drip => !drip.isDead);

	if (!brush.isPainting) {
		requestAnimationFrame(loop);

		return;
	}

	if (!target.x) {
		target.x = from.x;
		target.y = from.y;
	}

	target.x += (to.x - target.x) / (settings.tipDelay + 1);
	target.y += (to.y - target.y) / (settings.tipDelay + 1);

	if (brush.isSpraying) {
		brush.generateTip();
	}

	brush.paint(ctx, from, target);


	if (Math.random() > 0.85) {
		createDripping(target, brush.getColor());
	}

	from.x = target.x;
	from.y = target.y;

	phase += 0.005;

	requestAnimationFrame(loop);
};

setup();
loop();
