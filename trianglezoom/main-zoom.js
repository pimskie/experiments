const simplex = new SimplexNoise();

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

let phase = 0;
const phaseSpeed = 0.01;

const decay = 0.96;
const grow = 1 + (1 - decay);

let lineWidth = 0.5;
let size = 10;
let sizeModifier = grow;
let isOdd = true;

let otherHue = randomHue();
let otherColor = noiseColor();

const clear = (ctx) => {
	ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
};

const reset = () => {
	clear(ctx);

	otherHue = randomHue();
	sizeModifier = grow;
	size = 10;
};

const draw = (ctx, rotation, size, lineWidth, color) => {
	ctx.save();
	ctx.fillStyle = color;
	ctx.strokeStyle = color;
	ctx.lineWidth = lineWidth;
	ctx.translate(midX, midY);
	ctx.rotate((Math.PI * 0.25) + rotation);
	ctx.beginPath();
	ctx.rect(-size * 0.5, -size * 0.5, size, size);
	ctx.stroke();
	ctx.closePath();
	ctx.restore();
};

const loop = () => {
	for (let i = 0; i < 5; i++) {
		const noise = simplex.noise2D(size * 0.001, phase);
		const color = isOdd ? '#000' : noiseColor(otherHue, noise);

		draw(ctx, 0, size, lineWidth, color);

		size *= sizeModifier;
		lineWidth *= sizeModifier;

		isOdd = !isOdd;
		phase += phaseSpeed;

		if (size > width || size < 1) {
			otherHue = randomHue();
			sizeModifier = sizeModifier === grow ? decay : grow;
		}
	}

	requestAnimationFrame(loop);
};

loop();

canvas.addEventListener('click', reset);
