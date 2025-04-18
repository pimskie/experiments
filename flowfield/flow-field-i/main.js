/* global dat: false */

// https://www.bit-101.com/blog/2017/10/23/flow-fields-part-i/

const q = (sel) => document.querySelector(sel);

const canvas = q('canvas');
const ctx = canvas.getContext('2d');

let width = window.innerWidth;
let height = window.innerHeight;

canvas.width = width;
canvas.height = height;

let particles = [];
let phase = Math.random() * Math.PI;

const getValue = (x, y) => {
	const { a, b, c, d } = settings;
	const scale = 0.008;

	x = (x - width / 2) * scale;
	y = (y - height / 2) * scale;

	// clifford
	// http://paulbourke.net/fractals/clifford/
	// const x1 = Math.sin(a * y) + c * Math.cos(a * x);
	// const y1 = Math.sin(b * x) + d * Math.cos(a * y);

	// peter de jong
	// http://paulbourke.net/fractals/peterdejong/
	const x1 = Math.sin(a * y) - Math.cos(b * x);
	const y1 = Math.sin(c * x) - Math.cos(d * y);

	return Math.atan2(y1 - y, x1 - x);
};

const render = (ctx, p, phase) => {
	const value = getValue(p.x, p.y);

	const hue = 180 + (180 * Math.sin(phase));
	const a = particles.length / (p.index + 1);

	ctx.save();
	ctx.lineWidth = 0.25;
	ctx.strokeStyle = `hsla(${hue}, 50%, 50%, ${a})`;

	ctx.beginPath();
	ctx.moveTo(p.x, p.y);

	p.update(value);

	ctx.lineTo(p.x, p.y);
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

	let y = height * 0.125;

	for (let i = 0; i < height * 0.75; i += 2) {
		particles.push({
			x: 0,
			y: y + i,
			vx: 0,
			vy: 0,
			index: i,
			update(noiseValue) {
				this.vx += Math.cos(noiseValue) * 0.3;
				this.vy += Math.sin(noiseValue) * 0.3;

				this.x += this.vx;
				this.y += this.vy;

				this.vx *= 0.99;
				this.vy *= 0.99;
			},
		});
	}

	phase = Math.random() * Math.PI;
};

const clear = () => {
	ctx.fillStyle = 'hsla(0, 0%, 100%, 0.009)';
	ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
};

const run = () => {
	clear();

	particles.forEach(p => render(ctx, p, phase));

	phase += 0.001;

	requestAnimationFrame(run);
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

gui.close();

window.addEventListener('resize', reset);
reset();
run();
