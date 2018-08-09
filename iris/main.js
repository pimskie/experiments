/**
 * https://generateme.wordpress.com/2017/01/03/grow-own-iris/
 * https://p5js.org/reference/#/p5/randomGaussian
 * https://github.com/processing/p5.js/blob/master/src/math/random.js#L166
 */

noise.seed(Math.random());

const randomArrayValue = arr => arr[Math.floor(Math.random() * arr.length)];
const randomBetween = (min, max) => (Math.random() * (max - min + 1)) + min;
const distanceBetween = (vec1, vec2) => Math.hypot(vec2.x - vec1.x, vec2.y - vec1.y);
const qs = (sel) => document.querySelector(sel);

const randomGaussian = (mean = 0, sd = 1) => {
	let y1;
	let x1;
	let x2
	let w;
	let previous;

	if (previous) {
		y1 = y2;
		previous = false;
	} else {
		do {
			x1 = (Math.random() * 2) - 1;
			x2 = (Math.random() * 2) - 1;
			w = x1 * x1 + x2 * x2;
		} while (w >= 1);
		w = Math.sqrt(-2 * Math.log(w) / w);
		y1 = x1 * w;
		y2 = x2 * w;
		previous = true;
	}

	return y1 * sd + mean;
};

const canvas = qs('canvas');
const ctx = canvas.getContext('2d');

const WIDTH = 500;
const HEIGHT = 500;
const WIDTH_HALF = WIDTH * 0.5;
const HEIGHT_HALF = HEIGHT * 0.5;

canvas.width = WIDTH;
canvas.height = HEIGHT;

class Particle {
	constructor(id, color) {
		this.id = id;
		this.color = color;

		this.x = 0;
		this.y = 0;

		this.dx = 0;
		this.dy = 0;

		this.mood = 0;

		this.reset();
	}

	reset() {
		const angle = Math.PI * 2 * Math.random();

		// lol dunno
		const r = WIDTH_HALF - 20 - (5 * randomGaussian() + WIDTH_HALF * (Math.pow(Math.random(), 7)));

		this.x = WIDTH_HALF + (Math.cos(angle) * r);
		this.y = HEIGHT_HALF + (Math.sin(angle) * r);
		this.age = randomBetween(100, 1000);
	}

	update(phase) {
		this.x += this.dx;
		this.y += this.dy;

		const noiseScale = 0.01;

		this.mood = noise.simplex3(this.x * noiseScale, this.y * noiseScale, phase);

		this.age -= 1;

		if (this.age <= 0) {
			this.reset();
		}
	}

	draw(ctx) {
		ctx.fillStyle = this.color;
		ctx.beginPath();
		ctx.rect(this.x, this.y, 0.5, 0.5);
		ctx.fill();
		ctx.closePath();
	}

	moodSimilarity(particle) {
		return 1 - Math.abs(particle.mood - this.mood);
	}
}

const NUM_PARTICLES = 500;

// Cappuccino
// const COLORS = ['#4b3832', '#854442', '#fff4e6', '#3c2f2f', '#be9b7b'];
// clairedelune
const COLORS = ['#413E4A', '#73626E', '#B38184', '#F0B49E', '#F7E4BE'];

const PARTICLES = new Array(NUM_PARTICLES).fill().map((_, i) => new Particle(i, randomArrayValue(COLORS)));

const clear = () => {
	ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
};

let phase = 0;

const loop = () => {
	PARTICLES.forEach(p1 => {

		let loveX = 0;
		let loveY = 0;

		PARTICLES.forEach(p2 => {
			if (p1.id === p2.id) {
				return;
			}

			const dx = p2.x - p1.x;
			const dy = p2.y - p1.y;

			const distance = Math.hypot(dx, dy);
			const angle = Math.atan2(dy, dx);

			// "For every particle pair: if they love each other, attract, reppel otherwise. "
			let love = 1 / distance;

			// hate
			if (distance < 2) {
				love *= -1;
			}

			love *= p1.moodSimilarity(p2);
			love *= 0.5;

			loveX += Math.cos(angle) * love;
			loveY += Math.sin(angle) * love;
		});

		p1.dx = loveX;
		p1.dy = loveY;

		p1.update(phase);
		p1.draw(ctx);
	});

	phase += 0.01;

	requestAnimationFrame(loop);
};

loop();
