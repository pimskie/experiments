// https://unsplash.com/photos/AupdmQ4w_M4
// https://unsplash.com/photos/Ny7UDRl2LZY
import Brush from './modules/brush.js';
import { createDripping } from './modules/dripping.js';

const map = (value, start1, stop1, start2, stop2) => ((value - start1) / (stop1 - start1)) * (stop2 - start2) + start2;
const clamp = (value, min, max) => Math.max(min, Math.min(value, max));

const canvas = document.querySelector('.js-canvas');
const ctx = canvas.getContext('2d');

const canvasCursor = document.querySelector('.js-canvas-cursor');
const ctxCursor = canvasCursor.getContext('2d');

let width;
let height;
let brush;
let image;

const from = {};
const to = {};
const target = {};
let drippings = [];
let settings = {};

const loadImage = (url) => {
	const image = new Image();

	return new Promise((resolve, reject) => {
		image.addEventListener('load', e => resolve(e.target));
		image.addEventListener('error', e => reject(new Error('error :(')));

		image.src = url;
	});
};


const clearAll = () => {
	drippings = [];
	clear(ctx);
	clear(ctxCursor);

	drawBackground();
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

	drawBackground();
};

const drawBackground = () => {
	const { width: w1, height: h1 } = image;
	const { width: w2, height: h2 } = canvas;

	let destinationWidth;
	let destinationHeight;

	if (w2 > w1) {
		destinationWidth = w2;
		destinationHeight = h1 * (w2 / w1);
	} else {
		destinationWidth = w1;
		destinationHeight = h1;
	}

	ctx.drawImage(image, 0, 0, destinationWidth, destinationHeight);
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

const setup = async () => {
	image = await loadImage('https://pimskie.dev/public/assets/wall-small.jpg');

	resize();

	// working with hsv color due to dat.GUI
	const types = ['marker', 'spray'];

	settings = {
		size: 40,
		detail: 120,
		color: { h: 0, s: 0, v: 0 },
		type: types[0],
		tipDelay: 0.5,
		clear() { clearAll(); },
	};

	brush = new Brush(canvas, settings);

	const gui = new dat.GUI();

	gui.addColor(settings, 'color').onChange(color => brush.setColor(color));
	gui.add(settings, 'size').min(10).max(50).step(1).onChange(size => brush.setSize(size));
	gui.add(settings, 'detail').min(20).max(300).step(1).onChange(detail => brush.setDetail(detail));
	gui.add(settings, 'type', types).onChange(type => brush.setType(type));
	gui.add(settings, 'clear')

	document.querySelector('.js-ui').appendChild(gui.domElement);

	window.addEventListener('resize', resize);
	canvas.addEventListener('mousemove', onPointerMove);
	canvas.addEventListener('touchmove', onPointerMove);
	canvas.addEventListener('pointerdown', onPointerDown);

	loop();
};

const drawCursor = (position, size, isSprayCan) => {
	clear(ctxCursor);

	ctxCursor.strokeStyle = 'rgba(255, 255, 255, 0.6)';
	ctxCursor.lineWidth = 1;

	ctxCursor.beginPath();
	if (isSprayCan) {
		ctxCursor.arc(position.x, position.y, size, 0, Math.PI * 2);
	} else {
		ctxCursor.rect(position.x - (size), position.y - (size * 0.5), size * 2, size);
	}
	ctxCursor.stroke();
	ctxCursor.closePath();
}

const loop = () => {
	drawCursor(to, brush.size, brush.isSprayCan);

	drippings.forEach(drip => drip.draw(ctx));
	drippings = drippings.filter(drip => !drip.isDead);

	if (!brush.isPainting) {
		requestAnimationFrame(loop);

		return;
	}

	const distance = Math.hypot(to.x - from.x, to.y - from.y);
	const speed = clamp(map(distance, 0, width * 0.2, 0, 1), 0, 1);


	if (brush.isSprayCan) {
		const delay = 2;

		target.x += (to.x - target.x) / delay;
		target.y += (to.y - target.y) / delay;
	} else {
		target.x = to.x;
		target.y = to.y;
	}


	brush.paint(ctx, from, target, speed);


	if (brush.isSprayCan && Math.random() > 0.8 && speed < 0.04) {
		const dripping = createDripping(target, brush.getColor());

		drippings.push(dripping);
	}

	from.x = target.x;
	from.y = target.y;

	requestAnimationFrame(loop);
};

setup();

