const simplex = new SimplexNoise();

const canvas = document.querySelector('.js-canvas');
const ctx = canvas.getContext('2d');

const width = 750;
const height = width;

canvas.width = width;
canvas.height = height;

const getHue = () => Math.random() * 360;

const radiusMin = 10;
const radiusMax = width * 0.5;
let radius = radiusMax;
const radiusSpeed = 0.75;

let phase = 0;
const phaseSpeed = 0.01;

let hue = getHue();

const detail = 100;

const drawWaveCircle = (ctx, detail, radius, phase) => {
	const radiusPercent = (radius - radiusMin) / (radiusMax - radiusMin);
	const lightness = 100 - (100 * (1 - radiusPercent));
	const color = `hsl(${hue}, 100%, ${lightness}%)`;
	const amp = radius * 0.5;

	ctx.save();
	ctx.translate(width * 0.5, height * 0.5);

	ctx.beginPath();
	ctx.strokeStyle = color;
	ctx.fillStyle = color;

	new Array(detail).fill().forEach((_, i) => {
		const angle = phase + (Math.PI * 2 / detail) * i;
		const cos = Math.cos(angle);
		const sin = Math.sin(angle);

		const noise = simplex.noise3D(cos, sin, phase);

		const x = cos * (radius + (noise * amp));
		const y = sin * (radius + (noise * amp));

		const m = i === 0 ? 'moveTo' : 'lineTo';

		ctx[m](x, y);
	});

	ctx.closePath();
	ctx.stroke();
	// ctx.fill();
	ctx.restore();
};

const clear = () => {
	ctx.globalCompositeOperation = 'destination-out';
	ctx.fillStyle = 'rgba(0, 0, 0, 0.005)';
	ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
	ctx.globalCompositeOperation = 'lighter';
};

const reset = () => {
	radius = radiusMax;
	hue = getHue();
};

const loop = () => {
	// clear();
	ctx.globalCompositeOperation = 'multiply';

	drawWaveCircle(ctx, detail, radius, phase);

	radius -= radiusSpeed;

	if (radius < radiusMin) {
		reset();
	}

	phase += phaseSpeed;

	requestAnimationFrame(loop);
};

loop();


