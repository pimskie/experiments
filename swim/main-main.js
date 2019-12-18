const simplex = new SimplexNoise();

const distanceBetween = (vec1, vec2) => Math.hypot(vec2.x - vec1.x, vec2.y - vec1.y);
const clamp = (value, min, max) => Math.max(min, Math.min(value, max));

const getAngleDifference = (x, y) => Math.atan2(Math.sin(x - y), Math.cos(x - y));
const getAngleBetween = (vec1, vec2) => Math.atan2(vec2.y - vec1.y, vec2.x - vec1.x);

const canvas = document.querySelector('.js-canvas');
const ctx = canvas.getContext('2d');

const TAU = Math.PI * 2;

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

const numPoints = 2;
const radius = 100;

const drawForm = (ctx) => {
	ctx.save();
	ctx.translate(position.x, position.y);

	for (let i = 0; i < numPoints; i++) {
		const angle = TAU / numPoints * i;
		const originalX = Math.cos(angle) * radius;
		const originalY = Math.sin(angle) * radius;

		const pointerDistance = distanceBetween(pointer, { x: originalX, y: originalY });
		const pointerAngle = getAngleBetween(pointer, { x: originalX, y: originalY });
		const force = (pointerDistance / hypot);
		const newX = Math.cos(angle) * (radius * force);
		const newY = originalY;

		ctx.beginPath();
		ctx.strokeStyle = 'black';
		ctx.arc(newX, newY, 5, 0, TAU);
		ctx.closePath();
		ctx.stroke();
	}

	// ctx.beginPath();
	// ctx.strokeStyle = 'black';
	// ctx.moveTo(x, y);
	// ctx.lineTo(trailToX, trailToY);
	// ctx.closePath();
	// ctx.stroke();

	ctx.restore();

};

const loop = () => {
	ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

	drawForm(ctx);

	phase += phaseSpeed;

	requestAnimationFrame(loop);
};

canvas.addEventListener('pointermove', (e) => {
	const target = (e.touches && e.touches.length) ? e.touches[0] : e;

	pointer.x = target.clientX - midX;
	pointer.y = target.clientY - midY;
});
loop();

