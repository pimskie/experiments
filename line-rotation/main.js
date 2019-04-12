// https://ptsjs.org/
const TAU = Math.PI * 2;
const PERP = Math.PI / 2;

const w = 750;
const h = 300;
const wh = w * 0.5;
const hh = h * 0.5;
const hypo = Math.hypot(w, h);
const radius = hypo * 0.5;

const canvas = document.querySelector('.js-draw');
const ctx = canvas.getContext('2d');

let mouseAngle = 0;

const points = new Array(100).fill().map(() => ({
	r: 50 + Math.random() * (wh - 50),
	a: Math.random() * TAU,
	s: 0.0005 + (Math.random() * 0.0005),
}));

canvas.width = w;
canvas.height = h;

let phase = 0;
const numLines = 100;
const speed = 0.005;

const from = { x: 0, y: hh };
const to = { x: w, y: 350 };
const point = { x: 300, y: 150 };

const drawLine = (from, to) => {
	ctx.beginPath();
	ctx.moveTo(from.x, from.y);
	ctx.lineTo(to.x, to.y);
	ctx.stroke();
	ctx.closePath();
};

const drawPoint = (point) => {
	point.a += point.s;
	point.x = wh + (Math.cos(point.a) * point.r);
	point.y = hh + (Math.sin(point.a) * point.r);

	const denominator = Math.hypot(to.x - from.x, to.y - from.y);
	const numerator = ((to.y - from.y) * point.x) - ((to.x - from.x) * point.y) + (to.x * from.y) - (to.y * from.x);
	const distance = numerator / denominator;
	const angle = Math.atan2(to.y - from.y, to.x - from.x);
	const anglePerp = angle + PERP;

	const toX = point.x + (Math.cos(anglePerp) * distance);
	const toY = point.y + (Math.sin(anglePerp) * distance);

	ctx.beginPath();
	ctx.arc(point.x, point.y, 2, 0, TAU);
	ctx.fill();
	ctx.closePath();

	drawLine(point, { x: toX, y: toY });
};

const loop = () => {
	ctx.clearRect(0, 0, w, h);

	from.x = wh + (Math.cos(mouseAngle) * radius);
	from.y = hh + (Math.sin(mouseAngle) * radius);
	to.x = wh + (Math.cos(mouseAngle + Math.PI) * radius);
	to.y = hh + (Math.sin(mouseAngle + Math.PI) * radius);

	points.forEach(drawPoint);

	phase += speed;

	requestAnimationFrame(loop);
};


loop();

canvas.addEventListener('mousemove', (e) => {
	const left = e.clientX - e.target.offsetLeft;
	const percentage = (left - wh) / wh;

	mouseAngle = (Math.PI / 2) + (Math.PI / 2) * percentage;
});
