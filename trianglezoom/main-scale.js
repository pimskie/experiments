const simplex = new SimplexNoise();

const randomBetween = (min, max) => ~~(Math.random() * (max - min) + min);

const randomHue = () => Math.random() * 360;
const noiseColor = (hue, phase) => `hsl(${hue + (80 * phase)}, 100%, 60%)`;

const canvas = document.querySelector('canvas');
const ctx = canvas.getContext('2d');

const width = window.innerWidth;
const height = window.innerHeight;

canvas.width = width;
canvas.height = height;

let phase = Math.PI * 0.5;
const phaseSpeed = 0.005;

let size = 1;
let sides = 4;

let isOdd = true;
let isUp = true;

let otherHue = randomHue();
let otherColor = noiseColor();

const reset = () => {
	ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

	size = 1;
	sides = randomBetween(3, 6);
};

const draw = (ctx, path, lineWidth, color, opacity, phase) => {
	ctx.globalAlpha = opacity;
	ctx.save();
	ctx.fillStyle = color;
	ctx.strokeStyle = color;
	ctx.lineWidth = lineWidth;

	ctx.translate(width >> 1, height >> 1);
	ctx.rotate(phase);
	ctx.beginPath();

	path.forEach(({ x, y }, i) => ctx[i === 0 ? 'moveTo' : 'lineTo'](x, y))

	ctx.closePath();
	ctx.stroke();
	ctx.restore();
};

const getPath = (sides, size) => {
	const step = Math.PI * 2 / sides;

	return new Array(sides).fill().map((_, i) => ({
		x: Math.cos(step * i) * size,
		y: Math.sin(step * i) * size,
	}));
};

const loop = () => {
	ctx.fillStyle = 'rgba(0, 0, 0, 0.005)';
	ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);

	const max = Math.min(width, height);
	const noise = simplex.noise2D(size * 0.001, phase);
	const color = isOdd ? '#000' : noiseColor(otherHue, noise);
	const percent = Math.max(0, size / max);

	const amount = 3 + (4 * (1 - percent));
	const lineWidth = amount * 0.75;

	const path = getPath(sides, size);

	draw(ctx, path, lineWidth, color, 1 - percent, phase);

	if (size > max || size < 0) {
		isUp = !isUp;

		sides = randomBetween(3, 6);
	}

	if (size < 0) {
		otherHue = randomHue();
	}

	isOdd = !isOdd;

	size = isUp
		? size + amount
		: size - amount;

	phase += phaseSpeed;

	requestAnimationFrame(loop);
};

loop();

canvas.addEventListener('click', reset);
