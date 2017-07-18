/* globals Vector: false, noise: false,  Calc: false, */

// https://www.youtube.com/watch?v=xXjRlEr7AGk

noise.seed(Math.random());

const qs = (sel) => document.querySelector(sel);

const canvas = qs('canvas');
const ctx = canvas.getContext('2d');
const PI = Math.PI;
const TAU = Math.PI * 2;

// all set in `setStage`
let w;
let h;
let midX;
let midY;

let rafId = null;
let tick = 0;

canvas.width = w;
canvas.height = h;

const segments = [];

class Segment {
	constructor({ parent = null, position = new Vector(), length = 100, angle = 0 } = {}) {
		if (parent) {
			this.parent = parent;
			this.selfAngle = angle;
			this.from = this.parent.to;
		} else {
			this.parent = null;
			this.selfAngle = 0;
			this.from = position;
		}

		this.length = length;
		this.angle = angle;

		this.lineWidth = 2;
	}

	wiggle(tick = 0) {
		this.selfAngle = Calc.map(noise.perlin2(tick, tick), -1, 1, -PI, PI);
	}

	update() {
		this.angle = this.selfAngle;

		if (this.parent) {
			this.from = this.parent.to;
			this.angle += this.parent.angle;
		}
	}

	get to() {
		return new Vector(
			this.length * Math.cos(this.angle),
			this.length * Math.sin(this.angle)
		).addSelf(this.from);
	}
}

const setupStage = () => {
	onResize();
};

const onResize = () => {
	w = window.innerWidth;
	h = window.innerHeight;

	midX = w >> 1;
	midY = h >> 1;

	canvas.width = w;
	canvas.height = h;
};

const drawSegment = (segment) => {
	ctx.beginPath();
	ctx.moveTo(segment.from.x, segment.from.y);
	ctx.lineTo(segment.to.x, segment.to.y);
	ctx.stroke();
	ctx.closePath();
};

const clear = () => {
	ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
};

const loop = () => {
	clear();

	let currentSegment = segments[0];

	currentSegment.update();
	drawSegment(currentSegment);


	let i = 0;


	while (currentSegment.child) {
		const segment = currentSegment.child;

		segment.wiggle(tick + i);
		segment.update();

		drawSegment(segment);

		currentSegment = segment;

		i += 0.5;
	}

	tick += 0.01;

	rafId = requestAnimationFrame(loop);
};

window.addEventListener('resize', onResize);


setupStage();

const rootSegment = new Segment({
	position: new Vector(midX, midY),
	length: 50,
	angle: -PI,
});

let currentSegment = rootSegment;

let length = 40;

for (let i = 0; i < 10; i++) {
	const segment = new Segment({
		length,
		parent: currentSegment,
	});

	currentSegment.child = segment;
	currentSegment = segment;

	length *= 0.8;

	segments.push(segment);
}

loop();
