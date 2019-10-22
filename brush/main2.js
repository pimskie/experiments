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

class Brush {
	constructor(canvas, { detail, size, color }) {
		this.isPainting = false;

		this.setDetail(detail);
		this.setSize(size);
		this.setColor(color);

		this.initEvents(canvas);
	}

	setSize(size) {
		this.size = size;
	}

	setDetail(detail) {
		this.detail = detail;

		this.generateDrops(detail);
	}

	// https://workshop.chromeexperiments.com/examples/gui/#4--Color-Controllers
	setColor({ h, s, v }) {
		this.hue = h;
		this.saturation = s * 100;
		this.lightness = v * 100;
	}

	generateDrops(detail) {
		this.drops = new Array(detail).fill().map((_, i) => {
			const angle = Math.PI * 2 * Math.random();
			const radius = 2 + (4 * Math.random());
			let length = Math.random();
			let lightness = simplex.noise2D(i, i) * 10;

			if (i  % 20 === 0) {
				length *= 1.2;
			}

			return { angle, radius, lightness, length };
		});
	}

	initEvents(canvas) {
		canvas.addEventListener('pointerdown', e => this.onPointerDown(e));
		canvas.addEventListener('pointerup', e => this.onPointerUp(e));
	}

	onPointerDown() {
		this.isPainting = true;
	}

	onPointerUp() {
		this.isPainting = false;
	}

	paint(ctx, from, to, distance = 0) {
		const brushSize = this.size + (5 * distance);

		this.drops.forEach(drop => this.paintDrop(ctx, drop, from, to, brushSize));
	}

	paintDrop(ctx, drop, from, to, brushSize) {
		const { angle, radius, lightness, length } = drop;

		const x = Math.cos(angle);
		const y = Math.sin(angle);

		const position = {
			x: x * brushSize * length,
			y: y * brushSize * length,
		};

		ctx.strokeStyle = `hsla(${this.hue}, ${this.saturation}%, ${this.lightness + lightness}%, 1)`;
		ctx.lineWidth = radius;
		ctx.lineCap = 'round';

		ctx.beginPath();
		ctx.moveTo(from.x + position.x, from.y + position.y);
		ctx.lineTo(to.x + position.x, to.y + position.y);
		ctx.stroke();
		ctx.closePath();
	}
}

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

	brush.generateDrops(brush.detail);
};

const setup = () => {
	resize();

	const settings = { size: 50, detail: 200, color: { h: 0, s: 0, v: 1 }, clear() { clear(ctx); }, };

	brush = new Brush(canvas, settings);

	const gui = new dat.GUI();

	gui.addColor(settings, 'color').onChange(color => brush.setColor(color));
	gui.add(settings, 'size').min(1).max(50).step(1).onChange(size => brush.setSize(size));
	gui.add(settings, 'detail').min(20).max(300).step(1).onChange(detail => brush.setDetail(detail));
	gui.add(settings, 'clear')

	document.querySelector('.js-ui').appendChild(gui.domElement);


	window.addEventListener('resize', resize);
	canvas.addEventListener('mousemove', onPointerMove);
	canvas.addEventListener('touchmove', onPointerMove);
	canvas.addEventListener('pointerdown', onPointerDown);
};

const loop = () => {
	if (!brush.isPainting) {
		requestAnimationFrame(loop);

		return;
	}

	if (!target.x) {
		target.x = from.x;
		target.y = from.y;
	}

	target.x += (to.x - target.x) / 3;
	target.y += (to.y - target.y) / 3;

	target.x = to.x;
	target.y = to.y;

	brush.paint(ctx, from, target);

	from.x = target.x;
	from.y = target.y;

	phase += 0.005;

	requestAnimationFrame(loop);
};

setup();
loop();

