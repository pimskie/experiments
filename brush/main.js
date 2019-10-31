// https://unsplash.com/photos/AupdmQ4w_M4
// https://unsplash.com/photos/Ny7UDRl2LZY
import Brush from './modules/brush.js';
import { createDripping } from './modules/dripping.js';

const map = (value, start1, stop1, start2, stop2) => ((value - start1) / (stop1 - start1)) * (stop2 - start2) + start2;
const clamp = (value, min, max) => Math.max(min, Math.min(value, max));

const canvasPaint = document.querySelector('.js-canvas-paint');
const ctxPaint = canvasPaint.getContext('2d');

const canvasComposition = document.querySelector('.js-canvas-composition');
const ctxComposition = canvasComposition.getContext('2d');

const canvasComposition2 = document.querySelector('.js-canvas-composition-2');
const ctxComposition2 = canvasComposition2.getContext('2d');


const canvasCursor = document.querySelector('.js-canvas-cursor');
const ctxCursor = canvasCursor.getContext('2d');

let width;
let height;
let brush;
let imageNormal;
let imageMapDark;
let imageMapLight;
let imageMapThreshold;

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

	clear(ctxPaint);
	clear(ctxCursor);
	clear(ctxComposition);
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

	[canvasPaint, canvasCursor, canvasComposition, canvasComposition2].forEach((canvas) => {
		canvas.width = width;
		canvas.height = height;
	});
};

const drawBackground = (img, destinationCtx) => {
	const { width: w1, height: h1 } = img;
	const { width: w2, height: h2 } = destinationCtx.canvas;

	let destinationWidth;
	let destinationHeight;

	if (w2 > w1) {
		destinationWidth = w2;
		destinationHeight = h1 * (w2 / w1);
	} else {
		destinationWidth = w1;
		destinationHeight = h1;
	}

	destinationCtx.drawImage(img, 0, 0, destinationWidth, destinationHeight);
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
	// image = await loadImage('https://pimskie.dev/public/assets/wall-small.jpg');
	imageNormal = await loadImage('./wall-small.jpg');
	imageMapDark = await loadImage('./wall-small-curve-black.jpg');
	imageMapLight = await loadImage('./wall-small-curve-white.jpg');
	imageMapThreshold = await loadImage('./wall-small-threshold.jpg');

	resize();

	// working with hsv color due to dat.GUI
	const types = ['marker', 'spray'];
	const compos = ["source-over", "source-in", "source-out", "source-atop", "destination-over", "destination-in", "destination-out", "destination-atop", "lighter", "copy", "xor", "multiply", "screen", "overlay", "darken", "lighten", "color-dodge", "color-burn", "hard-light", "soft-light", "difference", "exclusion", "hue", "saturation", "color", "luminosity"];

	settings = {
		size: 40,
		detail: 120,
		color: { h: 0, s: 0, v: 1 },
		type: types[1],
		composition: compos[17],
		tipDelay: 0.5,
		clear() { clearAll(); },
	};

	brush = new Brush(canvasPaint, settings);

	const gui = new dat.GUI();

	gui.addColor(settings, 'color').onChange(color => brush.setColor(color));
	gui.add(settings, 'size').min(10).max(50).step(1).onChange(size => brush.setSize(size));
	gui.add(settings, 'detail').min(20).max(300).step(1).onChange(detail => brush.setDetail(detail));
	gui.add(settings, 'type', types).onChange(type => brush.setType(type));
	gui.add(settings, 'composition', compos);
	gui.add(settings, 'clear')

	document.querySelector('.js-ui').appendChild(gui.domElement);

	window.addEventListener('resize', resize);
	canvasPaint.addEventListener('mousemove', onPointerMove);
	canvasPaint.addEventListener('touchmove', onPointerMove);
	canvasPaint.addEventListener('pointerdown', onPointerDown);

	loop();
};

const drawCursor = (position, size, isSprayCan) => {
	clear(ctxCursor);

	ctxCursor.strokeStyle = 'rgba(200, 200, 200, 0.6)';
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

const composite = () => {
	clear(ctxComposition);
	clear(ctxComposition2);

	ctxComposition.drawImage(ctxPaint.canvas, 0, 0);
	ctxComposition.globalCompositeOperation = settings.composition;
	ctxComposition.drawImage(imageNormal, 0, 0);
};

const loop = () => {
	// Works best with bright color spray
	// ctx.globalCompositeOperation = 'color';

	// single layer of spray paint
	// ctx.globalCompositeOperation = 'overlay';

	// ctxPaint.globalCompositeOperation = settings.composition;

	drawCursor(to, brush.size, brush.isSprayCan);

	drippings.forEach(drip => drip.draw(ctxPaint));
	drippings = drippings.filter(drip => !drip.isDead);

	if (!brush.isPainting) {
		composite();

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


	brush.paint(ctxPaint, from, target, speed);


	if (brush.isSprayCan && Math.random() > 0.8 && speed < 0.04) {
		const dripping = createDripping(target, brush.getColor());

		drippings.push(dripping);
	}

	from.x = target.x;
	from.y = target.y;

	composite();

	requestAnimationFrame(loop);
};

setup();

document.body.addEventListener('keydown', (e) => {
	if (e.code === 'Space') {
		canvasComposition.classList.toggle('is-see-through');
	}
});
