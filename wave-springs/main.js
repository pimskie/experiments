/**
 * https://gamedevelopment.tutsplus.com/tutorials/make-a-splash-with-dynamic-2d-water-effects--gamedev-236
 */

/**
 * Hooke's law:
 * The force provided by a spring is given by Hooke's Law
 * F = -kx
 * F = force produced by spring
 * k = spring constant
 * x = spring displacement
 * https://en.wikipedia.org/wiki/Hooke's_law
 *
 * Newton's second Law of Motion:
 * Force equals mass times acceleration.
 * F = ma
 * F = force
 * m = mass
 * a = acceleration
 * http://en.wikipedia.org/wiki/Newton%27s_laws
 * http://natureofcode.com/book/chapter-2-forces/ (2.2)
 *
 * Two formulas combined:
 * a = -(k / m) * x - (d * v)
 *
 * a: acceleration
 * k: spring constant
 * m: mass (can be left out if mass is always the same)
 * x: spring displacement
 * d: damping (to stop spring over time)
 * v: velocity
 */

const q = (sel) => document.querySelector(sel);

const canvas = q('canvas');
const ctx = canvas.getContext('2d');
const PI2 = Math.PI * 2;

const w = window.innerWidth;
const h = 500;

canvas.width = w;
canvas.height = h;

class Spring {
	constructor(index, x, y, k, damp, targetHeight, height) {
		this.index = index;
		this.x = x;
		this.y = y;

		this.k = k;
		this.damp = damp;

		this.targetHeight = targetHeight;
		this.height = height;

		this.acceleration = 0;
		this.transportingForce = 0;
	}

	draw(ctx) {
		ctx.beginPath();
		ctx.fillstyle = this.color;
		ctx.strokeStyle = this.color;
		ctx.moveTo(this.x, this.y);
		ctx.lineTo(this.x, this.toY);
		ctx.stroke();
		ctx.closePath();

		ctx.beginPath();
		ctx.arc(this.x, this.toY, 3, 0, PI2, false);
		ctx.fill();
		ctx.closePath();
	}

	// Hooke's law
	update() {
		const displacement = this.targetHeight - this.height;

		this.acceleration += this.k * displacement;
		this.acceleration *= this.damp;

		this.height += this.acceleration;

	}

	get toY() {
		return this.y - this.height;
	}

	get color() {
		return Math.abs(this.acceleration) > 0.05 ? '#ff0000' : '#000';
	}
}

const springs = [];
const numSprings = 150;
const springSpacing = w / (numSprings - 1);
const springHeight = 100;
const springConstant = 0.025;
const springDamp = 0.94;
const waveSpread = 0.1;

let springX = 0;
for (let i = 0; i < numSprings; i++) {
	const springY = h;

	springs.push(new Spring(
		i,
		springX,
		springY,
		springConstant,
		springDamp,
		springHeight,
		springHeight
	));

	springX += springSpacing;
}

const clear = () => {
	ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
};

const spring = springs[~~(springs.length / 2)];
// const spring = springs[0];
spring.acceleration = -20;

const loop = () => {
	clear();

	springs.forEach((spring => {
		spring.update();
		spring.draw(ctx);
	}));

	for (let i = 0; i < springs.length; i++) {
		const currentSpring = springs[i];

		if (i > 0) {
			const previousSpring = springs[i - 1];
			const force = waveSpread * (currentSpring.height - previousSpring.height);

			previousSpring.acceleration += force;
			previousSpring.height += force * 0.99;
		}

		if (i < springs.length - 1) {
			const nextSpring = springs[i + 1];
			const force = waveSpread * (currentSpring.height - nextSpring.height);

			nextSpring.acceleration += force;
			nextSpring.height += force * 0.99;
		}
	}

	// const leftDeltas = [];
	// const rightDeltas = [];

	// for (let i = 0; i < springs.length; i++) {
	// 	if (i > 0) {
	// 		leftDeltas[i] = waveSpread * (springs[i].height - springs[i - 1].height);
	// 		springs[i - 1].acceleration += leftDeltas[i];
	// 	}

	// 	if (i < springs.length - 1) {
	// 		rightDeltas[i] = waveSpread * (springs[i].height - springs[i + 1].height);
	// 		springs[i + 1].acceleration += rightDeltas[i];
	// 	}
	// }

	// for (let i = 0; i < springs.length; i++) {
	// 	if (i > 0) {
	// 		springs[i - 1].height += leftDeltas[i];
	// 	}

	// 	if (i < springs.length - 1) {
	// 		springs[i + 1].height += rightDeltas[i];
	// 	}
	// }

	requestAnimationFrame(loop);
};

loop();


const onPointerDown = (e) => {
	const event = (e.touches && e.touches.length) ? e.touches[0] : e;
	const { target, clientX: pointerX } = event;

	const clickedX = pointerX - target.offsetLeft;
	const waveWidth = w / numSprings;
	const springIndex = Math.round(clickedX / waveWidth);

	springs[springIndex].acceleration = -100;
};

canvas.addEventListener('mousedown', onPointerDown);
canvas.addEventListener('touchstart', onPointerDown);
