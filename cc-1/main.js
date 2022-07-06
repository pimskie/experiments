const TAU = Math.PI * 2;

const W = 500;
const H = W;

const getPixelIndex = (x, y, imageData) => (Math.floor(x) + Math.floor(y) * imageData.width) * 4;
noise.seed(Math.random());

let points = [];
let imageData;

const ctx = document.querySelector('.js-lines').getContext('2d');
const ctxGhost = document.createElement('canvas').getContext('2d');
const imageUrl = 'https://pimskie.dev/public/assets/portrait1.jpg';

const getColor = ({ x, y },) => {
	const pixelIndex = getPixelIndex(x, y, imageData );

	return {
		r: imageData.data[pixelIndex],
		g: imageData.data[pixelIndex + 1],
		b: imageData.data[pixelIndex + 2],
	};
};
const getPosition = () =>  ({ x: Math.random() * W, y:  Math.random() * H });
const getLightness = (color) =>((color.r + color.g + color.b) / (3 * 255));
const getNoiseValue = ({ x, y }, scale = 0.001) => noise.simplex2(x * scale, y * scale);

const reset = () => ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

const loadImage = () => {
	const img = new Image();
	img.crossOrigin = '';

	return new Promise(function(resolve, reject) {
		img.addEventListener('load', () => {
			resolve(img);
		});

		img.src = imageUrl;
	});
};

const setupCanvas = (width, height) => {
	ctx.canvas.width = width;
	ctx.canvas.height = height;

	ctxGhost.canvas.width = width;
	ctxGhost.canvas.height = height;
};

const getImageData = (ctxDest, image) => {
	ctxDest.drawImage(image, 0, 0, ctxDest.canvas.width, ctxDest.canvas.height);

	return ctxDest.getImageData(0, 0, W, H);
};

const drawStroke = () => {
	const { x, y } = getPosition();
	const color = getColor({ x, y });
	const colorDarken = Math.random() * 30;

	const noiseValue = getNoiseValue({ x, y }, 0.008);
	const angle = TAU * noiseValue;

	const lightness = getLightness(color);

	const lengthMin = 10;
	const lengthVariation = 10;
	const length = lengthMin + (lengthVariation * lightness);

	ctx.save();
	ctx.translate(x, y);
	ctx.rotate(angle);

	ctx.fillStyle = `rgba(${color.r + colorDarken}, ${color.g + colorDarken}, ${color.b + colorDarken}, 1)`;
	ctx.strokeStyle = 'rgba(1, 1, 1, 0.4)';
	ctx.beginPath();
	ctx.rect(0, 0, length, length * 0.25);
	ctx.fill();
	ctx.stroke();
	ctx.closePath();
	ctx.restore();
};

const clear = () => ctx.clearRect(0, 0, W, H);

const loop = () => {
	for (let i = 0; i < 40; i++) {
		drawStroke();
	}

	requestAnimationFrame(loop);
};

const start = async () => {
	const image = await loadImage();

	setupCanvas(W, H);

	imageData = getImageData(ctxGhost, image);

	ctx.canvas.addEventListener('click', () => {
		reset();
	});

	reset();
	loop();
};

start();
