const simplex = new SimplexNoise();

const canvas = document.querySelector('.js-canvas');
const ctx = canvas.getContext('2d');

const TAU = Math.PI * 2;

const width = window.innerWidth;
const height = window.innerHeight;

const midX = width >> 1;
const midY = height >> 1;

canvas.width = width;
canvas.height = height;

let phase = 0;
const phaseSpeed = 0.005;

const numCircles = 20;
const radius = 10;
const radiusMax = 300;
const radiusDecrease = (radiusMax - radius) / numCircles;

const drawPath = (ctx) => {
	ctx.save();
	ctx.translate(midX, midY);

	for (let q = 0; q < numCircles; q++) {
		const circleRadius = radiusMax - (radiusDecrease * q);

		const detail = 10 + (50 * (circleRadius / radiusMax));
		const dotRadius = 5 - (4 * (circleRadius / radiusMax));
		const alpha = 1 / numCircles * q;

		for (let i = 0; i < detail; i++) {
			const angle = (Math.PI * 2 / detail) * i;

			const cos = Math.cos(angle);
			const sin = Math.sin(angle);

			const noise = simplex.noise3D(cos, sin, phase + (q * 0.05));
			const pointRadius = circleRadius + (noise * circleRadius * 0.5);

			const x = cos * pointRadius;
			const y = sin * pointRadius;

			ctx.fillStyle = `rgba(0, 0, 0, ${alpha})`;
			ctx.beginPath();
			ctx.arc(x - dotRadius / 2, y - dotRadius / 2, dotRadius, 0, TAU, false);

			ctx.closePath();
			ctx.fill();
		}
	};

	ctx.restore();

};

const loop = () => {
	ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

	drawPath(ctx);

	phase += phaseSpeed;

	requestAnimationFrame(loop);
};

loop();

