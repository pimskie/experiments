const distanceBetween = (x1, y1, x2, y2) => Math.sqrt((x1 - x2) * (x1 - x2) + (y1 - y2) * (y1 - y2));
const angleBetween = (x1, y1, x2, y2) => Math.atan2(y2 - y1, x2 - x1);

class Spring {
	constructor(x, y, k, damp) {
		this.x = x;
		this.y = y;

		this.k = k;
		this.damp = damp;

		this.velX = 0;
		this.velY = 0;

		this.length = 1;
		this.direction = 0;
	}

	update(destX, destY) {
		this.velX += -this.k * (this.x - destX);
		this.velX *= this.damp;

		this.velY += -this.k * (this.y - destY);
		this.velY *= this.damp;

		let newX = this.x + this.velX;
		let newY = this.y + this.velY;

		this.length = distanceBetween(this.x, this.y, newX, newY);
		this.direction = angleBetween(this.x, this.y, newX, newY);

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

let rafId = null;
let isAnimation = false;

const destination = {
	x: 0,
	y: 0
};

const springSettings = {
	k: 0.1,
	damp: 0.85
};

let spring;
let paths = [];
let completePath = [];
let currentPath = [];

let mouseDown = false;

const setStage = () => {
	canvasWidth = window.innerWidth;
	canvasHeight = window.innerHeight;
	canvasMidX = canvasWidth >> 1;
	canvasMidY = canvasHeight >> 1;

	canvas.width = canvasWidth;
	canvas.height = canvasHeight;
}

const updateDestination = (e) => {
	destination.x = e.offsetX;
	destination.y = e.offsetY;
}
const createSprings = () => {
	const x = canvasMidX;
	const y = canvasMidY;

	spring = new Spring(canvasMidX, canvasMidY, springSettings.k, springSettings.damp);
}

const draw = () => {
	if (!mouseDown) {
		rafId = requestAnimationFrame(draw);

		return;
	}

	const beginX = spring.x;
	const beginY = spring.y;

	currentPath.push([beginX, beginY]);

	spring.update(destination.x, destination.y);

	const endX = spring.x;
	const endY = spring.y;

	currentPath.push([endX, endY]);

	stroke(beginX, beginY, endX, endY);


	rafId = requestAnimationFrame(draw);
}

const animate = () => {
	isAnimation = true;

	clearStage();

	completePath = [].concat.apply([], paths);

	cancelAnimationFrame(rafId);

	redraw();
}

const redraw = () => {
	if (completePath.length < 2) {
		return;
	}

	const pointStart = completePath.shift();
	const pointEnd = completePath.shift();

	const beginX = pointStart[0];
	const beginY = pointStart[1];
	const endX = pointEnd[0];
	const endY = pointEnd[1];

	stroke(beginX, beginY, endX, endY);

	rafId = requestAnimationFrame(redraw);
}

const stroke = (beginX, beginY, endX, endY) => {
	const width = 40;
	const height = 2;

	const radiusW = width >> 1;
	const radiusH = height >> 1;

	ctx.beginPath();
	ctx.fillStyle = `rgba(0, 0, 0, 1)`;
	ctx.strokeStyle = `rgba(0, 0, 0, 1)`;

	ctx.moveTo(beginX - radiusW, beginY - radiusH);
	ctx.lineTo(beginX + radiusW, beginY + radiusH);
	ctx.lineTo(endX + radiusW, endY + radiusH);
	ctx.lineTo(endX - radiusW, endY - radiusH);
	ctx.lineTo(beginX - radiusW, beginY - radiusH);

	ctx.fill();
	ctx.stroke();
	ctx.closePath();
}

const reset = () => {
	paths = [];
	currentPath = [];

	clearStage();
}

const clearStage = () => {
	ctx.clearRect(0, 0, canvasWidth, canvasHeight);
}

const onKeyUp = (e) => {
	if (e.which === 90 && e.ctrlKey) {
		undo();
	}
}

const undo = () => {
	if (!paths.length) {
		return;
	}

	clearStage();
	paths.pop();

	paths.forEach(drawPath);
}

const drawPath = (path) => {
	for (let i = 0; i < path.length; i += 2) {
		const pos1 = path[i];
		const pos2 = path[i + 1];

		stroke(pos1[0], pos1[1], pos2[0], pos2[1]);
	}
}

canvas.classList.add('canvas');
canvas.addEventListener('mousemove', updateDestination);
canvas.addEventListener('mousedown', (e) => {
	cancelAnimationFrame(rafId);

	if (isAnimation) {
		isAnimation = false;

		clearStage();
		paths.forEach(drawPath);

		return;
	}

	spring.x = e.offsetX;
	spring.y = e.offsetY;

	spring.velX = 0;
	spring.velY = 0;

	mouseDown = true;

	currentPath = [];
	draw();
});

canvas.addEventListener('mouseup', (e) => {
	mouseDown = false;

	paths.push(currentPath);
});

document.addEventListener('keyup', onKeyUp);
document.body.appendChild(canvas);
setStage();

const guiActions = {
	animate,
	undo,
	reset
};

const gui = new dat.GUI();
gui.add(guiActions, 'animate');
gui.add(guiActions, 'undo');
gui.add(guiActions, 'reset');
gui.close();

createSprings();

// Exported a previous drawn text to an array
// Loop over the coordinates and try to position
// the text near the center of the screen
completePath = pathArray;

const drawingWidth = 620;
const originalOffsetX = 550;

completePath.forEach((point) => {
	point[0] = (point[0] - originalOffsetX) + ((window.innerWidth >> 1) - (drawingWidth >> 1));
});

isAnimation = true;

redraw();