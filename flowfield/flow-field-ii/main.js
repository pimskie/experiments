/* global noise: false, dat: false */

// https://www.bit-101.com/blog/2017/10/28/flow-fields-part-ii/

noise.seed(Math.random());

const q = (sel) => document.querySelector(sel);
const PI2 = Math.PI * 2;

const canvas = q('canvas');
const ctx = canvas.getContext('2d');

let width = window.innerWidth;
let height = window.innerHeight;

canvas.width = width;
canvas.height = height;

const numParticles = 1000;
let particles = [];
let phase = Math.random() * Math.PI;

const getValue = (x, y, phase) => {
	const scale = 0.01;

	x *= scale;
	y *= scale;

	return noise.perlin3(x, y, phase) * PI2;
};

const render = (ctx, particle, phase) => {
	particle.checkBounds(ctx.canvas.width, ctx.canvas.height);

	const value = getValue(particle.x, particle.y, phase);

	const hue = 180 + (180 * Math.sin(phase));
	const a = particles.length / (particle.index + 1);

	ctx.save();
	ctx.lineWidth = 0.25;
	ctx.strokeStyle = `hsla(${hue}, 50%, 50%, ${a})`;

	ctx.beginPath();
	ctx.moveTo(particle.x, particle.y);

	particle.update(value);

	ctx.lineTo(particle.x, particle.y);
	ctx.stroke();
	ctx.closePath();

	ctx.restore();
};

const reset = () => {
	width = window.innerWidth;
	height = window.innerHeight;

	canvas.width = width;
	canvas.height = height;

	ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

	particles = [];

	for (let i = 0; i < numParticles; i++) {
		particles.push({
			x: Math.random() * width,
			y: Math.random() * height,
			vx: 0,
			vy: 0,
			index: i,
			checkBounds(width, height) {
				if (this.x <= 0) {
					this.x = width;
				} else if (this.x >= width) {
					this.x = 0;
				}

				if (this.y <= 0) {
					this.y = height;
				} else if (this.y >= height) {
					this.y = 0;
				}
			},

			update(noiseValue) {
				this.vx += Math.cos(noiseValue);
				this.vy += Math.sin(noiseValue);

				this.x += this.vx;
				this.y += this.vy;

				this.vx *= 0.05;
				this.vy *= 0.05;

			},
		});
	}

	phase = Math.random() * Math.PI;
};

const clear = () => {
	ctx.fillStyle = 'hsla(0, 0%, 100%, 0.1)';
	// ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
};

const run = () => {
	clear();

	particles.forEach(p => render(ctx, p, phase));

	phase += 0.001;

	requestAnimationFrame(run);
};


reset();
run();
