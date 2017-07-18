const distanceBetween = (x1, y1, x2, y2) => Math.sqrt((x1 - x2) * (x1 - x2) + (y1 - y2) * (y1 - y2));
const clamp = (value, min, max) => Math.max(min, Math.min(value, max));
const randomBetween = (min, max) => ~~(Math.random() * (max - min + 1)) + min;

noise.seed(Math.random());

class Spring {
	constructor(x, y, k, damp) {
		this.x = x;
		this.y = y;

		this.k = k;
		this.damp = damp;

		this.velX = 0;
		this.velY = 0;

		this.length = 0;

		this.width = 1;
	}

	update(destX, destY, pivotX, pivotY) {
		this.velX += -this.k * (this.x - destX);
		this.velX *= this.damp;

		this.velY += -this.k * (this.y - destY);
		this.velY *= this.damp;

		let newX = this.x + this.velX;
		let newY = this.y + this.velY;

		this.length = ~~distanceBetween(this.x, this.y, newX, newY);
		this.x = newX;
		this.y = newY;
	}
}

const canvas = document.createElement('canvas');
const ctx = canvas.getContext('2d');

// all set in `setStage`
let canvasWidth;
let canvasHeight;
let canvasMidX;
let canvasMidY;
let distanceMid;
let radiusX;
let radiusY;
let destination = {
	x: 0,
	y: 0
};

let rafId = null;
let tick = 0;

let autoMovement = true;
let automationAngle = 0;

let springs = [];
let spring = null;


// define all viewport related vars
// and resize canvas
const setStage = () => {
	canvasWidth = window.innerWidth;
	canvasHeight = window.innerHeight;

	canvasMidX = canvasWidth >> 1;
	canvasMidY = canvasHeight >> 1;

	distanceMid = distanceBetween(0, 0, canvasMidX, canvasMidY);

	radiusX = distanceMid * 0.25;
	radiusY = distanceMid * 0.25;

	destination.x = canvasMidX;
	destination.y = canvasMidY;

	canvas.width = canvasWidth;
	canvas.height = canvasHeight;
}

// update destination to mouse position
const updateDestination = (e) => {
	destination.x = e.offsetX;
	destination.y = e.offsetY;
}

// create springs with random settings
const createSprings = () => {
	const x = canvasMidX;
	const y = canvasMidY;
	let numSprings = 1;

	while (numSprings--) {
		const k = Math.random() * (0.04) + 0.08;
		const damp = Math.random() * (0.04) + 0.9;
		const spring = new Spring(x, y, k, damp);

		springs.push(spring);
	}
}


const clearStage = () => {
	// ctx.globalCompositeOperation = 'destination-out';

	// ctx.fillStyle = 'rgba(0, 0, 0, 0.02)';
	// ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);

	// ctx.globalCompositeOperation = 'lighter';

	ctx.fillStyle = 'rgba(0, 0, 0, 0.02)';
	ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
}

const loop = () => {
	clearStage();

	// update position automaticly, based on perlin noise
	if (autoMovement) {
		destination.x = canvasMidX + (Math.cos(automationAngle) * radiusX);
		destination.y = canvasMidY + (Math.sin(automationAngle) * radiusY);

		destination.x = clamp(destination.x, 0, canvasWidth);
		destination.y = clamp(destination.y, 0, canvasHeight);

		automationAngle += noise.perlin2(tick, tick) * 0.25;
		radiusX += noise.perlin2(destination.x, destination.y) * 20;
		radiusY += noise.perlin2(destination.x, destination.y) * 20;
	}

	// define the color, based on position and perlin
	const mouseDistance = distanceBetween(canvasMidX, canvasMidY, destination.x, destination.y);
	const r = ~~(255 * (distanceMid - mouseDistance) / distanceMid);
	const g = ~~(255 * (mouseDistance / distanceMid));
	const b = ~~Math.abs(255 * (noise.perlin2(tick, tick)));

	// const color = `rgba(${r}, ${g}, ${b}, 0.1)`;
	const color = 'white';

	springs.forEach((spring) => {
		ctx.beginPath();

		ctx.strokeStyle = color;
		ctx.lineWidth = spring.width;

		ctx.moveTo(spring.x, spring.y);
		spring.update(destination.x, destination.y, canvasMidX, canvasMidY);
		ctx.lineTo(spring.x, spring.y);

		ctx.stroke();
		ctx.closePath();
	});

	tick += 0.005;

	rafId = requestAnimationFrame(loop);
}

canvas.addEventListener('mouseover', e => {
	autoMovement = false;
});

canvas.addEventListener('mouseout', e => {
	autoMovement = true;
});


canvas.addEventListener('mousemove', updateDestination);
window.addEventListener('resize', setStage);

document.body.appendChild(canvas);

// fire it up
setStage();
createSprings();
loop();
