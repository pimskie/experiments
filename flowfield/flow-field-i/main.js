/* global noise: false, dat: false */

// https://www.bit-101.com/blog/2017/10/23/flow-fields-part-i/

noise.seed(Math.random());

const q = (sel) => document.querySelector(sel);

const canvas = q('canvas');
const ctx = canvas.getContext('2d');
const width = window.innerWidth;
const height = window.innerHeight;

canvas.width = width;
canvas.height = height;

let rafId;
let particles = [];
let phase = Math.random() * Math.PI;

const getValue = (x, y) => {
	const { a, b, c, d } = settings;
	const scale = 0.008;

	x = (x - width / 2) * scale;
	y = (y - height / 2) * scale;

	// clifford
	// http://paulbourke.net/fractals/clifford/
	// const x1 = Math.sina * y) + c * Math.cosa * x));
	// const y1 = Math.sinb * x) + d * Math.cosa * y));

	// peter de jong
	// http://paulbourke.net/fractals/peterdejong/
	const x1 = Math.sin(a * y) - Math.cos(b * x);
	const y1 = Math.sin(c * x) - Math.cos(d * y);

	// find angle from old to new. that's the value.
	return Math.atan2(y1 - y, x1 - x);
};

const render = (ctx, p, phase) => {
	const value = getValue(p.x, p.y);

	const hue = 180 + (90 * Math.sin(phase));
	const a = particles.length / (p.index + 1);

	ctx.save();
	ctx.lineWidth = 0.25;
	ctx.strokeStyle = `hsla(${hue}, 90%, 50%, ${a})`;

	ctx.beginPath();
	ctx.moveTo(p.x, p.y);

	p.update(value, width, height);

	ctx.lineTo(p.x, p.y);
	ctx.stroke();
	ctx.closePath();

	ctx.restore();
};

const reset = () => {
	cancelAnimationFrame(rafId);

	ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

	particles = [];

	for (let i = 0; i < height; i += 1) {
		particles.push({
			x: 0,
			y: i,
			vx: 0,
			vy: 0,
			index: i,
			update(noiseValue, width, height) {
				this.vx += Math.cos(noiseValue) * 0.3;
				this.vy += Math.sin(noiseValue) * 0.3;

				this.x += this.vx;
				this.y += this.vy;

				this.vx *= 0.99;
				this.vy *= 0.99;

				if (this.x > width) {
					this.x = 0;
				}

				if (this.y > height) {
					this.y = 0;
				}

				if (this.x < 0) {
					this.x = width;
				}

				if (this.y < 0) {
					this.y = height;
				}
			},
		});
	}

	phase = Math.random() * Math.PI;

	run();
};

const clear = () => {
	ctx.fillStyle = 'hsla(0, 0%, 100%, 0.02)';
	ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
};

const run = () => {
	clear();

	particles.forEach(p => render(ctx, p, phase));

	// phase += 0.001;
	rafId = requestAnimationFrame(run);
};


const settings = {
	a: -0.99,
	b: 1,
	c: 1.34,
	d: -1.7,
	reset,
};

const gui = new dat.GUI();
gui.add(settings, 'a', -3, 3).step(0.01).onChange(reset);
gui.add(settings, 'b', -3, 3).step(0.01).onChange(reset);
gui.add(settings, 'c', -3, 3).step(0.01).onChange(reset);
gui.add(settings, 'd', -3, 3).step(0.01).onChange(reset);
gui.add(settings, 'reset');


reset();
