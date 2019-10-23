const simplex = new SimplexNoise();

const canvas = document.querySelector('.js-canvas');
const ctx = canvas.getContext('2d');

let width;
let height;
let brush;
let phase = 0;

const from = {};
const to = {};
const target = {};
let drippings = [];

const HSVToHSL = ({ h, s, v }) => {
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

	cancel() {
		cancelAnimationFrame(this.rafId);
	}
}

class Brush {
	constructor(canvas, { detail, size, color, isSpraying }) {
		this.isPainting = false;
		this.lastPosition = {};

		this.setDetail(detail);
		this.setSize(size);
		this.setColor(color);
		this.setSpraying(isSpraying);

		this.initEvents(canvas);
	}

	setSize(size) {
		this.size = size;

		this.generateDrops(this.detail);
	}

	setDetail(detail) {
		this.detail = detail;

		this.generateDrops(detail);
	}

	setSpraying(spraying) {
		this.isSpraying = spraying;
	}

	// https://workshop.chromeexperiments.com/examples/gui/#4--Color-Controllers
	setColor(hsvColor) {
		const { h, s, l } = HSVToHSL(hsvColor);

		this.hue = h;
		this.saturation = s * 100;
		this.lightness = l * 100;
	}

	generateDrops() {
		this.drops = new Array(this.detail).fill().map((_, i) => {
			const angle = Math.PI * 2 * Math.random();
			const radius = 2 + (4 * Math.random());
			const noise = simplex.noise2D(i, i);
			const noiseAmplitude = this.isSpraying ? 2 : 10;
			const lightness = noise * noiseAmplitude;
			let amplitude = Math.random();

			if (i % 20 === 0) {
				amplitude *= 1.2;
			}

			return { angle, radius, lightness, amplitude };
		});
	}

	initEvents(canvas) {
		canvas.addEventListener('pointerdown', e => this.onPointerDown(e));
		canvas.addEventListener('pointerup', e => this.onPointerUp(e));
	}

	onPointerDown() {
		this.generateDrops(this.detail);

		this.isPainting = true;
	}

	onPointerUp() {
		this.isPainting = false;
	}

	paint(ctx, from, to, distance = 0) {
		const brushSize = this.size + (5 * distance);

		this.drops.forEach((drop, i) => this.paintDrop(ctx, drop, i, from, to, brushSize));

		if (this.isSpraying && Math.random() > 0.1) {
			const angle = Math.PI * 2 * Math.random();
			const length = this.size * (1.5 + (Math.random() * 0.75));
			const radius = 1 + Math.random();

			ctx.fillStyle = this.getColor();
			ctx.lineWidth = radius;
			ctx.lineCap = 'round';

			ctx.beginPath();
			ctx.arc(to.x + (Math.cos(angle) * length), to.y + (Math.sin(angle) * length), radius, 0, Math.PI * 2, false);
			ctx.fill();
			ctx.closePath();
		}

		this.lastPosition = to;
	}

	paintDrop(ctx, drop, index, from, to, brushSize) {
		const { angle, radius, lightness, amplitude } = drop;

		const x = Math.cos(angle);
		const y = Math.sin(angle);

		const position = {
			x: x * brushSize * amplitude,
			y: y * brushSize * amplitude,
		};

		ctx.strokeStyle = this.getColor(lightness);
		ctx.lineWidth = radius;
		ctx.lineCap = 'round';

		ctx.beginPath();
		ctx.moveTo(from.x + position.x, from.y + position.y);
		ctx.lineTo(to.x + position.x, to.y + position.y);
		ctx.stroke();
		ctx.closePath();
	}

	getColor(lightnessModifier = 0) {
		return `hsla(${this.hue}, ${this.saturation}%, ${this.lightness + lightnessModifier}%, 0.5)`;
	}
}

const clear = (ctx) => {
	drippings = [];
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
	const settings = {
		size: 25,
		detail: 120,
		color: { h: 0, s: 1, v: 1 },
		isSpraying: false,
		clear() { clear(ctx); },
	};

	brush = new Brush(canvas, settings);

	const gui = new dat.GUI();

	gui.addColor(settings, 'color').onChange(color => brush.setColor(color));
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

const loop = () => {
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

	target.x += (to.x - target.x) / 2;
	target.y += (to.y - target.y) / 2;

	if (brush.isSpraying) {
		brush.generateDrops();
	}

	brush.paint(ctx, from, target);

	if (Math.random() > 0.75) {
		createDripping(target, brush.getColor());
	}

	from.x = target.x;
	from.y = target.y;

	phase += 0.005;

	requestAnimationFrame(loop);
};

setup();
loop();

