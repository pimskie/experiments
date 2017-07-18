/* globals Vector: false, */

// https://www.youtube.com/watch?v=hbgDqyy8bIw&t=917s

const qs = (sel) => document.querySelector(sel);

const canvas = qs('canvas');
const ctx = canvas.getContext('2d');
const PI = Math.PI;
const TAU = PI * 2;


// all set in `setStage`
let w;
let h;
let midX;
let midY;

let rafId = null;

class Segment {
	constructor({ parent = null, position = new Vector(), length = 100, angle = 0, width = 1 } = {}) {
		this.length = length;
		this.width = width;
		this.angle = angle;

		if (parent) {
			this.parent = parent;
			this.angle = parent.angle + angle;
			this.from = this.parent.to.clone();
		} else {
			this.parent = null;
			this.angle = angle;
			this.from = position;
		}

		// this.parent = null;
		// this.angle = angle;
		// this.from = position;
	}

	// definitely not the Shiffman way:
	// https://www.youtube.com/watch?v=hbgDqyy8bIw&t=13m57s
	follow(target) {
		const direction = target.subtract(this.from);
		const xFrom = target.x - (Math.cos(direction.angle) * this.length);
		const yFrom = target.y - (Math.sin(direction.angle) * this.length);

		this.from = new Vector(xFrom, yFrom);

		this.angle = direction.angle;
	}


	update() {
		//
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

	if (follow) {
		// IK
		legRight.follow(mouse);
		body.follow(legRight.from);
		body.from = legLeft.from;
		legRight.from = body.to;
	} else {
		legLeft.from.x = legRight.from.x - 50;
	}

	segments.forEach(drawSegment);

	rafId = requestAnimationFrame(loop);
};

window.addEventListener('resize', onResize);


setupStage();

const length = 40;

const body = new Segment({
	position: new Vector(midX, midY),
	length: 75,
	angle: 0,
});

const legRight = new Segment({
	position: new Vector(midX + 75, midY),
	length,
	angle: PI / 2,
});

const legLeft = new Segment({
	position: new Vector(midX, midY),
	length,
	angle: -PI - (PI / 2),
});

const segments = [legLeft, body, legRight];
let mouse = new Vector(midX + 100, midY + 100);
let follow = true;

canvas.addEventListener('mousemove', (e) => {
	mouse.set(e.clientX, e.clientY);
});


canvas.addEventListener('mousedown', (e) => {
	follow = false;

	mouse.set(e.clientX, e.clientY);
});


// canvas.addEventListener('mousedown', () => {
// 	follow = false;

// 	setTimeout(() => {

// 		legRight.follow(mouse);
// 	}, 500);
// });

loop();
