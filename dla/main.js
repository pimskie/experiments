// Diffusion-Limited Aggregation

import Vector from '//rawgit.com/pimskie/vector/master/vector.js';
import { wrappBBox } from '//rawgit.com/pimskie/utils/master/utils.js';

const randomBetween = (min, max) => Math.random() * (max - min) + min;

const distance = (v1, v2) => {
	const dx = v2.x - v1.x;
	const dy = v2.y - v1.y;

	return dx * dx + dy * dy;
};

const randomGaussian = () => Math.random();

class Stage {
	constructor(canvasSelector, width, height) {
		this.canvas = document.querySelector(canvasSelector);
		this.ctx = this.canvas.getContext('2d');

		this.width = width;
		this.height = height;
	}

	get width() {
		return this.canvas.width;
	}

	get height() {
		return this.canvas.height;
	}

	get widthHalf() {
		return this.width * 0.5;
	}

	get heightHalf() {
		return this.height * 0.5;
	}

	set width(w) {
		this.canvas.width = w;
	}

	set height(h) {
		this.canvas.height = h;
	}

	clear() {
		this.ctx.clearRect(0, 0, this.width, this.height);
	}
}

for (let i = 0; i < 10; i++) {
	const length = 10;

	console.log(randomBetween(-length, length));
}

class Particle {
	constructor({ position = { x: 0, y: 0 }, radius = 3, fill = '#000' } = {}) {
		this.position = position;
		this.radius = radius;
		this.fill = fill;

		this.distance = radius;
	}

	update(stageWidth, stageHeight) {
		const length = 2;

		const x = randomBetween(-length, length);
		const y = randomBetween(-length, length);

		this.position.x += x;
		this.position.y += y;

		wrappBBox(this.position, stageWidth, stageHeight);
	}

	intersects(particles) {
		const intersecting = particles.find(p => distance(p.position, this.position) <= this.radius * this.radius + p.radius * p.radius);

		if (intersecting) {
			this.distance += intersecting.distance;
			this.radius = intersecting.radius * 0.99;
			this.fill = 'red';

			return true;
		}

		return false;
	}

	draw(ctx) {
		const { position: pos, fill, radius } = this;

		ctx.beginPath();
		ctx.fillStyle = fill;
		ctx.arc(pos.x, pos.y, radius, 0, TAU, false);
		ctx.fill();
		ctx.closePath();
	}
}

const TAU = Math.PI * 2;
const stage = new Stage('canvas', 500, 500);

const settings = {
	numParticles: 200,
	numSteps: 30,
};

let particles = [];
let branch = [new Particle({
	position: { x: stage.widthHalf, y: stage.heightHalf },
	fill: 'red',
})];

const generate = () => {
	const { numParticles } = settings;

	particles = new Array(numParticles).fill().map((_, i) => {
		const a = randomGaussian() * TAU;
		const r = stage.widthHalf * 0.5 + (Math.random() * stage.widthHalf * 0.5);
		const position = {
			x: stage.widthHalf + Math.cos(a) * r,
			y: stage.heightHalf + Math.sin(a) * r };

		return new Particle({ position });
	});
};

const clear = () => {
	stage.clear();
};

const updateParticles = () => {
	for (let i = 0; i < particles.length; i++) {
		const p = particles[i];

		p.update(stage.width, stage.height);
		p.draw(stage.ctx);

		if (p.intersects(branch)) {
			branch.push(p);
			particles.splice(i, 1);
		}
	}

};

const loop = () => {
	const { numSteps } = settings;

	clear();

	branch.forEach((p) => {
		p.draw(stage.ctx);
	});

	for (let i = 0; i < numSteps; i++) {
		updateParticles();
	}

	requestAnimationFrame(loop);
};

generate();
loop();
