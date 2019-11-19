const simplex = new SimplexNoise();

const distanceBetween = (x1, y1, x2, y2) => Math.hypot(x2 - x1, y2 - y1);
const map = (value, start1, stop1, start2, stop2) => ((value - start1) / (stop1 - start1)) * (stop2 - start2) + start2;

const randomHue = () => Math.random() * 360;
const noiseColor = (hue, phase) => `hsl(${hue + (100 * phase)}, 100%, 50%)`;

const canvas = document.querySelector('canvas');
const ctx = canvas.getContext('2d');

const width = 500;
const height = 500;

const midX = width * 0.5;
const midY = height * 0.5;

canvas.width = width;
canvas.height = height;

let phase = Math.PI * 0.5;
const phaseSpeed = 0.009;

const decay = 0.96;
const grow = 1 + (1 - decay);

let lineWidth = 0.5;
let size = 10;
let sizeModifier = grow;
let isOdd = true;
let up = true;

let otherHue = randomHue();
let otherColor = noiseColor();

const clear = (ctx) => {
	ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
};

const reset = () => {
	clear(ctx);

	size = 10;
};

const draw = (ctx, size, lineWidth, color) => {
	ctx.save();
	ctx.fillStyle = color;
	ctx.strokeStyle = color;
	ctx.lineWidth = lineWidth;

	ctx.translate(midX, midY);
	ctx.rotate((Math.PI * 0.25));
	ctx.beginPath();
	ctx.rect(-size * 0.5, -size * 0.5, size, size);
	ctx.stroke();
	ctx.closePath();
	ctx.restore();
};

ctx.globalCompositeOperation = 'source-over';

const loop = () => {

	const noise = simplex.noise2D(size * 0.001, phase);
	const color = isOdd ? '#000' : noiseColor(otherHue, noise);
	const percent = size / width;
	const lineWidth = 1 + (10 * percent);

	const amount = 5 + (10 * (1 - percent));
	if (up) {
		size += amount;
	} else {
		size -= amount;
	}

	draw(ctx, size, lineWidth, color);

	if (size > width || size < 10) {
		up = !up;

		otherHue = randomHue();
	}

	isOdd = !isOdd;
	phase += phaseSpeed;

	requestAnimationFrame(loop);
};

loop();

canvas.addEventListener('click', reset);
