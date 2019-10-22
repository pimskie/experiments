const simplex = new SimplexNoise();

const canvas = document.querySelector('.js-canvas');
const ctx = canvas.getContext('2d');

let width;
let height;
let isPainting = false;
let brush;

const from = {};
const to = {};

const settings = {
	spread: 50,
	detail: 200,
	hue: 0,
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

	brush = generateBrush(settings);
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

const generateBrush = ({ spread, detail }) => {
	return new Array(detail).fill().map((_, i) => {
		const angle = Math.PI * 2 * Math.random();
		const length = spread * Math.random();
		const radius = 1 + (3 * Math.random());
		let lightness = 40 + (Math.random() * 10);

		if (i % 5 === 0) {
			lightness *= 0.9;
		}

		if (i % 20 === 0) {
			lightness *= 1.5;
		}

		const position = {
			x: Math.cos(angle) * length,
			y: Math.sin(angle) * length,
		};

		return { angle, radius, position, lightness };
	});
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

const draw = (brush, from, to) => {
	brush.forEach(({ position, radius, lightness }) => {
		ctx.strokeStyle = `hsla(0, 100%, ${lightness}%)`;
		ctx.lineWidth = radius;
		ctx.lineCap = 'round';
		ctx.beginPath();
		ctx.moveTo(from.x + position.x, from.y + position.y);
		ctx.lineTo(to.x + position.x, to.y + position.y);
		ctx.stroke();
		ctx.closePath();
	});

};

const loop = () => {
	if (!isPainting) {
		requestAnimationFrame(loop);

		return;
	}

	draw(brush, from, to);

	from.x = to.x;
	from.y = to.y;

	requestAnimationFrame(loop);
};

setup();
loop();


