const simplex = new SimplexNoise();

const distanceBetween = (vec1, vec2) => Math.hypot(vec2.x - vec1.x, vec2.y - vec1.y);
const clamp = (value, min, max) => Math.max(min, Math.min(value, max));

const getAngleDifference = (x, y) => Math.atan2(Math.sin(x - y), Math.cos(x - y));
const getAngleBetween = (vec1, vec2) => Math.atan2(vec2.y - vec1.y, vec2.x - vec1.x);

const canvas = document.querySelector('.js-canvas');
const ctx = canvas.getContext('2d');

const TAU = Math.PI * 2;

const padding = 100;
const width = window.innerWidth;
const height = window.innerHeight;

const midX = width >> 1;
const midY = height >> 1;
const hypot = Math.hypot(midX, midY);

canvas.width = width;
canvas.height = height;

let phase = 0;
const phaseSpeed = 0.005;

const pointer = { x: 0, y: 0 };
const position = { x: midX, y: midY };

const numCircles = 1;

const drawForm = (ctx) => {
	const dotRadius = 10;
	const angleDotPointer = getAngleBetween({ x: midX, y: midY }, pointer);
	const trailLength = 20;

	ctx.beginPath();
	ctx.fillStyle = 'black';
	ctx.arc(midX - dotRadius * 0.5, midY - dotRadius * 0.5, dotRadius, 0, TAU, false);
	ctx.fill();
	ctx.closePath();

	const trailToX = midX + (Math.cos(angleDotPointer) * trailLength);
	const trailToY = midY + (Math.sin(angleDotPointer) * trailLength);

	ctx.beginPath();
	ctx.strokeStyle = 'black';
	ctx.moveTo(midX, midY);
	ctx.lineTo(trailToX, trailToY);
	ctx.closePath();
	ctx.stroke();
};

const loop = () => {
	ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

	drawForm(ctx);

	phase += phaseSpeed;

	requestAnimationFrame(loop);
};

canvas.addEventListener('pointermove', (e) => {
	const target = (e.touches && e.touches.length) ? e.touches[0] : e;

	pointer.x = e.clientX;
	pointer.y = e.clientY;
});
loop();

