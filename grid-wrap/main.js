const angleDiff = (angleStart, angleTarget) => Math.atan2(Math.sin(angleTarget - angleStart), Math.cos(angleTarget - angleStart));
const angleBetween = (x1, y1, x2, y2) => Math.atan2(y2 - y1, x2 - x1);
const distanceBetween = (x1, y1, x2, y2) => Math.sqrt((x1 - x2) * (x1 - x2) + (y1 - y2) * (y1 - y2));

const canvas = document.createElement('canvas');
const ctx = canvas.getContext('2d');

const dotWidth = 20;
const dotRadius = dotWidth >> 1;
const dotSpacing = 8;

// all set in `setStage`
let canvasWidth;
let canvasHeight;
let canvasMidX;
let canvasMidY;
let gridWidth;
let halfGridWidth;
let numCols;
let numRows;

let mouseClick = {};
let gridOptions = {
	scale: 0,
	rotation: 0.02,
};

const clearStage = () => {
	ctx.clearRect(0, 0, canvas.width, canvas.height);
}

const drawGrid = (scale = 1, rotation = 0) => {
	clearStage();

	const startX = -halfGridWidth;
	let x = startX;
	let y = -halfGridWidth;

	ctx.save();
	ctx.translate(canvasMidX, canvasMidY);

	for (let row = 0; row <= numRows; row++) {
		for (let col = 0; col <= numCols; col++) {

			// http://omrelli.ug/g9/gallery/
			const radius = Math.sqrt(x * x + y * y);
			const theta = Math.atan2(y, x);

			const dotX = scale * radius * Math.cos(theta + rotation * radius);
			const dotY = scale * radius * Math.sin(theta + rotation * radius);

			const percent = radius / gridWidth;
			const dotScale = Math.max(0.1, 1 - percent);
			const dotAlpha = Math.max(0.1, 1 - percent);

			const fill = ctx.createRadialGradient(dotX, dotY, 0, dotX, dotY, dotRadius * dotScale);
			const darkness = 75;

			fill.addColorStop(0.1, `rgba(0, 0, 0, 1)`);
			fill.addColorStop(1, `rgba(${darkness}, ${darkness}, ${darkness}, 1)`);

			ctx.beginPath();
			ctx.fillStyle = fill; // `rgba(0, 0, 0, ${dotAlpha})`;
			ctx.arc(dotX, dotY, dotRadius * dotScale, 0, Math.PI * 2);
			ctx.fill();
			ctx.closePath();

			x += dotWidth + dotSpacing;
		}

		x = startX;
		y += dotWidth + dotSpacing;
	}

	ctx.restore();
}

const onMouseDown = (e) => {
	TweenMax.killAll();

	document.addEventListener('mousemove', onMouseMove);
	document.addEventListener('mouseup', onMouseUp);

	mouseClick.angle = angleBetween(e.offsetX, e.offsetY, canvasMidX, canvasMidY);
}

const onMouseMove = (e) => {
	const mouseX = e.clientX;
	const mouseY = e.clientY;

	const dist = distanceBetween(mouseX, mouseY, canvasMidX, canvasMidY);
	const max = Math.sqrt(halfGridWidth * halfGridWidth + halfGridWidth * halfGridWidth);
	const angle = angleBetween(mouseX, mouseY, canvasMidX, canvasMidY);
	const diffMouseAngle = angleDiff(mouseClick.angle, angle);

	gridOptions.scale = dist / max;
	gridOptions.rotation += diffMouseAngle * 0.006;

	mouseClick.angle = angle;

	drawGrid(gridOptions.scale, gridOptions.rotation);
}

const onMouseUp = (e) => {
	document.removeEventListener('mousemove', onMouseMove);

	TweenMax.to(gridOptions, 1, {
		rotation: 0,
		scale: 1,
		ease: Back.easeOut,
		onUpdate: () => {
			drawGrid(gridOptions.scale, gridOptions.rotation);
		}
	});
}

const setStage = () => {
	canvasWidth = window.innerWidth;
	canvasHeight = window.innerHeight;
	canvasMidX = canvasWidth >> 1;
	canvasMidY = canvasHeight >> 1;
	gridWidth = Math.min(400, window.innerWidth - 50);
	halfGridWidth = gridWidth >> 1;

	numCols = gridWidth / (dotWidth + dotSpacing);
	numRows = numCols;

	canvas.width = canvasWidth;
	canvas.height = canvasHeight;
}

canvas.classList.add('canvas');
canvas.addEventListener('mousedown', onMouseDown);
window.addEventListener('resize', () => {
	TweenMax.killAll();

	setStage();
	drawGrid(gridOptions.scale, gridOptions.rotation);
});

setStage();
document.body.appendChild(canvas);

TweenMax.to(gridOptions, 0.5, {
	scale: 2,
	ease: Power4.easeIn,
	onUpdate: () => {
		drawGrid(gridOptions.scale, gridOptions.rotation);
	}
});

TweenMax.to(gridOptions, 0.5, {
	rotation: 0,
	scale: 1,
	ease: Back.easeOut,
	onUpdate: () => {
		drawGrid(gridOptions.scale, gridOptions.rotation);
	}
}).delay(1);