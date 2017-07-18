/**
 * http://www.complexification.net/gallery/machines/henonPhase/
 * http://paulbourke.net/fractals/henonphase/
 *
 * xn+1 = xn * cos(a) - (yn - xn2) * sin(a)
 * yn+1 = xn * sin(a) + (yn - xn2) * cos(a)
 */

/* globals Stats: false, dat: false, */

const qs = (sel) => document.querySelector(sel);

const stats = new Stats();
stats.showPanel(0);
qs('.js-stats').appendChild(stats.domElement);

const canvas = qs('.js-canvas');
const ctx = canvas.getContext('2d');

let canvasWidth = window.innerWidth;
let canvasHeight = window.innerHeight;
let midX = canvasWidth * 0.5;
let midY = canvasHeight * 0.5;
let maxDistance = 0;

let rafId = null;

const numParticles = 1000;
let particles = [];

canvas.width = canvasWidth;
canvas.height = canvasHeight;

// const pixelIndex = (x, y) => (x + y * imageData.width) * 4;

const reset = () => {
	canvasWidth = window.innerWidth;
	canvasHeight = window.innerHeight;

	midX = canvasWidth * 0.5;
	midY = canvasHeight * 0.5;
	maxDistance = Math.max(midX, midY);

	particles = [];

	canvas.width = canvasWidth;
	canvas.height = canvasHeight;

	ctx.clearRect(0, 0, canvasWidth, canvasHeight);
	cancelAnimationFrame(rafId);
	create();
	loop();
};

const create = () => {

	for (let i = 0; i < numParticles; i++) {
		const x = Math.random();
		const y = Math.random();

		particles.push({ x, y, screenX: x, screenY: y });
	}
};

const distanceBetween = (x1, y1, x2, y2) => Math.sqrt((x1 - x2) * (x1 - x2) + (y1 - y2) * (y1 - y2))

const singleDraw = () => {
	for (let i = 0; i < particles.length; i++) {
		const p = particles[i];

		const xSquare = p.x * p.x;
		const t = p.x * Math.cos(options.a) - (p.y - xSquare) * Math.sin(options.a);

		p.y = p.x * Math.sin(options.a) + (p.y - xSquare) * Math.cos(options.a);
		p.x = t;

		p.screenX = (midX + p.x * options.scale);
		p.screenY = (midY + p.y * options.scale);

		const dist = Math.abs(distanceBetween(p.screenX, p.screenY, midX, midY));
		const perc = dist / maxDistance;
		const hue = 40 + (210 * perc);

		const hsla = `hsla(${hue}, ${100 - (perc * 100)}%, 50%, ${1 - perc})`;

		ctx.beginPath();
		ctx.fillStyle = hsla;
		ctx.arc(p.screenX, p.screenY, 0.5, 0, Math.PI * 2, false);
		ctx.fill();
		ctx.closePath();
	}

	particles = particles.filter(p => !isNaN(p.screenX));
	rafId = requestAnimationFrame(loop);
};

const loop = () => {
	stats.begin();

	singleDraw();

	stats.end();
};

const options = {
	redraw: reset,
	a: 10, // 1.2
	scale: 400,
};

const gui = new dat.GUI();
gui.add(options, 'a').step(0.1).onFinishChange(reset);
gui.add(options, 'scale').min(10).max(2000).step(1).onFinishChange(reset);
gui.close();

reset();

window.addEventListener('resize', reset);
canvas.addEventListener('click', reset);
