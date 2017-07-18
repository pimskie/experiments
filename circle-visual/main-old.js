/**
 * Recreated / heavily inspired from:
 * Rectangle World
 * http://rectangleworld.com/blog/archives/538
 */

const toRadians = (degrees) =>  degrees * (Math.PI / 180);
const map = (value, inMin, inMax, outMin, outMax) => (value - inMin) * (outMax - outMin) / (inMax - inMin) + outMin;

const canvas = document.querySelector('.canvas');
const ctx = canvas.getContext('2d');

const SEGMENTS = 500;

let winWidth;
let winHeight;

let midX;
let midY;

let baseX;
let baseY;
let destX;
let destY;

let circleR;
let points;
let tick;

let rafId;

class Point {
	// circleR, midY, x, y, circleR
	constructor(baseX, baseY, r, a) {
		this.startX = baseX;
		this.startY = baseY;

		this.baseRadius = r;
		this.angle = a;
	}

	update(tick, baseX, baseY) {
		this.startX = baseX;
		this.startY = baseY;

		this.x = Math.cos(this.angle);
		this.y = Math.sin(this.angle);

		let factor = 1;
		let nx = this.x * factor;
		let ny = this.y * factor;

		this.radius = this.baseRadius + this.getNoise(tick + nx, tick + ny);

		this.x *= this.radius;
		this.y *= this.radius;

		this.x += this.startX;
		this.y += this.startY;
	}

	getNoise(a, b) {
		const max = 200;
		const n = noise.perlin2(a, b);

		return map(n, -1, 1, -max, max);
	}
}


const clearStage = () => {
	ctx.globalCompositeOperation = 'lighter';
	// ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
}


const reset = () => {
	winWidth = window.innerWidth;
	winHeight = window.innerHeight;

	midX = winWidth >> 1;
	midY = winHeight >> 1;

	baseX = -200;
	baseY = midY;

	currX = baseX;
	currY = baseY;

	destX = baseX;
	destY = baseY;

	circleR = 130;
	points = [];
	tick = performance.now();

	ctx.canvas.width = winWidth;
	ctx.canvas.height = winHeight;

	init();
}

const init = () => {
	let angle = 0;
	let angleStep = (Math.PI * 2) / SEGMENTS;

	let circleMidY = midY;

	for (let i = 0; i < SEGMENTS; i++) {

		let point = new Point(baseX, baseY, circleR, angle);
		point.update(tick, baseX, baseY);

		angle += angleStep;

		points.push(point);
	}
}

const loop = () => {
	clearStage();

	ctx.beginPath();

	// auto, left to right
	currX += 2;
	currY += 0; //midY + (midY * noise.perlin2(tick * 0.75, tick * 0.75));

	// or, mouse move
	// currX += (destX - currX) / 20;
	// currY += (destY - currY) / 20

	let blueNoise = noise.perlin2(currX, tick);
	let greenNoise = noise.perlin2(tick, currX);

	let r = 200 + Math.round(55 * noise.perlin2(currX, currX));
	let b = 100 + Math.round(255 * blueNoise);
	let g = 100 + Math.round(255 * greenNoise);

	let grad = ctx.createLinearGradient(-circleR, -circleR, circleR, circleR);
	grad.addColorStop(0, 'rgba(255, 0, 0, 0.1)');
	grad.addColorStop(1, `rgba(100, 100, 100, 0.1)`);
	ctx.strokeStyle = grad;
	ctx.lineWidth = 1;

	ctx.save();
	ctx.translate(currX, currY);

	points.forEach((point, index) => {
		ctx.beginPath();

		ctx.moveTo(point.x - currX, point.y - currY);

		point.update(tick, currX, currY);

		ctx.lineTo(point.x - currX, point.y - currY);

		ctx.stroke();
		ctx.closePath();
	});
	ctx.restore();

	if (currX - (circleR * 2) <= winWidth) {
		tick += 0.005;
		rafId = requestAnimationFrame(loop);
	}

}

const download = (e) => {
	var dataURL = ctx.canvas.toDataURL('image/png');
	e.target.href = dataURL;
}

// window.addEventListener('resize', reset);

document.querySelector('.redraw').addEventListener('click', reset);
document.querySelector('.download').addEventListener('click', download);

ctx.canvas.addEventListener('mousemove', (e) => {
	destX = e.pageX;
	destY = e.pageY;
});

reset();
loop();

noise.seed(Math.random());