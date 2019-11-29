const simplex = new SimplexNoise();
const synth = new Tone.PolySynth().toDestination();

// synth.envelope.attack = 0.05;
// synth.envelope.release = 1;

const randomArrayValue = arr => arr[Math.floor(Math.random() * arr.length)];
const randomBetween = (min, max) => ~~(Math.random() * (max - min) + min);
const randomHue = () => Math.random() * 180;
const randomRotation = () => Math.random() * Math.PI * 2;

const canvas = document.querySelector('.js-canvas-draw');
const ctx = canvas.getContext('2d');

const canvasTimeline = document.querySelector('.js-canvas-timeline');
const ctxTimeline = canvasTimeline.getContext('2d');

const width = window.innerWidth;
const height = window.innerHeight;

canvas.width = width;
canvas.height = height;

canvasTimeline.width = width;
canvasTimeline.height = height;

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

		if (this.clicks.length > 2) {
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

const timeline = {
	beats: [],
	time: 0,
	speed: 0.005,
	position: 0,

	reset() {
		this.beats = [];
	},

	// x, y: normals
	addBeat(beat) {
		this.beats.push(beat);
	},

	update() {
		this.time += this.speed;

		if (this.time > 1) {
			this.time = 0;
			this.beats.forEach(b => b.played = false);
		}

		this.position = width * this.time;
	},

	beatOnTime() {
		const beat = this.beats.find(b => Math.abs(b.x - this.time) <= 0.005 && !b.played);

		if (beat) {
			beat.played = true;
		}

		return beat;
	},

	draw(ctx) {
		this.beats.forEach(({ x, y }) => {
			const positionX = x * width;
			const positionY = y * height;

			ctx.strokeStyle = '#fff';
			ctx.beginPath();
			ctx.arc(positionX - 2.5, positionY, 5, 0, Math.PI * 2, false);
			ctx.stroke();
			ctx.closePath();
		});

		ctx.fillStyle = '#fff';
		ctx.beginPath();
		ctx.arc(this.position, height * 0.95, 2, 0, Math.PI * 2, false);
		ctx.fill();
		ctx.closePath();
	}
};

const getPath = (sides, size) => {
	const step = Math.PI * 2 / sides;

	return new Array(sides).fill().map((_, i) => ({
		x: Math.cos(step * i) * size,
		y: Math.sin(step * i) * size,
	}));
};

const addForce = ({ x, y }) => {
	velocity += force;

	hue = randomHue();
	rotation = randomRotation();
	numSides = randomBetween(3, 6);

	const minF = 20;
	const maxF = 500;
	const f = minF + ((1 - y) * (maxF - minF));

	synth.triggerAttackRelease(f, '10n');

	addParticles();
};

const addParticles = () => {
	const numParticles = randomBetween(3, 8);

	for (let i = 0; i < numParticles; i++) {
		const particle = {
			isEven: i % 2 === 0,
			radius: destination,
			size: randomBetween(size * 0.3, size * 0.5),
			velocity: randomBetween(velocity * 2, velocity * 3),
			rotation: Math.random() * Math.PI * 2,
			angle: Math.random() * Math.PI * 2,
			decay: randomBetween(93, 94) * 0.01,
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

const drawParticles = () => {
	particles.forEach((p) => {
		p.update();

		const path = getPath(p.numSides, p.size);

		draw(ctx, p.position, path, 1, p.color, p.rotation);
	});

	particles = particles.filter(p => p.velocity > 0.1);
};

const drawTimeline = () => {
	ctxTimeline.clearRect(0, 0, ctxTimeline.canvas.width, ctxTimeline.canvas.height);

	timeline.update();
	timeline.draw(ctxTimeline);
};

const loop = () => {
	ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
	ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height)

	const path = getPath(numSides, size);
	const noise = simplex.noise2D(phase, phase);

	color = `hsl(${hue + (180 * noise)}, 100%, 50%)`;
	velocity *= 0.96;
	destination = minSize + (amplitude * (velocity / maxVelocity));
	size += (destination - size) / 1.2;

	draw(ctx, { x: width >> 1, y: height >> 1 }, path, 1, color, rotation + phase);

	drawParticles();
	drawTimeline();

	const beatOnTime = timeline.beatOnTime();

	if (beatOnTime) {
		addForce(beatOnTime);
	}

	phase += phaseSpeed;

	requestAnimationFrame(loop);
};

const numBeats = 10;
for (let i = 0; i < numBeats; i++) {
	const x = (0.5 / numBeats) + (i / numBeats);
	const y = 0.9;

	timeline.addBeat({ x, y });
}

loop();

canvas.addEventListener('click', (e) => {
	const { clientX: x, clientY: y } = e;
	const { time } = timeline;

	clearTimeout(clickTimeoutId);
	clearInterval(impulseIntervalId);

	const beat = { x: x / width, y: y / height };

	timeline.addBeat(beat);
	addForce(beat);

	if (clicker.clicks.length < 2) {
		return;
	}
});

document.body.addEventListener('keydown', (e) => {
	if (e.key === ' ') {
		timeline.reset();
	}
});
