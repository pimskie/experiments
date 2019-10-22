const simplex = new SimplexNoise();

const canvas = document.querySelector('.js-canvas');
const ctx = canvas.getContext('2d');

let width;
let height;
let isPainting = false;
let phase = 0;

const from = {};
const to = {};

const settings = {
	size: 50,
	detail: 200,
	hue: 0,
};

class Brush {
	constructor({ detail, size, hue }) {
		this.detail = detail;
		this.size = size;
		this.hue = hue;


		this.generateDrops(detail);
	}

	generateDrops(detail) {
		this.drops = new Array(detail).fill().map((_, i) => {
			const angle = Math.PI * 2 * Math.random();
			const radius = 2 + (4 * Math.random());
			let length = Math.random();
			let lightness = 40 + (Math.random() * 5);

			if (i  % 20 === 0) {
				length *= 1.2;
			}

			if (i % 5 === 0) {
				lightness *= 0.9;
			}

			if (i % 20 === 0) {
				lightness *= 1.5;
			}

			return { angle, radius, lightness, length };
		});
	}

	paint(ctx, from, to, distance = 0, distortion = 0) {
		const size = this.size + (5 * distance);

		this.drops.forEach(({ angle, radius, lightness, length }, i) => {
			const x = Math.cos(angle);
			const y = Math.sin(angle);

			const growX = distortion * simplex.noise3D(x + phase, x + phase, phase);
			const growY = distortion * simplex.noise3D(y + phase, y + phase, phase);

			const position = {
				x: x * ((size * length) + growX),
				y: y * ((size * length) + growY),
			};

			ctx.strokeStyle = `hsla(0, 100%, ${lightness}%)`;
			ctx.lineWidth = radius;
			ctx.lineCap = 'round';
			ctx.beginPath();
			ctx.moveTo(from.x + position.x, from.y + position.y);
			ctx.lineTo(to.x + position.x, to.y + position.y);
			ctx.stroke();
			ctx.closePath();
		});
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

	brush.generateDrops(brush.detail);
	isPainting = true;
};

const onPointerUp = () => {
	isPainting = false;
};

const onKeyDown = (e) => {
	if (e.code === 'Space') {
		clear(ctx);
	}
};


const setup = () => {
	resize();

	window.addEventListener('resize', resize);
	canvas.addEventListener('mousemove', onPointerMove);
	canvas.addEventListener('touchmove', onPointerMove);
	canvas.addEventListener('pointerdown', onPointerDown);
	canvas.addEventListener('pointerup', onPointerUp);
	document.body.addEventListener('keydown', onKeyDown);
};

const brush = new Brush(settings);

const loop = () => {
	if (!isPainting) {
		requestAnimationFrame(loop);

		return;
	}

	brush.paint(ctx, from, to);

	from.x = to.x;
	from.y = to.y;

	phase += 0.005;

	requestAnimationFrame(loop);
};

setup();
loop();

