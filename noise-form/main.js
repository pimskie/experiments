const simplex = new SimplexNoise();

const distanceBetween = (vec1, vec2) => Math.hypot(vec2.x - vec1.x, vec2.y - vec1.y);
const angleBetween = (vec1, vec2) => Math.atan2(vec2.y - vec1.y, vec2.x - vec1.x);
const clamp = (value, min, max) => Math.max(min, Math.min(value, max));

const canvas = document.querySelector('.js-canvas');
const ctx = canvas.getContext('2d');

const TAU = Math.PI * 2;

const padding = 100;
const width = window.innerWidth;
const height = window.innerHeight;

const midX = width >> 1;
const midY = height >> 1;

canvas.width = width;
canvas.height = height;

let phase = 0;
const phaseSpeedMin = 0.009;
const phaseSpeedMax = 0.02;
let phaseSpeed = phaseSpeedMin;

const pointer = { x: 0, y: 0 };
const position = { x: midX, y: midY };
let velocity = 0;

const numCircles = 20;
const radius = 10;
const radiusMax = 200;
const radiusDecrease = (radiusMax - radius) / numCircles;

const drawForm = (ctx) => {
	const force = 1 - Math.hypot(position.x - pointer.x, position.y - pointer.y) / Math.hypot(midX, midY);
	velocity += ((force * 2)- velocity) / 2;

	const anglePointer = angleBetween(pointer, position);

	position.x += Math.cos(anglePointer) * velocity;
	position.y += Math.sin(anglePointer) * velocity;

	position.x = clamp(position.x, padding, width - padding);
	position.y = clamp(position.y, padding, height - padding);

	phaseSpeed = phaseSpeedMin + (phaseSpeedMax * force);

	ctx.save();
	ctx.translate(position.x, position.y);

	for (let q = 0; q < numCircles; q++) {
		const circleRadius = radiusMax - (radiusDecrease * q);
		const detail =  10 + (50 * (circleRadius / radiusMax));

		const dotRadius = 5 - (4 * (circleRadius / radiusMax));
		const alpha = 1 / (numCircles - 1 * q);

		for (let i = 0; i < detail; i++) {
			const angleDot = (TAU / detail) * i;
			const cos = Math.cos(angleDot);
			const sin = Math.sin(angleDot);

			const angleDifference = Math.atan2(Math.sin(angleDot - anglePointer), Math.cos(angleDot - anglePointer));
			const angleDifferencePercent = (Math.abs(angleDifference) / Math.PI) * force;

			const noise = simplex.noise3D(cos, sin, phase + (q * 0.05));
			const pointRadiusStart = circleRadius * 0.25;
			const pointRadiusMax = circleRadius * 0.9 * angleDifferencePercent;

			const pointRadius = (pointRadiusStart + pointRadiusMax) + (noise * ((circleRadius * 0.75) * angleDifferencePercent));

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

	drawForm(ctx);

	phase += phaseSpeed;

	requestAnimationFrame(loop);
};

canvas.addEventListener('pointermove', (e) => {
	const target = (e.touches && e.touches.length) ? e.touches[0] : e;

	pointer.x = target.clientX;
	pointer.y = target.clientY;
});
loop();

