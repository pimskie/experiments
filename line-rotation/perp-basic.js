// https://ptsjs.org/

const TAU = Math.PI * 2;
const PERP = Math.PI / 2;

const w = 500;
const h = 500;
const wh = w >> 1;
const hh = h >> 1;
const hypo = Math.hypot(w, h);

const ctx = document.querySelector('.js-draw').getContext('2d');

const numLines = 100;
const speed = 0.001;

let lines = [];
let phase = 0;

ctx.canvas.width = w;
ctx.canvas.height = h;


const from = { x: 10, y: 10 };
const to = { x: 400, y: 350 };

const point = {x: 300, y: 150 };

const drawLine = (from, to) => {
	ctx.beginPath();
	ctx.moveTo(from.x, from.y);
	ctx.lineTo(to.x, to.y);
	ctx.stroke();
	ctx.closePath();
};

const getSlope = (from, to) => {
	const m = (to.y - from.y) / (to.x - from.x);

	return m;
};

const getYIntercept = (x, y, m) => {
	// y = mx + c
	// y = m * x + c
	// c = y - (m * x)

	return y - (m * x);
};

const getSlopeInterceptForm = (x, m, b) => {
	return (m * x) + b;
}

const m = getSlope(from, to);
const b = getYIntercept(to.x, to.y, m);

const denominator = Math.hypot(to.x - from.x, to.y - from.y);
const numerator = ((to.y - from.y) * point.x) - ((to.x - from.x) * point.y) + (to.x * from.y) - (to.y * from.x);
const distance = numerator / denominator;
const angle = Math.atan2(to.y - from.y, to.x - from.x);
const anglePerp = angle + PERP;

const toX = point.x + (Math.cos(anglePerp) * distance);
const toY = point.y + (Math.sin(anglePerp) * distance);

drawLine(from, to);
drawLine(point, { x: toX, y: toY });

ctx.beginPath();
ctx.arc(point.x, point.y, 5, 0, TAU);
ctx.fill();
ctx.closePath();



// ax + by + 0 = 0;
