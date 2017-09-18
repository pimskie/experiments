/**
 * https://www.openprocessing.org/sketch/392202
 */

const canvas = document.querySelector('.js-canvas');
const ctx = canvas.getContext('2d');

const imgUrl = './manmanman.jpg';
const img = new Image();
const PI = Math.PI;

let rafId = null;
let frame = 0;
let strokeLength = 100;
let strokeWidth = 1;

let imageData = null;
let pixelData = null;
let canvasWidth;
let canvasHeight;
let canvasMid = { x: 0, y: 0 };

const randomBetween = (min, max) => Math.floor(Math.random() * (max - min + 1) + min);
const getPixelIndex = (x, y, imageData) => (~~x + ~~y * imageData.width) * 4;

const drawLine = (pixelX, pixelY, pixelAngle, rgba, strokeLength, strokeWidth, recurse = false) => {
	const strokeStart = {
		x: Math.max(0, pixelX + (Math.cos(pixelAngle - PI) * strokeLength)),
		y: Math.max(0, pixelY + (Math.sin(pixelAngle - PI) * strokeLength)),
	};

	const strokeEnd = {
		x: Math.min(canvasWidth, pixelX + (Math.cos(pixelAngle) * strokeLength)),
		y: Math.min(canvasHeight, pixelY + (Math.sin(pixelAngle) * strokeLength)),
	};

	const cpX = randomBetween(strokeStart.x, strokeEnd.x);
	const cpY = randomBetween(strokeStart.y, strokeEnd.y);

	let strokeColor = `rgba(${rgba.join(', ')})`;

	ctx.beginPath();
	ctx.lineWidth = strokeWidth;
	ctx.strokeStyle = strokeColor;
	ctx.moveTo(strokeStart.x, strokeStart.y);
	ctx.quadraticCurveTo(cpX, cpY, strokeEnd.x, strokeEnd.y);
	ctx.stroke();
	ctx.closePath();

	if (recurse) {
		for (let i = strokeWidth; i > 0; i--) {
			const offsetPixelX = pixelX; // + randomBetween(-5, 5);
			const offsetPixelY = pixelY; // + randomBetween(-5, 5);
			const offsetRgba = rgba.map(c => c += randomBetween(-10, 10));

			drawLine(offsetPixelX, offsetPixelY, pixelAngle, offsetRgba, strokeLength, i, false);
		}
	}
};

const draw = () => {
	if (frame < 50) {
		strokeLength = randomBetween(50, 100);
		strokeWidth = 10;
	} else if (frame < 300) {
		strokeLength = randomBetween(25, 75);
		strokeWidth = 7;
	} else if (frame < 400) {
		strokeLength = randomBetween(5, 25);
		strokeWidth = 5;
	} else if (frame < 600) {
		strokeLength = randomBetween(10, 20);
		strokeWidth = 3;
	} else {
		strokeLength = randomBetween(3, 5);
		strokeWidth = 2;
	}

	const pixelX = randomBetween(0, canvasWidth);
	const pixelY = randomBetween(0, canvasHeight);
	const pixelIndex = getPixelIndex(pixelX, pixelY, imageData);
	const rgba = [
		pixelData[pixelIndex],
		pixelData[pixelIndex + 1],
		pixelData[pixelIndex + 2],
		pixelData[pixelIndex + 3],
	];

	const pixelAngle = randomBetween(0, PI * 2);

	drawLine(pixelX, pixelY, pixelAngle, rgba, strokeLength, strokeWidth, true);

	frame += 1;
	rafId = requestAnimationFrame(draw);
};

const onImageLoaded = () => {
	const { width: imgWidth, height: imgHeight } = img;

	const maxDim = Math.max(imgWidth, imgHeight);
	const defaultDim = 500;
	const scale = maxDim / defaultDim;

	canvasWidth = Math.min(defaultDim, imgWidth / scale);
	canvasHeight = Math.min(defaultDim, imgHeight / scale);
	canvasMid.x = canvasWidth * 0.5;
	canvasMid.y = canvasHeight * 0.5;

	canvas.width = canvasWidth;
	canvas.height = canvasHeight;

	// TODO: easier: https://stackoverflow.com/questions/13416800/how-to-generate-an-image-from-imagedata-in-javascript
	ctx.drawImage(img, 0, 0, imgWidth / scale, imgHeight / scale);

	imageData = ctx.getImageData(0, 0, canvasWidth, canvasHeight);
	pixelData = imageData.data;

	ctx.clearRect(0, 0, canvasWidth, canvasHeight);

	cancelAnimationFrame(rafId);
	frame = 0;

	draw();
};

img.addEventListener('load', onImageLoaded);
img.src = imgUrl;
