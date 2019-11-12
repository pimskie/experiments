const simplex = new SimplexNoise();

const canvas = document.querySelector('.js-canvas');
const ctx = canvas.getContext('2d');

const width = 500;
const height = 500;

canvas.width = width;
canvas.height = height;

let phase = 0;
const phaseSpeed = 0.02;

const numRings = 3;
const dotsPerRing = 9;
const numCircles = numRings * dotsPerRing;

const ease = t => t * (2 - t);
const map = (value, start1, stop1, start2, stop2) => ((value - start1) / (stop1 - start1)) * (stop2 - start2) + start2;
const distanceBetween = (vec1, vec2) => Math.hypot(vec2.x - vec1.x, vec2.y - vec1.y);

const drawDot = (ctx, x, y, dotSize) => {
	const { canvas } = ctx;

	ctx.save();
	ctx.translate(canvas.width * 0.5, canvas.height * 0.5);

	ctx.beginPath();
	ctx.arc(x, y, dotSize, 0, Math.PI * 2);
	ctx.closePath();
	ctx.fill();
	ctx.restore();
};

const connect = (ctx, from, to = []) => {
	to.forEach((t) => {
		ctx.save();
		ctx.translate(canvas.width * 0.5, canvas.height * 0.5);

		ctx.beginPath();
		ctx.strokeStyle = `rgba(255, 0, 0, ${t.percent})`;
		ctx.moveTo(from.x, from.y);
		ctx.lineTo(t.x, t.y);
		ctx.closePath();
		ctx.stroke();
		ctx.restore();
	});
};

const loop = () => {
	ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

	const angleStep = Math.PI * 2 / numCircles;
	const radiusMin = 10;
	const radiusMax = width * 0.45;

	const dots = [];

	for (let i = 0; i < numCircles; i++) {
		const dotOffset = (i % numRings * 2) / (numRings / 2);

		const dotPhase = dotOffset + phase + (i * 0.09);
		const cos = Math.cos(dotPhase);
		const dotAngleNorm = map(cos, -1, 1, 0, 1);
		const tick = ease(dotAngleNorm);

		const dotCircleRadius = radiusMin + (tick * (radiusMax - radiusMin));

		const dotSize = 1 + (8 * Math.abs(dotCircleRadius / radiusMax));

		const angle = angleStep * i;
		const x = Math.cos(angle + (phase * 0.25)) * dotCircleRadius;
		const y = Math.sin(angle + (phase * 0.25)) * dotCircleRadius;

		drawDot(ctx, x, y, dotSize);

		dots.push({ x, y });
	}

	phase += phaseSpeed;

	requestAnimationFrame(loop);
};

loop(0);


