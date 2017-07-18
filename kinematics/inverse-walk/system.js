/* globals Vector: false */

// https://www.youtube.com/watch?v=hbgDqyy8bIw&t=917s - Coding Train, inverse I
// https://www.youtube.com/watch?v=RTc6i-7N3ms&t=629s - Coding Train, inverse III
// https://www.youtube.com/watch?v=7t54saw9I8k - Coding Math, Kinematics IV

const qs = (sel) => document.querySelector(sel);

const canvas = qs('canvas');
const ctx = canvas.getContext('2d');
const PI = Math.PI;
const TO_RADIAN = PI / 180;
const TO_DEGREE = 180 / PI;

const tl = new TimelineLite();

// all set in `setStage`
let w;
let h;
let midX;
let midY;

class IKSystem {
	/**
	 *
	 * @param {Vector} base
	 */
	constructor(base, minDistance = null, stepSize = null) {
		this.base = base;
		this.segments = [];

		this.totalAngle = 0;

		this.minDistance = minDistance;
		this.stepSize = stepSize;

		this.isReversed = false;
	}

	addSegment(length, angle = 0, color = '#000') {
		const parent = this.lastSegment;
		const position = new Vector(this.base.x, this.base.y);

		const segment = new Segment({
			parent,
			position,
			angle,
			length,
			color,
		});

		this.segments.push(segment);
	}

	follow(target) {
		this.reachingSegment.follow(target);

		for (let i = this.numSegments - 2; i >= 0; i--) {
			const segment = this.segments[i];
			const followSegment = this.segments[i + 1];

			segment.follow(followSegment.from.clone());
		}
	}

	reachTo(target) {
		const clampedTarget = target.clone();

		if (this.minX && this.maxX) {
			clampedTarget.x = Calc.clamp(target.x, this.minX, this.maxX);
		}

		this.follow(clampedTarget);
		this.update();
	}

	update() {
		this.fixedSegment.from.x = this.base.x;
		this.fixedSegment.from.y = this.base.y;

		this.fixedSegment.angle = Calc.clamp(this.fixedSegment.angle, (-PI / 2) - 1, -0.3);

		for (let i = 1; i < this.numSegments; i++) {
			this.segments[i].from = this.segments[i - 1].to.clone();
		}

		this.totalAngle = this.segments.reduce((memo, segment) => {
			return segment.angle;
		}, 0);
	}

	reverse() {
		this.base = this.lastSegment.to.clone();
		this.segments.reverse();

		this.segments.forEach((s) => {
			s.from = s.to.clone();
		});
		this.isReversed = !this.isReversed;
	}

	get firstSegment() {
		return this.segments[0];
	}

	get lastSegment() {
		return this.numSegments
			? this.segments[this.segments.length - 1]
			: null;
	}

	get numSegments() {
		return this.segments.length;
	}

	get reachingSegment() {
		return this.lastSegment;
	}

	get fixedSegment() {
		return this.firstSegment;
	}

	get bodyPosition() {
		return this.isReversed
			? this.lastSegment.to
			: this.firstSegment.from;
	}

	get minX() {
		return this.isReversed
			? this.fixedSegment.from.x - this.stepSize
			: this.fixedSegment.from.x + this.minDistance;
	}

	get maxX() {
		return this.isReversed
			? this.fixedSegment.from.x - this.minDistance
			: this.fixedSegment.from.x + this.stepSize;
	}
}

class Segment {
	constructor({ parent = null, position = new Vector(), length = 100, angle = 0, width = 1, color = '#000' } = {}) {
		this.length = length;
		this.width = width;
		this.angle = angle;
		this.color = color;

		if (parent) {
			this.from = parent.to.clone();
		} else {
			this.from = position;
		}

		this._to = new Vector();
	}

	// not really the Shiffman way:
	// https://www.youtube.com/watch?v=hbgDqyy8bIw&t=13m57s
	follow(target) {
		const direction = target.subtract(this.from);

		this.from.x = target.x - (Math.cos(direction.angle) * this.length);
		this.from.y = target.y - (Math.sin(direction.angle) * this.length);
		this.angle = direction.angle;
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

const drawBody = () => {
	ctx.beginPath();
	ctx.fillStyle = 'black';
	ctx.arc(body.x, body.y, bodyRadius, 0, PI * 2, false);
	ctx.fill();
	ctx.closePath();
};

const clear = () => {
	ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
};

const animate = () => {
	const time = 0.5;

	isAnimating = true;

	systemRight.reverse();

	const originalTarget = target.clone();

	target.x = body.x + bodyRadius;
	target.y = body.y;

	tl.to(target, time, {
		x: systemRight.fixedSegment.from.x - bodyLength,
		onUpdate() {
			body.x = target.x - bodyRadius;
			body.y = target.y;

			targetLeft.x = body.x;
			targetLeft.y = body.y;
		},
		onComplete() {
			systemRight.reverse();

			target.x = originalTarget.x;
			target.y = originalTarget.y;

			targetLeft.x = systemLeft.fixedSegment.from.x;
			targetLeft.y = systemLeft.fixedSegment.from.y;

			systemLeft.reverse();
		},
	});

	tl.to(targetLeft, time, {
		x: body.x - length,
		onUpdate() {
			systemLeft.reachTo(targetLeft);
		},
		onComplete() {
			targetLeft.x = body.x;
			targetLeft.y = body.y;

			systemLeft.reverse();
		},
	});

	tl.to(systemLeft.reachingSegment, time, {
		angle: -PI / 2,
		onUpdate() {
			systemLeft.update();
		},
	}, time * 2);

	tl.to(systemRight.reachingSegment, time, {
		angle: -PI / 2,
		onUpdate() {
			systemRight.update();
		},
		onComplete() {
			isAnimating = false;
		},
	}, time * 2);

};

const loop = () => {
	clear();

	systemRight.reachTo(target);
	systemLeft.reachTo(targetLeft);

	systemRight.segments.forEach(drawSegment);
	systemLeft.segments.forEach(drawSegment);

	drawFloor();
	drawBody();

	requestAnimationFrame(loop);
};

window.addEventListener('resize', onResize);

setupStage();

const bodyRadius = 10;
const bodyLength = 80;
const length = 40;

const minDistance = 30;
const stepSize = 140;

const body = new Vector(midX, midY);

let isAnimating = false;

const systemRight = new IKSystem(
	new Vector(midX + bodyRadius, midY),
	minDistance,
	stepSize
);

systemRight.addSegment(length, -PI / 2, 'red');
systemRight.addSegment(bodyLength, 0, '#000');
systemRight.addSegment(length, PI / 2, 'green');

const systemLeft = new IKSystem(
	new Vector(midX - length * 2, midY),
	minDistance,
	stepSize
);

systemLeft.addSegment(length, -PI / 2, 'red');
systemLeft.addSegment(bodyLength, 0, '#000');
systemLeft.addSegment(length, PI / 2, 'green');

const target = systemRight.lastSegment.to.clone();
const targetLeft = body.clone();

systemLeft.follow(targetLeft);



canvas.addEventListener('mousemove', (e) => {
	if (!isAnimating) {
		target.x = e.clientX;
		target.y = midY;
	}

	// systemActive = target.x < midX ? systemLeft : systemRight;
});

canvas.addEventListener('mousedown', (e) => {
	animate();
	// systemRight.reverse();
});

loop();
