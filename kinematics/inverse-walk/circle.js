/* globals Vector: false, TimelineLite: false, TweenLite: false,  */

// https://www.youtube.com/watch?v=hbgDqyy8bIw&t=917s

const qs = (sel) => document.querySelector(sel);

const canvas = qs('canvas');
const ctx = canvas.getContext('2d');
const PI = Math.PI;

var tl = new TimelineLite();
// all set in `setStage`
let w;
let h;
let midX;
let midY;

let rafId = null;

class Segment {
	constructor({ parent = null, position = new Vector(), length = 100, angle = 0, width = 1, color = '#000' } = {}) {
		this.length = length;
		this.width = width;
		this.angle = angle;
		this.color = color;

		if (parent) {
			this.parent = parent;
			this.angle = parent.angle + angle;
			this.from = this.parent.to.clone();
		} else {
			this.parent = null;
			this.angle = angle;
			this.from = position;
		}

		this.to = new Vector();

		this.calculateTo();
	}

	// definitely not the Shiffman way:
	// https://www.youtube.com/watch?v=hbgDqyy8bIw&t=13m57s
	follow(target) {
		const direction = target.subtract(this.from);
		const xFrom = target.x - (Math.cos(direction.angle) * this.length);
		const yFrom = target.y - (Math.sin(direction.angle) * this.length);

		this.from.x = xFrom;
		this.from.y = yFrom;

		this.angle = direction.angle;
	}

	followForward(target) {
	}

	updateForward() {
		if (this.parent) {
			this.from = this.parent.to;
			this.angle += this.parent.angle;
		}
	}

	update() {
		this.calculateTo();
	}

	calculateTo() {
		this.to.x = this.from.x + (Math.cos(this.angle) * this.length);
		this.to.y = this.from.y + (Math.sin(this.angle) * this.length);
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
	ctx.strokeStyle = segment.color;
	ctx.moveTo(segment.from.x, segment.from.y);
	ctx.lineTo(segment.to.x, segment.to.y);
	ctx.stroke();
	ctx.closePath();
};

const drawFloor = () => {
	ctx.beginPath();
	ctx.lineWidth = 2;
	ctx.strokeStyle = 'black';
	ctx.moveTo(0, midY);
	ctx.lineTo(w, midY);
	ctx.stroke();
	ctx.closePath();

	ctx.beginPath();
	ctx.fillStyle = 'black';
	ctx.arc(midX, midY, 5, 0, PI * 2, false);
	ctx.fill();
	ctx.closePath();
};

const clear = () => {
	ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
};


const switchLegs = () => {
	direction *= -1;
	segments.reverse();

	[leadingLeg, trailingLeg] = direction === -1 ? [legLeft, legRight] : [legRight, legLeft];
};

const mouse = new Vector();


const loop = () => {
	clear();
	drawFloor();

	legLeft.follow(mouse);

	for (let i = 1; i < segments.length - 1; i++) {
		const segment = segments[i];
		const segmentToFollow = segments[i - 1];

		segment.follow(segmentToFollow.from);
	}

	body.to = legRight.from.clone();

	segments.forEach((s) => s.update());

	segments.forEach(drawSegment);

	rafId = requestAnimationFrame(loop);
};

window.addEventListener('resize', onResize);

setupStage();

const bodyLength = 80;
const length = 40;

const legLeft = new Segment({
	position: new Vector(midX - (bodyLength / 2), midY - length),
	length,
	angle: PI / 2,
	color: 'red',
});

const body = new Segment({
	position: new Vector(midX - (bodyLength / 2), midY - length),
	length: bodyLength,
	angle: 0,
	color: 'black',
});

const legRight = new Segment({
	position: new Vector(midX + (bodyLength / 2), midY - length),
	length,
	angle: PI / 2,
	color: 'green',
});

legLeft.name = 'left';
body.name = 'body';
legRight.name = 'right';

const segments = [legLeft, body, legRight];

let [leadingLeg, trailingLeg] = [legLeft, legRight];

canvas.addEventListener('mousemove', (e) => {
	mouse.x = e.clientX;
	mouse.y = e.clientY;
});

loop();
