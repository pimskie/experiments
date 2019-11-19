const simplex = new SimplexNoise();

const randomBetween = (min, max) => ~~(Math.random() * (max - min) + min);
const randomHue = () => Math.random() * 180;
const randomRotation = () => Math.random() * Math.PI * 2;

const canvas = document.querySelector('canvas');
const ctx = canvas.getContext('2d');

const width = window.innerWidth;
const height = window.innerHeight;

canvas.width = width;
canvas.height = height;

let numSides = randomBetween(3, 6);
const amplitude = width * 0.25;
const position = { x: 0, y: 0 };

const minSize = 50;
let destination = 0;

const maxVelocity = 10;
const force = 2;
let velocity = 0;

let hue = randomHue();
let rotation = randomRotation();

let phase = 0 ;
const phaseSpeed = 0.007;

const getPath = (sides, size) => {
	const step = Math.PI * 2 / sides;

	return new Array(sides).fill().map((_, i) => ({
		x: Math.cos(step * i) * size,
		y: Math.sin(step * i) * size,
	}));
};

const draw = (ctx, path, lineWidth, color, rotation) => {
	ctx.save();
	ctx.fillStyle = color;
	ctx.strokeStyle = color;
	ctx.lineWidth = lineWidth;

	ctx.translate(width >> 1, height >> 1);
	ctx.rotate(rotation);
	ctx.beginPath();

	path.forEach(({ x, y }, i) => ctx[i === 0 ? 'moveTo' : 'lineTo'](x, y))

	ctx.closePath();
	ctx.stroke();
	ctx.restore();
};

const clear = (ctx) => {
	ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
	ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
};

const loop = () => {
	clear(ctx);

	const path = getPath(numSides, position.x);
	const noise = simplex.noise2D(phase, phase);
	const color = `hsl(${hue + (180 * noise)}, 100%, 50%)`;

	velocity *= 0.98;

	destination = minSize + (amplitude * (velocity / maxVelocity));
	position.x += (destination - position.x) / 1.2;

	draw(ctx, path, 1, color, rotation + phase);

	phase += phaseSpeed;

	requestAnimationFrame(loop);
};

loop();

canvas.addEventListener('click', () => {
	velocity += force;

	hue = randomHue();
	rotation = randomRotation();
	numSides = randomBetween(3, 6);
});
