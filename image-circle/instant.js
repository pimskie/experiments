let simplex = new SimplexNoise(Math.random());

const TAU = Math.PI * 2;

const canvasDraw = document.createElement('canvas');
const ctxDraw = canvasDraw.getContext('2d');

const canvasImage = document.createElement('canvas');
const ctxImage = canvasImage.getContext('2d');

document.body.appendChild(canvasDraw);

const width = 500;
const height = 500;

canvasDraw.width = width;
canvasDraw.height = height;
canvasImage.width = width;
canvasImage.height = height;

const brushWidth = 2;

let pixels;
const getPixelIndex = (x, y, imageData) => (~~x + ~~y * imageData.width) * 4;

const getColor = (position) => {
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

	ctxImage.drawImage(img, 0, 0);
	ctxDraw.drawImage(img, 0, 0);

	pixels = ctxImage.getImageData(0, 0, width, height);

	const numLoops = 5;

	for (let i = 0; i < numLoops; i++) {
		paint();
	}
};

const paint = () => {
	for (let y = 0; y < height; y += brushWidth) {
		for (let x = 0; x < width; x += brushWidth) {
			const color = getColor({ x, y }, ctxImage);
			const noiseValue = simplex.noise3D(x * 0.01, y * 0.01, 1);

			const newX = x + (20 * noiseValue);
			const newY = y + (20 * noiseValue);

			ctxDraw.fillStyle = color;
			ctxDraw.fillRect(newX, newY, brushWidth, brushWidth);
		}
	}
};

const img = document.createElement('img');

img.crossOrigin = 'Anonymous';
img.addEventListener('load', () => {
	gogogo(img);

	canvasDraw.addEventListener('mouseup', () => gogogo(img));
});

img.src = 'https://pimskie.dev/public/assets/mona-lisa-500.jpg';
// https://upload.wikimedia.org/wikipedia/en/thumb/6/61/Attempted_restoration_of_Ecce_Homo.jpg/180px-Attempted_restoration_of_Ecce_Homo.jpg
