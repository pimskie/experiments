/**
 * Times Tables, Mandelbrot and the Heart of Mathematics
 * https://www.youtube.com/watch?v=qhbuKbxJsk8
 */

noise.seed(Math.random());

const canvas = document.querySelector('.js-canvas');
const ctx = canvas.getContext('2d');
const PI2 = Math.PI * 2;

const canvasWidth = 400;
const canvasHeight = canvasWidth;

const diameter = canvasWidth - 10;

const circle = {
	r: diameter * 0.5,
	x: canvasWidth * 0.5,
	y: canvasWidth * 0.5,
};

const tableDefault = 1;
let table = tableDefault;
let tick = 0;

const connect = (indexFrom, indexTo) => {
	if (indexFrom >= options.detail) {
		indexFrom %= options.detail;
	}

	if (indexTo >= options.detail) {
		indexTo %= options.detail;
	}

	const angleStep = PI2 / options.detail;

	const p1 = {
		x: circle.x + (Math.cos(angleStep * indexFrom) * circle.r),
		y: circle.y + (Math.sin(angleStep * indexFrom) * circle.r),
	};
	const p2 = {
		x: circle.x + (Math.cos(angleStep * indexTo) * circle.r),
		y: circle.y + (Math.sin(angleStep * indexTo) * circle.r),
	};

	const dx = p1.x - p2.x;
	const dy = p1.y - p2.y;
	const length = Math.sqrt(dx * dx + dy * dy);
	const perc = length / (circle.r * 2);
	const n = noise.perlin2(tick, tick);

	const hue = (180) + (90 * n) + (90 * perc);
	const alpha = (options.open) ? 1 - perc : perc;

	const color = `hsla(${hue}, 100%, 25%, ${alpha})`;

	ctx.beginPath();
	ctx.strokeStyle = color;
	ctx.moveTo(p1.x, p1.y);
	ctx.lineTo(p2.x, p2.y);
	ctx.stroke();
	ctx.closePath();
};

const loop = () => {
	ctx.clearRect(0, 0, canvasWidth, canvasHeight);

	for (let point = 0; point < options.detail; point++) {
		const sum = options.table * point;
		connect(point, sum);
	}

	if (options.animate) {
		options.table += options.speed * 0.01;
	}

	tick += 0.005;

	requestAnimationFrame(loop);
}

canvas.width = canvasWidth;
canvas.height = canvasHeight;

canvas.addEventListener('click', () => {
	options.animate = !options.animate;
});

const options = {
	detail: 600,
	speed: 0.2,
	open: true,
	animate: true,
	table: tableDefault,
	reset() {
		options.table = tableDefault;
		options.animate = true;
	},
};

const gui = new dat.GUI();
gui.add(options, 'speed', 0, 1).name('mult. speed').listen();
gui.add(options, 'detail', 10, 800).step(1);
gui.add(options, 'open');
gui.add(options, 'table').min(1).max(40).step(0.01).listen();
gui.add(options, 'animate').listen();
gui.add(options, 'reset');

gui.close();

loop();