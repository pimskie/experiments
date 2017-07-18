const angleBetween = (x1, y1, x2, y2) => Math.atan2(y2 - y1, x2 - x1);

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

		// this.length = ~~distanceBetween(this.x, this.y, newX, newY);
		this.x = newX;
		this.y = newY;
	}
}


const canvas = document.createElement('canvas');
const ctx = canvas.getContext('2d');

const canvasSlice = document.createElement('canvas');
const ctxSlice = canvasSlice.getContext('2d');

const PI2 = Math.PI * 2;
const numSlices = 20;

// all set in `setStage`
let canvasWidth;
let canvasHeight;
let canvasMidX;
let canvasMidY;

let rafId = null;
let timeoutId = null;
let frame = 0;

let paths = [];
let currentPath = [];

let drawing = false;
let destination = {
	x: 0,
	y: 0
};

const spring = new Spring(200, 200, 0.08, 0.9);

const sliceWidth = 200;
const sliceMidX = sliceWidth * 0.5;

const sliceHeight = 500;
const sliceMidY = sliceHeight * 0.5;

const clear = () => {
	ctxSlice.clearRect(0, 0, canvasWidth, canvasHeight);
	ctx.clearRect(0, 0, canvasWidth, canvasHeight);

	// ctxSlice.fillStyle = 'rgba(255, 255, 255, 0.02)';
	// ctxSlice.fillRect(0, 0, ctxSlice.canvas.width, ctxSlice.canvas.height);

	// ctx.fillStyle = 'rgba(255, 255, 255, 0.02)';
	// ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
}

const setStage = () => {
	clear();

	canvasWidth = 800;
	canvasHeight = 800;

	midX = canvasWidth >> 1;
	midY = canvasHeight >> 1;

	// bleeeeeeh
	canvas.width = canvasSlice.width = canvasWidth;
	canvas.height = canvasSlice.height = canvasHeight;
}

const drawSlice = () => {
	// // so much useless code, probably
	const r = canvasWidth >> 1;
	const w = 100;
	const h = 300;
	const num = 20;
	const angle = (PI2 / 4);
	const angleInc = PI2 / numSlices;

	const x = midX - (w * 0.5) + Math.cos(angle);
	const y = midY - h + Math.sin(angle);

	ctxSlice.save();

	ctxSlice.translate(canvas.width * 0.5, canvas.height * 0.5); // center (+0.5 to make sharper)
	ctxSlice.scale(1, -1);
	ctxSlice.rotate(angle - (angleInc / 2));

	ctxSlice.beginPath();
	ctxSlice.strokeStyle = 'rgba(0, 0, 0, 0.1)';
	ctxSlice.lineWidth = 0.5;

	ctxSlice.moveTo(0, 0);
	ctxSlice.lineTo(r, 0);
	ctxSlice.arc(0, 0, r, 0, angleInc);
	ctxSlice.lineTo(0, 0);

	ctxSlice.stroke();
	ctxSlice.closePath();

	ctxSlice.restore();
}

const drawDuplicates = () => {
	const angleInc = PI2 / numSlices;

	for (let i = 1; i <= numSlices; i++) {
		const angle = i * angleInc;
		const scale = i % 2 === 0 ? 1 : -1;
		ctx.save();
		ctx.translate(midX, midY);
		ctx.scale(1, scale);
		ctx.rotate(angle);

		ctx.drawImage(canvasSlice, 0, 0, canvas.width, canvas.height, -midX - 0.5, -(midY - 0.5), canvas.width, canvas.height);
		ctx.restore();
	}
}

const loop = () => {
	clear();

	drawSlice();

	const drawOn = ctxSlice;

	// drawOn.beginPath();

	// drawOn.strokeStyle = 0x000000;
	// drawOn.lineWidth = spring.width;

	// drawOn.moveTo(spring.x, spring.y);
	// spring.update(destination.x, destination.y, canvasMidX, canvasMidY);
	// drawOn.lineTo(spring.x, spring.y);

	// drawOn.stroke();
	// drawOn.closePath();

	paths.filter(p => p.length > 0).forEach((path) => {
		drawOn.beginPath();
		drawOn.strokeStyle = '#000';
		drawOn.lineWidth = 2;

		path.forEach((coords, i) => {
			if (i === 0) {
				drawOn.moveTo(coords.x, coords.y);
			} else {
				drawOn.lineTo(coords.x, coords.y);
			}
		});

		drawOn.stroke();
		drawOn.closePath();
	});

	drawDuplicates();

	rafId = requestAnimationFrame(loop);
}

window.addEventListener('resize', setStage);

canvasSlice.addEventListener('mousedown', (e) => {
	drawing = true;
	currentPath = [];

	paths.push(currentPath);
});

canvasSlice.addEventListener('mousemove', (e) => {
	if (!drawing) {
		return;
	}

	const x = e.clientX;
	const y = e.clientY;

	spring.update(x, y, midX, midY);

	currentPath.push({ x, y });
});

canvasSlice.addEventListener('mouseup', (e) => {
	drawing = false;
});


canvasSlice.classList.add('slice');

document.body.appendChild(canvasSlice);
document.body.appendChild(canvas);

setStage();
drawSlice();
loop();