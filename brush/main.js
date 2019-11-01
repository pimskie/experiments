// https://unsplash.com/photos/AupdmQ4w_M4
// https://unsplash.com/photos/Ny7UDRl2LZY
import Brush from './modules/brush.js';
import { createDripping } from './modules/dripping.js';
import spraySound from './modules/sound.js';

const map = (value, start1, stop1, start2, stop2) => ((value - start1) / (stop1 - start1)) * (stop2 - start2) + start2;
const clamp = (value, min, max) => Math.max(min, Math.min(value, max));

const canvasPaint = document.querySelector('.js-canvas-paint');
const ctxPaint = canvasPaint.getContext('2d');

const canvasComposition = document.querySelector('.js-canvas-composition');
const ctxComposition = canvasComposition.getContext('2d');

const canvasComposition2 = document.querySelector('.js-canvas-composition-2');
const ctxComposition2 = canvasComposition2.getContext('2d');

const canvasComposition3 = document.querySelector('.js-canvas-composition-3');
const ctxComposition3 = canvasComposition3.getContext('2d');

const canvasCursor = document.querySelector('.js-canvas-cursor');
const ctxCursor = canvasCursor.getContext('2d');

let width;
let height;
let brush;
let imageNormal;
let imageMapThreshold;

const from = {};
const to = {};
const target = {};
let drippings = [];
let settings = {};

const sizeMin = 10;
const sizeMax = 75;
const sizeStart = 50;

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

	[canvasPaint, canvasCursor, canvasComposition, canvasComposition2, canvasComposition3].forEach((canvas) => {
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

	const mid = width * 0.5;
	const amplitude = (x - mid) / mid;
	const panning = amplitude * 0.75;

	spraySound.pan(panning);
};

const onPointerDown = (e) => {
	const { x, y } = getPointerPosition(e);

	from.x = x;
	from.y = y;

	target.x = x;
	target.y = y;

	if (brush.isSprayCan) {
		spraySound.play();
	}
};

const onPointerUp = () => {
	if (brush.isSprayCan) {
		spraySound.stop();
	}
};

const toggleSound = (on) => {
	spraySound.toggle(on);
};

const getBrushSizeRatio = size => (size - sizeMin) / (sizeMax - sizeMin);;

const setup = async () => {
	imageNormal = await loadImage('./wall-small.jpg');
	imageMapThreshold = await loadImage('./wall-threshold-180-levels.png');

	resize();

	const types = ['marker', 'spray'];


	settings = {
		size: sizeStart,
		detail: 120,
		color: { h: 0, s: 1, v: 1 },
		type: types[1],
		tipDelay: 0.5,
		pssssh: true,
		clear() { clearAll(); },
	};

	brush = new Brush(canvasPaint, settings);

	const sizeRatio = getBrushSizeRatio(settings.size);
	spraySound.setFrequency(sizeRatio);

	const gui = new dat.GUI();

	gui.addColor(settings, 'color').onChange(color => brush.setColor(color));
	gui.add(settings, 'size').min(sizeMin).max(sizeMax).step(1).onChange((size) => {
		const ratio = getBrushSizeRatio(size);

		brush.setSize(size);
		spraySound.setFrequency(ratio);
	});

	gui.add(settings, 'detail').min(20).max(300).step(1).onChange(detail => brush.setDetail(detail));
	gui.add(settings, 'type', types).onChange(type => brush.setType(type));
	gui.add(settings, 'pssssh').onChange(toggleSound);
	gui.add(settings, 'clear')

	document.querySelector('.js-ui').appendChild(gui.domElement);

	window.addEventListener('resize', resize);
	canvasPaint.addEventListener('mousemove', onPointerMove);
	canvasPaint.addEventListener('touchmove', onPointerMove);
	canvasPaint.addEventListener('pointerdown', onPointerDown);
	canvasPaint.addEventListener('pointerup', onPointerUp);

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
	clear(ctxComposition3);

	drawBackground(imageMapThreshold, ctxComposition);
	ctxComposition.globalCompositeOperation = 'lighten';
	ctxComposition.drawImage(ctxPaint.canvas, 0, 0);

	drawBackground(imageNormal, ctxComposition2);
	ctxComposition2.drawImage(ctxPaint.canvas, 0, 0);

	ctxComposition2.globalCompositeOperation = 'xor';
	ctxComposition2.drawImage(ctxComposition.canvas, 0, 0);

	drawBackground(imageNormal, ctxComposition3);
	ctxComposition3.drawImage(ctxComposition2.canvas, 0, 0);
};

const loop = () => {
	drawCursor(to, brush.size, brush.isSprayCan);

	drippings.forEach(drip => drip.draw(ctxPaint));
	drippings = drippings.filter(drip => !drip.isDead);

	if (!brush.isPainting) {
		composite();

		requestAnimationFrame(loop);

		return;
	}

	const distance = Math.hypot(to.x - from.x, to.y - from.y);
	const speed = clamp(map(distance, 0, width * 0.15, 0, 1), 0, 1);

	if (brush.isSprayCan) {
		const delay = 2;

		target.x += (to.x - target.x) / delay;
		target.y += (to.y - target.y) / delay;
	} else {
		target.x = to.x;
		target.y = to.y;
	}

	brush.paint(ctxPaint, from, target, speed);

	if (brush.isSprayCan && Math.random() > 0.95 && speed < 0.06) {
		const dripping = createDripping(target, brush.getColor());

		drippings.push(dripping);
	}

	from.x = target.x;
	from.y = target.y;

	composite();

	requestAnimationFrame(loop);
};

setup();
