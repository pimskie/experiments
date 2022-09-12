const TAU = Math.PI * 2;
const W = 500;
const H = W;

let imageData;

const ctx = document.querySelector('.js-lines').getContext('2d');
const ctxGhost = document.createElement('canvas').getContext('2d');
const imageUrl = './portrait1.jpg';

noise.seed(Math.random());

ctx.canvas.width = ctxGhost.canvas.width = W;
ctx.canvas.height = ctxGhost.canvas.height = H;

const getPixelIndex = (x, y, imageData) => (Math.floor(x) + Math.floor(y) * imageData.width) * 4;

const getColor = ({ x, y },) => {
	const pixelIndex = getPixelIndex(x, y, imageData);

	return {
		r: imageData.data[pixelIndex],
		g: imageData.data[pixelIndex + 1],
		b: imageData.data[pixelIndex + 2],
	};
};

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

const getImageData = (ctxDest, image) => {
	ctxDest.drawImage(image, 0, 0, ctxDest.canvas.width, ctxDest.canvas.height);

	return ctxDest.getImageData(0, 0, W, H);
};

const draw = () => {
	const x = Math.random() * W;
	const y = Math.random() * H;

	const strokeW = 10 + (Math.random() * 20);
	const strokeH = 5;
	const color = getColor({ x, y });
	const darkness = Math.random() * 50;

	const noiseValue = noise.simplex2(x * 0.003, y * 0.003);

	ctx.save();
	ctx.translate(x, y);
	ctx.rotate(noiseValue * TAU);
	ctx.beginPath();
	ctx.fillStyle = `rgb(${color.r + darkness}, ${color.g + darkness}, ${color.b +darkness})`;
	ctx.rect(0, 0, strokeW, strokeH);
	ctx.fill();
	ctx.closePath();
	ctx.restore();
};

const clear = () => ctx.clearRect(0, 0, W, H);

const loop = () => {
	for (let i = 0; i < 40; i++) {
		draw();
	}

	requestAnimationFrame(loop);
};

const start = async () => {
	const image = await loadImage();

	imageData = getImageData(ctxGhost, image);

	ctx.canvas.addEventListener('click', reset);

	loop();
};

start();
