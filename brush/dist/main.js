/**
 * Photo by Dave Webb on Unsplash
 * https://unsplash.com/photos/eWGE33JU5Ko
 */

const hsvToHsl = ({ h, s, v }) => {
	// both hsv and hsl values are in [0, 1]
	var l = (2 - s) * v / 2;

	if (l != 0) {
		if (l == 1) {
			s = 0;
		} else if (l < 0.5) {
			s = s * v / (l * 2);
		} else {
			s = s * v / (2 - l * 2);
		}
	}

	return { h, s, l };
}

class Brush {
	constructor(canvas, { type = 'marker', markerDetail, size, color }) {
		this.isPainting = false;

		this.setType(type);
		this.setDetail(markerDetail);
		this.setSize(size);
		this.setColor(color);

		this.initEvents(canvas);
	}

	get isSprayCan() {
		return this.type === 'spray';
	}

	setSize(size) {
		this.size = size;

		this.generateTip();
	}

	setDetail(detail) {
		this.detail = detail;

		this.generateTip();
	}

	setType(type) {
		this.type = type;
	}

	// https://workshop.chromeexperiments.com/examples/gui/#4--Color-Controllers
	setColor(hsvColor) {
		const { h, s, l } = hsvToHsl(hsvColor);

		this.hue = h;
		this.saturation = s * 100;
		this.lightness = l * 100;
	}

	generateTip(speed = 0) {
		this.tip = this.type === 'marker'
			? this.createMarkerTip()
			: this.createSprayTip(speed);
	}

	createMarkerTip() {
		const width = this.size * 2;
		const widthHalf = width * 0.5;
		const height = this.size;
		const heightHalf = height * 0.5;

		const tip = new Array(this.detail).fill().map((_, i) => {
			const lightness = this.getPointLightness();
			const radius = 1 + (1 * Math.random());

			const point = {
				position: {
					x: (Math.random() * width) - widthHalf,
					y: (Math.random() * height) - heightHalf,
				},
				radius,
				lightness,
			};

			return point;
		});

		return tip;
	}

	createSprayTip(speed = 0) {
		const maxGrow = this.size * 4;

		return new Array(1).fill().map((_, i) => {
			const radiusIncrease = maxGrow * speed;
			const radiusIncreasePercent = radiusIncrease / maxGrow;
			const radius = this.size + radiusIncrease;

			const alpha = 1 - (speed * 0.95);
			const blur = 40 * radiusIncreasePercent;

			const angle = Math.PI * 2 * Math.random();

			const position = {
				x: Math.cos(angle),
				y: Math.sin(angle),
			};

			return { position, radius, alpha, blur };
		});
	}

	initEvents(canvas) {
		canvas.addEventListener('pointerdown', e => this.onPointerDown(e));
		canvas.addEventListener('pointerup', e => this.onPointerUp(e));
	}

	onPointerDown() {
		this.generateTip();

		this.isPainting = true;
	}

	onPointerUp() {
		this.isPainting = false;
	}

	paint(ctx, from, to, speed = 0) {
		this.tip.forEach((drop, i) => this.paintDrop(ctx, drop, from, to));

		if (this.type === 'spray') {
			if (Math.random() > 0.25) {
				this.paintDiffuse(ctx, to);
			}

			this.generateTip(speed);
		}
	}

	paintDrop(ctx, drop, from, to) {
		const { position, radius, lightness, alpha = 1, blur = 0 } = drop;

		ctx.save();

		if (this.type === 'marker') {
			const color = this.getColor(lightness, 1);

			ctx.strokeStyle = color;
			ctx.fillStyle = color;
			ctx.lineWidth = radius * 2;
			ctx.lineCap = 'round';

			ctx.beginPath();
			ctx.moveTo(from.x + position.x, from.y + position.y);
			ctx.lineTo(to.x + position.x, to.y + position.y);
			ctx.stroke();
			ctx.closePath();
		} else {
			const x = to.x + position.x;
			const y = to.y + position.y;
			const colorFrom = this.getColor(lightness, alpha);
			const colorTo = this.getColor(lightness, 0);
			const gradient = ctx.createRadialGradient(x, y, radius * 0.5, x, y, radius);

			gradient.addColorStop(0, colorFrom);
			gradient.addColorStop(1, colorTo);
			ctx.fillStyle = gradient;

			ctx.filter = `blur(${blur}px)`;
			ctx.beginPath();
			ctx.arc(x, y, radius, 0, Math.PI * 2);
			ctx.fill();
			ctx.closePath();
		}

		ctx.restore();

	}

	paintDiffuse(ctx, position) {
		const angle = Math.PI * 2 * Math.random();
		const length = this.size * (1.5 + (Math.random() * 0.75));
		const radius = 1 + Math.random();
		const alpha = 0.5 + (Math.random() * 0.5);

		ctx.fillStyle = this.getColor(0, alpha);
		ctx.lineWidth = radius;
		ctx.lineCap = 'round';

		ctx.beginPath();
		ctx.arc(position.x + (Math.cos(angle) * length), position.y + (Math.sin(angle) * length), radius, 0, Math.PI * 2, false);
		ctx.fill();
		ctx.closePath();
	}

	getColor(lightnessModifier = 0, alpha = 1) {
		return `hsla(${this.hue}, ${this.saturation}%, ${this.lightness + lightnessModifier}%, ${alpha})`;
	}

	getPointLightness() {
		const noise = -1 + (Math.random() * 2);
		const lightness = noise * 5;

		return lightness;
	}
}

class Dripping {
	constructor(position, size, color, velocity) {
		this.from = {
			x: position.x,
			y: position.y,
		};

		this.color = color;
		this.size = size;
		this.velocity = velocity;

		this.isDead = false;
	}

	draw(ctx) {
		const toX = this.from.x;
		const toY = this.from.y + this.velocity;

		ctx.beginPath();
		ctx.strokeStyle = this.color;
		ctx.fillStyle = this.color;
		ctx.lineWidth = this.size;
		ctx.lineCap = 'round';

		ctx.moveTo(this.from.x, this.from.y);
		ctx.lineTo(toX, toY);
		ctx.stroke();
		ctx.closePath();

		this.from.x = toX;
		this.from.y = toY;

		this.velocity *= 0.99;

		if (this.velocity < 0.1) {
			this.isDead = true;
		}
	}
}

const createDripping = (position, color) => {
	const radius = 2 + (3 * Math.random());
	const velocity = 0.25 + (0.75 * Math.random());

	return new Dripping(position, radius, color, velocity);
};


class SpraySound {
	constructor() {
		this.audioCtx = new AudioContext();
		this.destination = this.audioCtx.destination;

		this.volume = this.audioCtx.createGain();
		this.volume.gain.value = 0.8;

		this.bandpass = this.audioCtx.createBiquadFilter();
		this.bandpass.type = 'bandpass';

		this.bandpass.frequency.value = 2500;

		this.panner = this.audioCtx.createStereoPanner();

		this.volume
			.connect(this.panner)
			.connect(this.destination);
	}

	get time() {
		return this.audioCtx.currentTime;
	}

	play() {
		const { sampleRate } = this.audioCtx;
		const bufferSize = sampleRate * 1;

		let b0, b1, b2, b3, b4, b5, b6;
		b0 = b1 = b2 = b3 = b4 = b5 = b6 = 0.0;

		const buffer = this.audioCtx.createBuffer(1, bufferSize, sampleRate);
		const data = buffer.getChannelData(0);

		for (let i = 0; i < bufferSize; i++) {
			const white = Math.random() * 2 - 1;

			b0 = 0.99886 * b0 + white * 0.0555179;
			b1 = 0.99332 * b1 + white * 0.0750759;
			b2 = 0.96900 * b2 + white * 0.1538520;
			b3 = 0.86650 * b3 + white * 0.3104856;
			b4 = 0.55000 * b4 + white * 0.5329522;
			b5 = -0.7616 * b5 - white * 0.0168980;

			data[i] = b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362;
			data[i] *= 0.11;

			b6 = white * 0.115926;
		}

		this.source = this.audioCtx.createBufferSource();
		this.source.buffer = buffer;

		this.connectAndPlay();
	};

	connectAndPlay() {
		this.source.loop = true;

		this.source
			.connect(this.bandpass)
			.connect(this.volume);

		this.source.start();

		this.volume.gain.setValueAtTime(0, this.time);
		this.volume.gain.linearRampToValueAtTime(0.1, this.time + 0.25);
	}

	stop() {
		this.volume.gain.linearRampToValueAtTime(0, this.time + 0.25);
	}

	pan(amount) {
		this.panner.pan.linearRampToValueAtTime(amount, this.time + 0.25)
	}

	setFrequency(ratio) {
		// ratio 0: small spray, 1: large spray
		// frequency 2500: small spray, 1500: large spray

		const start = 2500;
		const end = 1200;
		const diff = end - start;
		const freq = start + (diff * ratio);

		this.bandpass.frequency.setValueAtTime(freq, this.time);
	}

	toggle(on) {
		if (on) {
			this.volume.connect(this.destination);
		} else {
			this.volume.disconnect();
		}
	}
}


const spraySound = new SpraySound();

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
const sizeStart = 30;

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
	imageNormal = await loadImage('//pimskie.dev/public/assets/wall-2.jpg');
	imageMapThreshold = await loadImage('//pimskie.dev/public/assets/wall-2-threshold-215-levels.png');

	resize();

	const types = ['marker', 'spray'];

	settings = {
		size: sizeStart,
		markerDetail: 120,
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

	gui.add(settings, 'markerDetail').min(20).max(300).step(1).onChange(detail => brush.setDetail(detail));
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

	if (brush.isSprayCan && Math.random() > 0.96 && speed < 0.06) {
		const dripping = createDripping(target, brush.getColor());

		drippings.push(dripping);
	}

	from.x = target.x;
	from.y = target.y;

	composite();

	requestAnimationFrame(loop);
};

setup();
