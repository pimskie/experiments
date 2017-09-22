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

const w = 500;
const h = 500;
const wh = w * 0.5;
const hh = h * 0.5;

canvas.width = w;
canvas.height = h;

const springs = [];
const numSprings = 10;
const springSpacing = w / (numSprings - 1);
const springHeight = 150;
const springConstant = 0.025;
const springDamp = 0.025;
const springTension = 0.025;
const waveSpread = 0.15;

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
	}

	draw(ctx) {
		ctx.beginPath();
		ctx.moveTo(this.x, this.y);
		ctx.lineTo(this.x, this.toY);
		ctx.stroke();
		ctx.closePath();

		ctx.beginPath();
		ctx.arc(this.x, this.toY, 3, 0, PI2, false);
		ctx.fill();
		ctx.closePath();
	}

	update() {
		const displacement = this.targetHeight - this.height;

		this.acceleration += this.k * displacement - this.acceleration * this.damp;
		this.height += this.acceleration;
	}

	get toY() {
		return this.y - this.height;
	}
}

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


// const firstSpring = springs[1];
// const secondSpring = springs[2];
// const thirdSpring = springs[3];

// firstSpring.acceleration = -5;

// const loop = () => {
// 	clear();

// 	secondSpring.acceleration = waveSpread * (firstSpring.height - secondSpring.height);
// 	thirdSpring.acceleration = waveSpread * (secondSpring.height - thirdSpring.height);

// 	springs.forEach((spring => {
// 		spring.update();
// 		spring.draw(ctx);
// 	}));

// 	requestAnimationFrame(loop);
// };

const [firstSpring] = springs;
firstSpring.acceleration = -5;

const loop = () => {
	clear();

	for (let i = 0; i < springs.length - 1; i++) {
		const currentSpring = springs[i];
		const nextSpring = springs[i + 1];

		nextSpring.acceleration = waveSpread * (currentSpring.height - nextSpring.height);
	}

	springs.forEach((spring => {
		spring.update();
		spring.draw(ctx);
	}));


	requestAnimationFrame(loop);
};


loop();


