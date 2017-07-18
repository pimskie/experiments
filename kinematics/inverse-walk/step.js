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

		this._to = new Vector();

		// this.parent = null;
		// this.angle = angle;
		// this.from = position;
	}

	// definitely not the Shiffman way:
	// https://www.youtube.com/watch?v=hbgDqyy8bIw&t=13m57s
	follow(target, isSticky = false) {
		const direction = target.subtract(this.from);
		const xFrom = target.x - (Math.cos(direction.angle) * this.length);
		const yFrom = target.y - (Math.sin(direction.angle) * this.length);

		this.from = new Vector(xFrom, yFrom);

		this.angle = direction.angle;
	}


	updateForward() {
		if (this.parent) {
			this.from = this.parent.to;
			// this.angle += this.parent.angle;
		}
	}

	get to() {
		this._to = new Vector(
			this.length * Math.cos(this.angle),
			this.length * Math.sin(this.angle)
		).addSelf(this.from);

		return this._to;
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
};

const clear = () => {
	ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
};


const r = 15;
let direction = -1;

const switchLegs = () => {
	direction *= -1;
	segments.reverse();
};

const anim = { angle: 0 };


const animate = () => {
	switchLegs();

	const [trailingLeg, leadingLeg] = direction === -1 ? [legLeft, legRight] : [legRight, legLeft];
	const mouse = leadingLeg.to.clone();
	const start = leadingLeg.to.clone();
	const leftTo = trailingLeg.to.clone();

	console.log('segments:');
	segments.forEach((s) => console.log(s.name));

	console.log('leading: ', leadingLeg.name);
	console.log('trailing: ', trailingLeg.name);

	start.x = direction === -1 ? start.x + r : start.x - r;
	anim.angleStart = direction === -1 ? -PI : 0;
	const angleTo = direction === -1 ? 0 : -PI;

	TweenLite.to(anim, 1, {
		angleStart: angleTo,

		onUpdate() {
			mouse.x = start.x + (Math.cos(anim.angleStart) * r);
			mouse.y = start.y + (Math.sin(anim.angleStart) * r);

			leadingLeg.follow(mouse);

			for (let i = 1; i < segments.length - 1; i++) {
				const segment = segments[i];
				segment.follow(segments[i - 1].from.clone());
			}

			// trailingLeg.from = body.from;
			// trailingLeg.angle = Calc.angleBetween(trailingLeg.from.x, trailingLeg.from.y,leftTo.x,leftTo.y);
		},

		onComplete() {
			switchLegs();
			// animate();
		},
	});
};

// const animate = () => {
// 	const [trailingLeg, leadingLeg] = direction === -1 ? [legLeft, legRight] : [legRight, legLeft];
// 	const mouse = leadingLeg.to.clone();
// 	const start = leadingLeg.to.clone();
// 	const leftTo = trailingLeg.to.clone();

// 	start.x = direction === -1 ? start.x + r : start.x - r;
// 	anim.angleStart = direction === -1 ? -PI : 0;
// 	const angleTo = direction === -1 ? 0 : -PI;

// 	TweenLite.to(anim, 1, {
// 		angleStart: angleTo,

// 		onUpdate() {
// 			let nextSegment = leadingLeg;

// 			mouse.x = start.x + (Math.cos(anim.angleStart) * r);
// 			mouse.y = start.y + (Math.sin(anim.angleStart) * r);

// 			nextSegment.follow(mouse);

// 			for (let i = 1; i < segments.length - 1; i++) {
// 				nextSegment = segments[i];
// 				nextSegment.follow(segments[i - 1].from.clone());
// 			}

// 			trailingLeg.from = body.from;
// 			trailingLeg.angle = Calc.angleBetween(trailingLeg.from.x, trailingLeg.from.y,leftTo.x,leftTo.y);
// 		},

// 		onComplete() {
// 			switchLegs();
// 			// animate();
// 		},
// 	});
// };

const loop = () => {
	clear();
	drawFloor();

	segments.forEach(drawSegment);

	rafId = requestAnimationFrame(loop);
};

window.addEventListener('resize', onResize);

setupStage();

const length = 40;

const legLeft = new Segment({
	position: new Vector(midX, midY - length),
	length,
	angle: PI / 2,
	color: 'red',
});

const body = new Segment({
	position: new Vector(midX, midY - length),
	length: 75,
	angle: 0,
	color: 'black',
});

const legRight = new Segment({
	position: new Vector(midX + 75, midY - length),
	length,
	angle: PI / 2,
	color: 'green',
});

legLeft.name = 'left';
body.name = 'body';
legRight.name = 'right';

const segments = [legRight, body, legLeft];


// canvas.addEventListener('mousedown', () => {
// 	follow = false;

// 	setTimeout(() => {

// 		legRight.follow(mouse);
// 	}, 500);
// });

animate();
loop();
