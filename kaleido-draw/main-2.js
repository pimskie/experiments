const angleBetween = (x1, y1, x2, y2) => Math.atan2(y2 - y1, x2 - x1);

const canvas = document.createElement('canvas');
const ctx = canvas.getContext('2d');
const PI2 = Math.PI * 2;

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

const sliceWidth = 200;
const sliceMidX = sliceWidth * 0.5;

const sliceHeight = 500;
const sliceMidY = sliceHeight * 0.5;

const clear = () => {
	ctx.clearRect(0, 0, canvasWidth, canvasHeight);

	// ctx.globalCompositeOperation = 'destination-out';
	// ctx.fillStyle = 'hsla(0, 0%, 0%, 0.5)';
	// ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
	// ctx.globalCompositeOperation = 'lighter';
}

const setStage = () => {
	clear();

	canvasWidth = window.innerWidth;
	canvasHeight = window.innerHeight;

	midX = canvasWidth >> 1;
	midY = canvasHeight >> 1;

	canvas.width = canvasWidth;
	canvas.height = canvasHeight;
}

const drawSlice = () => {
	ctx.beginPath();
	ctx.moveTo(sliceMidX, sliceHeight);
	ctx.lineTo(0, 0);
	ctx.lineTo(sliceWidth, 0);
	ctx.lineTo(sliceMidX, sliceHeight);
	ctx.stroke();
	ctx.closePath();

	ctx.clip();
}

const duplicate = () => {
	// angle from slice point in bottom to slice upper right
	const sliceAngle = angleBetween(sliceMidX, sliceHeight, sliceWidth, 0);

	// get slice image data
	const imageData = ctx.getImageData(0, 0, sliceWidth, sliceHeight);

	ctx.save();
	// ctx.translate(300, 100);
	ctx.rotate(1);

	// ctx.fillStyle = ctx.createPattern(canvas, 'repeat');
	// ctx.fill();

	ctx.putImageData(imageData, 0, 0);
	ctx.restore();
}

const loop = () => {
	clear();

	paths.forEach((path) => {
		ctx.beginPath();
		ctx.strokeStyle = '#000';
		ctx.lineWidth = 2;

		path.forEach((coords, i) => {
			if (i === 0) {
				ctx.moveTo(coords.x, coords.y);
			} else {
				ctx.lineTo(coords.x, coords.y);
			}
		});

		ctx.stroke();
		ctx.closePath();
	});

	frame++;
	rafId = requestAnimationFrame(loop);
}

window.addEventListener('resize', setStage);

canvas.addEventListener('mousedown', (e) => {
	// drawSlice();

	drawing = true;
	currentPath = [];

	paths.push(currentPath);

	currentPath.push({
		x: e.clientX,
		y: e.clientY
	});
});

canvas.addEventListener('mousemove', (e) => {
	if (!drawing) {
		return;
	}

	currentPath.push({
		x: e.clientX,
		y: e.clientY
	});
});

canvas.addEventListener('mouseup', (e) => {
	drawing = false;

	duplicate();

	cancelAnimationFrame(rafId)
});


document.body.appendChild(canvas);

setStage();
// drawSlice();
loop();