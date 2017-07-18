// x = sin(t) * (e^cos(t)-2cos(λt)-sin(t/12)^5)
// y = cos(t) * (e^cos(t)-2cos(λt)-sin(t/12)^5).
// https://en.wikipedia.org/wiki/Butterfly_curve_(transcendental)

/* globals dat: false */

const qs = (sel) => document.querySelector(sel);

const canvas = qs('.js-canvas');
const ctx = canvas.getContext('2d');

let canvasWidth = window.innerWidth;
let canvasHeight = window.innerWidth;
let midX = canvasWidth * 0.5;
let midY = canvasHeight * 0.5;

let scale;
let t = 0;
let tick = 0;

const point = {
	x: midX,
	y: midY,
};

const pointOld = {
	x: null,
	y: null,
};

const options = {
	a: 4, // λ
	lint: false,
};

const distanceBetween = (x1, y1, x2, y2) => Math.sqrt((x1 - x2) * (x1 - x2) + (y1 - y2) * (y1 - y2));

const reset = () => {
	canvasWidth = window.innerWidth;
	canvasHeight = window.innerHeight;
	midX = canvasWidth * 0.5;
	midY = canvasHeight * 0.5;

	canvas.width = canvasWidth;
	canvas.height = canvasHeight;

	scale = Math.min(canvasWidth, canvasHeight) / 10;

	pointOld.x = null;
};

const loop = () => {
	const x = Math.sin(t) * ((Math.exp(Math.cos(t))) - (2 * Math.cos(options.a * t)) - (Math.pow(Math.sin(t / 12), 5)));
	const y = Math.cos(t) * ((Math.exp(Math.cos(t))) - (2 * Math.cos(options.a * t)) - (Math.pow(Math.sin(t / 12), 5)));

	point.x = midX + (x * scale);
	point.y = midY + (y * scale);

	const lineWidth = options.lint
		? 0.5 + distanceBetween(pointOld.x, pointOld.y, point.x, point.y) / options.a
		: 1;

	const hueAdjustment = Math.sin(tick);
	const hue = 10 + (200 * hueAdjustment);

	if (pointOld.x) {
		ctx.beginPath();
		ctx.lineCap = 'round';
		ctx.lineWidth = lineWidth;
		ctx.strokeStyle = `hsl(${hue}, 100%, 70%)`;
		ctx.moveTo(pointOld.x, pointOld.y);
		ctx.lineTo(point.x, point.y);
		ctx.stroke();
		ctx.closePath();
	}

	pointOld.x = point.x;
	pointOld.y = point.y;

	tick += 0.002;
	t += 0.15 / options.a;

	requestAnimationFrame(loop);
};

window.addEventListener('resize', reset);

const gui = new dat.GUI();
gui.add(options, 'a').step(0.1).min(1).max(10).onChange(reset);
gui.add(options, 'lint').onFinishChange(reset);
gui.close();

window.addEventListener('resize', reset);
canvas.addEventListener('click', reset);

reset();
loop();