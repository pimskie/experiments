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
const phaseSpeed = 0.01;

const numCircles = 10;
const detail = 100;

let radius = 10;
const radiusIncrease = 200;
const radiusSpeed = 0.5;

const drawPath = (ctx, detail, radius) => {

	ctx.save();
	ctx.translate(midX, midY);

	const cicles = new Array(numCircles).fill().map((_, q) => {
		const circleRadius = radius + (radiusIncrease / numCircles * q);

		ctx.beginPath();

		for (let i = 0; i < detail; i++) {
			const angle = phase + (Math.PI * 2 / detail) * i;

			const cos = Math.cos(angle);
			const sin = Math.sin(angle);

			const noise = simplex.noise3D(cos, sin, phase + (q * 0.05));
			const pointRadius = circleRadius + (noise * circleRadius * 0.45);

			const x = cos * pointRadius;
			const y = sin * pointRadius;

			const m = i === 0 ? 'moveTo' : 'lineTo';

			ctx[m](x, y);
		}

		ctx.closePath();
		ctx.stroke();

	});

	ctx.restore();

};

const clear = () => {
	ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
};

const loop = () => {
	clear();

	drawPath(ctx, detail, radius);

	phase += phaseSpeed;

	requestAnimationFrame(loop);
};

loop();

