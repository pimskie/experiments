/* global noise: false, Vector: false, dat: false */

// https://www.bit-101.com/blog/2017/10/23/flow-fields-part-i/

noise.seed(Math.random());

const q = (sel) => document.querySelector(sel);

const canvas = q('canvas');
const ctx = canvas.getContext('2d');
const width = window.innerWidth;
const height = window.innerHeight;
const PI2 = Math.PI * 2;

canvas.width = width;
canvas.height = height;

const settings = {
	size: 10,
	numParticles: 1,
	differ: 0.09,
	updateSpeed: 10,
};

let rafId;

const particles = [];

for (let i = 0; i < height; i += 10) {
	particles.push({
		x: 0,
		y: i,
		vx: 0,
		vy: 0,
		index: i,
		pct: 10 + ((i + 1) / height) * 90,

		update() {
			this.x += this.vx;
			this.y += this.vy;
		},
	});
}


const a = 1.2 * Math.random();
const b = 4 * Math.random();
const c = 2 * Math.random() - 4;
const d = 0.2;

const getValue = (x, y) => {
	// / clifford attractor
	// http://paulbourke.net/fractals/clifford/

	// scale down x and y
	var scale = 0.008;
	x = (x - width / 2) * scale;
	y = (y - height / 2) * scale;

	// attactor gives new x, y for old one.
	const x1 = Math.sin(a * y) + (c * Math.cos(a * x));
	const y1 = Math.sin(b * x) + (d * Math.cos(a * y));

	// find angle from old to new. that's the value.
	return Math.atan2(y1 - y, x1 - x);
};

const render = (ctx, p, phase) => {
	const value = getValue(p.x, p.y);
	const hue = 180 + (180 * Math.sin(phase + (p.index * 0.001)));

	p.vx += Math.cos(value) * 0.3;
	p.vy += Math.sin(value) * 0.3;

	ctx.save();
	ctx.lineWidth = 0.25;
	ctx.strokeStyle = `hsl(${hue}, 75%, 50%)`;

	ctx.beginPath();
	ctx.moveTo(p.x, p.y);

	p.update();

	ctx.lineTo(p.x, p.y);
	ctx.stroke();
	ctx.closePath();

	ctx.restore();

	if (p.x > width) p.x = 0;
	if (p.y > height) p.y = 0;
	if (p.x < 0) p.x = width;
	if (p.y < 0) p.y = height;

	p.vx *= 0.99;
	p.vy *= 0.99;

};

const reset = () => {
	cancelAnimationFrame(rafId);

	ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

	run();
};

const clear = () => {
	ctx.fillStyle = 'hsla(0, 0%, 100%, 0.009)';
	ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
};

let phase = Math.random() * Math.PI;

const run = () => {
	// clear();

	particles.forEach(p => render(ctx, p, phase));

	phase += 0.001;
	rafId = requestAnimationFrame(run);
};

// const gui = new dat.GUI();
// gui.add(settings, 'size', 2, 100).step(1).onChange(reset);
// gui.add(settings, 'differ', 0.001, 0.9).step(0.001).onChange(reset);
// gui.add(settings, 'numParticles', 1, 1500).step(1).onChange(reset);


reset();
