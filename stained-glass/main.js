const getPixelIndex = (x, y, imageData) => (~~x + ~~y * imageData.width) * 4;

const TAU = Math.PI * 2;
const NUM_CORNERS = 6;

const ctx = document.querySelector('.js-canvas').getContext('2d');
const ctxGhost = document.createElement('canvas').getContext('2d');

const imageUrl = 'https://pimskie.dev/public/assets/rotterdam-cropped.jpg';

let imageData;

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
	ctxGhost.canvas.width = width;
	ctxGhost.canvas.height = height;

	ctx.canvas.width = width;
	ctx.canvas.height = height;
};

const getImageData = (ctxDest, image) => {
	ctxDest.drawImage(image, 0, 0);

	const imageData  = ctxDest.getImageData(0, 0, ctxDest.canvas.width, ctxDest.canvas.height);

	return imageData;
};

const getColorFromPosition = ({ x, y }, imageData) => {
	const pixelIndex = getPixelIndex(x, y, imageData);

	return {
		r: imageData.data[pixelIndex],
		g: imageData.data[pixelIndex + 1],
		b: imageData.data[pixelIndex + 2],
	};
};


const draW = () => {
	const angleStep = TAU / NUM_CORNERS;
	const grid = 100;
	const radius = Math.ceil(ctx.canvas.width / grid);


	let startY = radius;

	for (let row = 0; row < grid; row++) {
		for (let col = 0; col < grid; col++) {
			const x = (col * (radius * 3)) * Math.cos(angleStep);
			const y = startY + ((Math.pow(-1, col) * Math.sin(angleStep)) * (radius  /2));

			const color = getColorFromPosition({ x, y }, imageData);

			ctx.save();
			ctx.translate(x, y);
			ctx.beginPath();
			ctx.fillStyle = `rgba(${color.r}, ${color.g}, ${color.b}, 1)`;

			for (let i = 0; i < NUM_CORNERS; i++) {
				const angle = i * angleStep;

				ctx.lineTo(Math.cos(angle) * radius, Math.sin(angle) * radius);
			}

			ctx.closePath();
			ctx.fill();
			ctx.restore();
		}

		startY += radius * 2 * Math.sin(angleStep);
	}
};

const start = async () => {
	const image = await loadImage();

	const { width, height } = image;

	setupCanvas(width, height);

	imageData = getImageData(ctxGhost, image);

	draW();
};

start();
