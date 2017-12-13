/* global noise: false, Vector: false, dat: false */

// https://codepen.io/DonKarlssonSan/post/particles-in-simplex-noise-flow-field

noise.seed(Math.random());

const q = (sel) => document.querySelector(sel);

const canvas = q('canvas');
const ctx = canvas.getContext('2d');
const width = 300;
const height = 300;
const PI2 = Math.PI * 2;

canvas.width = width;
canvas.height = height;

class Flowfield {
	constructor(width, height, size, differ = 0.09, speed = 0.001) {
		this.size = size;
		this.differ = differ;

		this.columns = Math.floor(width / this.size) + 1;
		this.rows = Math.floor(height / this.size) + 1;

		this.phase = 0;
		this.speed = speed;

		this.update();
	}

	update() {
		const field = new Array(this.columns);

		for (let x = 0; x < this.columns; x++) {
			field[x] = new Array(this.rows);

			for (let y = 0; y < this.rows; y++) {
				const angle = noise.simplex3(x * this.differ, y * this.differ, this.phase) * PI2;
				const length = 1 + noise.simplex3(x * 0.01 + 1000, y * 0.01 + 1000, this.phase);

				const v = new Vector();

				v.length = length;
				v.angle = angle;

				field[x][y] = v;
			}
		}

		this.field = field;

		this.phase += this.speed;
	}

	draw(ctx) {
		for (let x = 0; x < this.columns; x++) {
			for (let y = 0; y < this.rows; y++) {
				ctx.beginPath();
				ctx.strokeStyle = '#c4c0c0';

				const x1 = x * this.size;
				const y1 = y * this.size;

				ctx.moveTo(x1, y1);
				ctx.lineTo(x1 + this.field[x][y].x * this.size, y1 + this.field[x][y].y * this.size);
				ctx.stroke();
			}
		}
	}

	getForce(x, y) {
		const indexX = Math.floor(x / this.size);
		const indexY = Math.floor(y / this.size);

		return this.field[indexX][indexY];
	}
}

class Particle {
	constructor(position, velocity = new Vector(), acceleration = new Vector()) {
		this.position = position;
		this.velocity = velocity;
		this.acceleration = acceleration;

		this.size = 1;
	}

	update(acceleration = new Vector()) {
		this.velocity.set(acceleration.x, acceleration.y);
		this.position.addSelf(this.velocity);
	}

	wrap(width, height) {
		if (this.position.x <= 0) {
			this.position.x = width - 1;
		}

		if (this.position.x > width) {
			this.position.x = 1;
		}

		if (this.position.y <= 0) {
			this.position.y = height - 1;
		}

		if (this.position.y > height) {
			this.position.y = 1;
		}
	}

	draw(ctx) {
		const { position: { x, y } } = this;

		ctx.save();
		ctx.translate(x, y);

		ctx.beginPath();
		ctx.fillStyle = '#ff0000';
		ctx.arc(0, 0, 1, 0, PI2, false);
		ctx.fill();
		ctx.closePath();

		ctx.restore();
	}
}

const createParticles = (count) => {
	const particles = [];

	for (let i = 0; i < count; i++) {
		const position = new Vector(
			width * Math.random(),
			height * Math.random()
		);

		particles.push(new Particle(position));
	}

	return particles;
};

const settings = {
	size: 10,
	numParticles: 1,
	differ: 0.09,
	updateSpeed: 10,
};

let flowfield;
let particles;
let rafId;
let phase = 0;

const reset = () => {
	cancelAnimationFrame(rafId);

	ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

	particles = createParticles(settings.numParticles);
	flowfield = new Flowfield(width, height, settings.size, settings.differ, settings.updateSpeed * 0.001);

	loop();
};

const clear = () => {
	ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
};

const loop = () => {
	clear();

	flowfield.update();
	flowfield.draw(ctx);

	particles.forEach((particle) => {
		particle.wrap(width, height);

		const { position: { x, y } } = particle;
		const v = flowfield.getForce(x, y);

		particle.update(v);
		particle.draw(ctx);
	});

	phase += settings.updateSpeed * 0.001;

	rafId = requestAnimationFrame(loop);
};

var gui = new dat.GUI();
gui.add(settings, 'size', 2, 100).step(1).onChange(reset);
gui.add(settings, 'differ', 0.001, 0.9).step(0.001).onChange(reset);
gui.add(settings, 'numParticles', 1, 1500).step(1).onChange(reset);
gui.add(settings, 'updateSpeed', 1, 100).step(1).onChange(() => {
	flowfield.speed = settings.updateSpeed * 0.001;
});

reset();
