const simplex = new SimplexNoise();

const canvas = document.querySelector('.js-canvas');
const ctx = canvas.getContext('2d');

const width = window.innerWidth;
const height = window.innerHeight;

canvas.width = width;
canvas.height = height;

const getHue = () => Math.random() * 360;

const radiusMin = 0;
const radiusMax = Math.min(width, height) * 0.33;
let radius = radiusMax;
const radiusSpeed = 0.75;

let phase = 0;
const phaseSpeed = 0.01;

let colorAngle = 0;
const colorSpeed = 10;

const detail = 100;

const drawWaveCircle = (ctx, detail, radius, phase) => {
	const radiusPercent = 1 - (radius - radiusMin) / (radiusMax - radiusMin);
	const lightness = 50 + (50 * radiusPercent);
	const color = `hsla(${colorAngle}, 100%, ${lightness}%, 0.01)`;
	const radiusAmplitude = radius * 0.25;

	ctx.save();
	ctx.translate(width * 0.5, height * 0.5);

	ctx.beginPath();
	ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
	ctx.fillStyle = color;

	new Array(detail).fill().forEach((_, i) => {
		const angle = phase + (Math.PI * 2 / detail) * i;
		const cos = Math.cos(angle);
		const sin = Math.sin(angle);

		const noise = simplex.noise3D(cos, sin, phase);

		const x = cos * (radius + (noise * radiusAmplitude));
		const y = sin * (radius + (noise * radiusAmplitude));

		const m = i === 0 ? 'moveTo' : 'lineTo';

		ctx[m](x, y);
	});

	ctx.closePath();
	ctx.stroke();
	ctx.fill();
	ctx.restore();
};

const reset = () => {
	radius = radiusMax;
};

const loop = () => {
	drawWaveCircle(ctx, detail, radius, phase);

	radius -= radiusSpeed;

	if (radius < radiusMin) {
		reset();
	}

	colorAngle += 0.1;
	phase += phaseSpeed;

	requestAnimationFrame(loop);
};

loop();


