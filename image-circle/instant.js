import '//unpkg.com/simplex-noise@2.4.0/simplex-noise';

let simplex = new SimplexNoise(Math.random());

const TAU = Math.PI * 2;

const canvasDraw = document.createElement('canvas');
const ctxDraw = canvasDraw.getContext('2d');

const canvasImage = document.createElement('canvas');
const ctxImage = canvasImage.getContext('2d');

document.body.appendChild(canvasDraw);

const width = 500;
const height = 500;

let phase = 0;
let rafId;

canvasDraw.width = width;
canvasDraw.height = height;
canvasImage.width = width;
canvasImage.height = height;

const brushWidth = 5;

let pixels;
const getPixelIndex = (x, y, imageData) => (~~x + ~~y * imageData.width) * 4;

const getColor = (position, ctx) => {
	const { x, y } = position;
	const pixelIndex = getPixelIndex(x, y, pixels);
	const pixelData = pixels.data;

	const r = pixelData[pixelIndex];
	const g = pixelData[pixelIndex + 1];
	const b = pixelData[pixelIndex + 2];

	const a = (r + g + b) <= 50 ? 0 : 1;

	return `rgba(${r}, ${g}, ${b}, ${a})`;

}

const gogogo = (img) => {
	simplex = new SimplexNoise(Math.random());

	cancelAnimationFrame(rafId);

	ctxDraw.clearRect(0, 0, canvasDraw.width, canvasDraw.height);
	ctxImage.drawImage(img, 0, 0);

	pixels = ctxImage.getImageData(0, 0, width, height);

	loop();
};

const loop = () => {
	for (let y = 0; y < height; y += brushWidth) {
		for (let x = 0; x < width; x += brushWidth) {
			const color = getColor({ x, y }, ctxImage);
			const noiseValue = simplex.noise3D(x * 0.01, y * 0.01, phase);

			const newX = x + (20 * noiseValue);
			const newY = y + (20 * noiseValue);

			ctxDraw.fillStyle = color;
			ctxDraw.fillRect(newX, newY, brushWidth, brushWidth);
			// ctxDraw.arc(newX, newY, brushWidth, 0, TAU);
			// ctxDraw.fill();
		}
	}

	phase += 0.01;
	rafId = requestAnimationFrame(loop);
};

const img = document.createElement('img');

img.crossOrigin = 'Anonymous';
img.addEventListener('load', () => {
	gogogo(img);

	canvasDraw.addEventListener('mouseup', () => gogogo(img));
});

img.src = 'http://pimskie.dev/public/assets/mona-lisa-500.jpg';
