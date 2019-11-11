const simplex = new SimplexNoise();

const canvas = document.querySelector('.js-canvas');
const ctx = canvas.getContext('2d');

const width = 750;
const height = width;

canvas.width = width;
canvas.height = height;

const getHue = () => Math.random() * 360;

const radiusStart = 10;
const radiusMax = width * 0.5;
let radius = radiusStart;
const radiusSpeed = 0.75;

let phase = 0;
const phaseSpeed = 0.01;

let hue = getHue();

const detail = 100;

const drawWaveCircle = (ctx, detail, radius, phase) => {
	const radiusPercent = (radius - radiusStart) / (radiusMax - radiusStart);
	const lightness = 50 + (50 * (1 - radiusPercent));

	const amp = radius * 0.5;

	ctx.save();
	ctx.translate(width * 0.5, height * 0.5);

	ctx.beginPath();
	ctx.strokeStyle = `hsl(${hue}, 100%, ${lightness}%)`;

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

	ctx.restore();
};

const clear = () => {
	ctx.globalCompositeOperation = 'destination-out';
	ctx.fillStyle = 'rgba(0, 0, 0, 0.005)';
	ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
	ctx.globalCompositeOperation = 'lighter';
};

const reset = () => {
	radius = radiusStart;
	hue = getHue();
};

const loop = () => {
	// clear();
	ctx.globalCompositeOperation = 'lighten';

	drawWaveCircle(ctx, detail, radius, phase);

	radius += radiusSpeed;

	if (radius > radiusMax) {
		reset();
	}

	phase += phaseSpeed;

	requestAnimationFrame(loop);
};

loop();


