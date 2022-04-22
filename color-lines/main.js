const TAU = Math.PI * 2;

const W = 500;
const H = W;
const NUM_POINTS = 400;

(vec1, vec2) => Math.hypot(vec2.x - vec1.x, vec2.y - vec1.y)
const getPixelIndex = (x, y, imageData) => (~~x + ~~y * imageData.width) * 4;
const distanceBetween = (vec1, vec2) => Math.hypot(vec2.x - vec1.x, vec2.y - vec1.y);
const clamp = (value, min, max) => Math.max(min, Math.min(value, max));

let points = [];

const ctx = document.querySelector('.js-lines').getContext('2d');
const ctxGhost = document.createElement('canvas').getContext('2d');
const imageUrl = 'https://pimskie.dev/public/assets/bird.jpg';

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


const getPoint = (width, height) => {
	const padding = 10;

	return {
		x: padding + (Math.random() * (width - padding)),
		y: padding + (Math.random() * (height - padding)),
		v: 1,
		angle: Math.random() * TAU,
		r: 1 + Math.random() * 5,
	};
};

const generatePoints = (num, width, height) => {
	points = new Array(num).fill().map((_, i) => [
		getPoint(width, height),
		getPoint(width, height),
	]);
};

const updatePoint = (point) => {
	const vx = Math.cos(point.angle) * 2;
	const vy = Math.sin(point.angle) * 2;

	if (point.x > W) {
		point.x = 0;
	}

	if (point.x < 0) {
		point.x = W;
	}

	if (point.y > H) {
		point.y = 0;
	}

	if (point.y < 0) {
		point.y = H;
	}

	point.x += vx;
	point.y += vy;
};


const drawPoint = (point) => {
	const r = 3;

	ctx.beginPath();
	ctx.arc(point.x - (r / 2), point.y - (r / 2), r, 0, TAU);
	ctx.closePath();
	ctx.fill();
};


const connect = (from, to) => {
	const mid = {
		x: ~~((from.x + to.x) / 2),
		y: ~~((from.y + to.y) / 2),
	};

	const distance = distanceBetween(from, to);
	const a = clamp(1 - (distance / 150), 0, 1) * 0.5;

	const { r, g, b } = getColorFromPosition(mid, imageData);

	ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, ${a})`;
	ctx.beginPath();
	ctx.moveTo(from.x, from.y);
	ctx.lineTo(to.x, to.y);
	ctx.stroke();
	ctx.closePath();
};

const updatePoints = () => {
	points.forEach(([pointA, pointB]) => {
		updatePoint(pointA);
		updatePoint(pointB);
		connect(pointA, pointB);
	});
};

const clear = () => ctx.clearRect(0, 0, W, H);

const loop = () => {
	updatePoints();

	requestAnimationFrame(loop);
};

const start = async () => {
	const image = await loadImage();

	const { width, height } = image;

	setupCanvas(W, H);
	generatePoints(NUM_POINTS, W, H);

	imageData = getImageData(ctxGhost, image);

	ctx.canvas.addEventListener('click', () => {
		ctx.clearRect(0, 0, width, height);
	});

	loop();
};

start();

