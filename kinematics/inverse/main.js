/* globals Vector: false, noise: false,  Calc: false, */

// https://www.youtube.com/watch?v=hbgDqyy8bIw&t=917s

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

const mouse = {
	x: 0,
	y: 0,
};

canvas.width = w;
canvas.height = h;

class Segment {
	constructor({ parent = null, position = new Vector(), length = 100, angle = 0, width = 1 } = {}) {
		this.length = length;
		this.width = width;
		this.angle = angle;

		if (parent) {
			this.parent = parent;
			this.selfAngle = angle;
			this.from = this.parent.to.clone();
		} else {
			this.parent = null;
			this.selfAngle = 0;
			this.from = position;
		}
	}

	// definitely not the Shiffman way:
	// https://www.youtube.com/watch?v=hbgDqyy8bIw&t=13m57s
	follow(x, y) {
		const target = new Vector(x, y);
		const direction = target.subtract(this.from);

		const xFrom = x - (Math.cos(direction.angle) * this.length);
		const yFrom = y - (Math.sin(direction.angle) * this.length);

		this.from = new Vector(xFrom, yFrom);

		this.selfAngle = direction.angle;
	}


	update() {
		this.angle = this.selfAngle;
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
	ctx.lineWidth = segment.width;
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

	let nextSegment = currentSegment;
	nextSegment.update();
	nextSegment.follow(mouse.x, mouse.y);
	drawSegment(nextSegment);

	nextSegment = nextSegment.parent;

	while (nextSegment !== null) {
		nextSegment.update();
		nextSegment.follow(nextSegment.child.from.x, nextSegment.child.from.y);

		drawSegment(nextSegment);

		nextSegment = nextSegment.parent;
	}

	tick += 0.01;
	rafId = requestAnimationFrame(loop);
};

window.addEventListener('resize', onResize);


setupStage();

const length = 40;

let currentSegment = new Segment({
	position: new Vector(midX, midY),
	length,
	angle: -PI,
});


for (let i = 0; i < 5; i++) {
	const segmentNext = new Segment({
		length,
		parent: currentSegment,
		width: 1, // Calc.map(i, 0, 100, 1, 15),
	});

	currentSegment.child = segmentNext;
	currentSegment = segmentNext;
}

canvas.addEventListener('mousemove', (e) => {
	mouse.x = e.clientX;
	mouse.y = e.clientY;
});

loop();
