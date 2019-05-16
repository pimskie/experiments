
// Diffusion-Limited Aggregation

import { randomBetween, wrappBBox, pixelIndex as getPixelIndex } from '//rawgit.com/pimskie/utils/master/utils.js';

const worker = new Worker('worker.js');

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

	get imageData() {
		return this.ctx.getImageData(0, 0, this.width, this.height);
	}

	clear() {
		this.ctx.fillStyle = '#fff';
		this.ctx.clearRect(0, 0, this.width, this.height);
	}
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

	intersects(intersecting) {
		this.distance += intersecting.distance;
		this.radius = intersecting.radius * 0.99;
		this.fill = 'red';
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
	numParticles: 10000,
	numSteps: 20,
};

let padding = 20;
let particles = [];
let branch = [
	new Particle({
		position: { x: stage.widthHalf, y: stage.heightHalf },
		fill: 'red',
	}),
	new Particle({
		position: { x: padding, y: padding },
		fill: 'red',
	}),
	new Particle({
		position: { x: stage.width - padding, y: padding },
		fill: 'red',
	}),
	new Particle({
		position: { x: stage.width - padding, y: stage.height - padding },
		fill: 'red',
	}),
	new Particle({
		position: { x: padding, y: stage.height - padding },
		fill: 'red',
	})
];


let imageData;

worker.onmessage = ({ data } = e) => {
	clear();

	imageData = stage.imageData;

	particles = data.particles;
	branch = data.branch;

	// branch.forEach(p => drawParticle(p, imageData, [255, 0, 0]));
	particles.forEach(p => drawParticle(p, imageData));
	branch.forEach(p => drawParticle(p, imageData, [255]));

	stage.ctx.putImageData(imageData, 0, 0);

	loop();

}

const generate = () => {
	const { numParticles } = settings;

	particles = new Array(numParticles).fill().map((_, i) => {
		const a = Math.random() * TAU;
		const r = stage.widthHalf * 0.5 + (Math.random() * stage.widthHalf * 0.5);
		const position = {
			x: stage.widthHalf + Math.cos(a) * r,
			y: stage.heightHalf + Math.sin(a) * r
		};

		return new Particle({ position, radius: 2 });
	});
};

const clear = () => {
	stage.clear();
};

const drawParticle = (p, imageData, [r = 0, g = 0, b = 0] = []) => {
	const { position: { x, y } } = p;
	const pixelIndex = getPixelIndex(~~x, ~~y, imageData);

	imageData.data[pixelIndex] = r;
	imageData.data[pixelIndex + 1] = g;
	imageData.data[pixelIndex + 2] = b;
	imageData.data[pixelIndex + 3] = 255;
};

const loop = () => {
	const { numSteps } = settings;

	worker.postMessage({
		stageWidth: stage.width,
		stageHeight: stage.height,
		numSteps,
		particles,
		branch,
	});
};

generate();
loop();
