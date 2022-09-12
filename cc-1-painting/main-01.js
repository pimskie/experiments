const TAU = Math.PI * 2;
const W = 500;
const H = W;

const ctx = document.querySelector('.js-lines').getContext('2d');
const ctxGhost = document.createElement('canvas').getContext('2d');

const imageUrl = './portrait1.jpg';

ctx.canvas.width = ctxGhost.canvas.width = W;
ctx.canvas.height = ctxGhost.canvas.height = H;

let imageData;

const getPixelIndex = (x, y, imageData) => (Math.floor(x) + Math.floor(y) * imageData.width) * 4;

const getColor = ({ x, y },) => {
	const pixelIndex = getPixelIndex(x, y, imageData);

	return {
		r: imageData.data[pixelIndex],
		g: imageData.data[pixelIndex + 1],
		b: imageData.data[pixelIndex + 2],
	};
};


const getImageData = (ctxDest, image) => {
	ctxDest.drawImage(image, 0, 0, ctxDest.canvas.width, ctxDest.canvas.height);

	return ctxDest.getImageData(0, 0, W, H);
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


const draw = () => {
	const x = Math.random() * W;
	const y = Math.random() * H;

	const color = getColor({ x, y });
	const radius = 3 + (Math.random() * 5)

	ctx.beginPath();
	ctx.fillStyle = `rgb(${color.r}, ${color.g}, ${color.b})`;
	ctx.arc(x, y, radius, 0, TAU);
	ctx.fill();
	ctx.closePath();

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
