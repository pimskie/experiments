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

const minSize = 50;
let size = 50;
let destination = 0;

const maxVelocity = 10;
const force = 2;
let velocity = 0;

let hue = randomHue();
let rotation = randomRotation();

let phase = 0;
const phaseSpeed = 0.007;

let clickTimeoutId = null;
let impulseIntervalId = null;

let particles = [];

const clicker = {
	clicks: [],

	reset() {
		this.clicks = [];
	},

	add() {
		if (this.timeDifference() > 1000) {
			this.reset();
		}

		if (this.clicks.length === 10) {
			this.reset();
		}

		this.clicks.push(performance.now());
	},

	timeDifference() {
		if (this.clicks.length < 2) {
			return 0;
		}

		const last = this.clicks[this.clicks.length - 1];
		const secondLast = this.clicks[this.clicks.length - 2];

		return last - secondLast;
	},

	avgTime() {
		return this.timeDifference() / this.clicks.length;
	}
};

const getPath = (sides, size) => {
	const step = Math.PI * 2 / sides;

	return new Array(sides).fill().map((_, i) => ({
		x: Math.cos(step * i) * size,
		y: Math.sin(step * i) * size,
	}));
};

const addForce = () => {
	velocity += force;

	hue = randomHue();
	rotation = randomRotation();
	numSides = randomBetween(3, 6);

	addParticles();
};

const addParticles = () => {
	const numParticles = randomBetween(3, 8);

	for (let i = 0; i < numParticles; i++) {
		const particle = {
			isEven: i % 2 === 0,
			radius: destination,
			size: randomBetween(size * 0.3, size * 0.5),
			velocity: randomBetween(velocity * 1.1, velocity * 1.5),
			rotation: Math.random() * Math.PI * 2,
			angle: Math.random() * Math.PI * 2,
			decay: randomBetween(94, 96) * 0.01,
			position: {},
			numSides,
			color,

			update() {
				this.radius += this.velocity;
				this.velocity *= this.decay;
				this.size *= this.decay;

				this.rotation += (this.isEven ? 0.01 : -0.01);

				this.position.x = width * 0.5 + (Math.cos(this.angle) * this.radius);
				this.position.y = height * 0.5 + (Math.sin(this.angle) * this.radius);
			}
		};

		particles.push(particle);
	}
};

const draw = (ctx, position, path, lineWidth, color, rotation) => {
	ctx.save();
	ctx.fillStyle = color;
	ctx.strokeStyle = color;
	ctx.lineWidth = lineWidth;

	ctx.translate(position.x, position.y);
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

const drawParticles = () => {
	particles.forEach((p) => {
		p.update();

		const path = getPath(p.numSides, p.size);

		draw(ctx, p.position, path, 1, p.color, p.rotation);
	});

	particles = particles.filter(p => p.velocity > 0.1);
};

const loop = () => {
	clear(ctx);

	const path = getPath(numSides, size);
	const noise = simplex.noise2D(phase, phase);

	color = `hsl(${hue + (180 * noise)}, 100%, 50%)`;
	velocity *= 0.98;
	destination = minSize + (amplitude * (velocity / maxVelocity));
	size += (destination - size) / 1.2;

	draw(ctx, { x: width >> 1, y: height >> 1 }, path, 1, color, rotation + phase);

	drawParticles();

	phase += phaseSpeed;

	requestAnimationFrame(loop);
};

loop();

canvas.addEventListener('click', () => {
	clearTimeout(clickTimeoutId);
	clearInterval(impulseIntervalId);

	clicker.add();

	if (clicker.clicks.length < 2) {
		return;
	}

	clickTimeoutId = setTimeout(() => {
		impulseIntervalId = setInterval(addForce, clicker.timeDifference());

		clicker.reset();
	}, 1000);
});
