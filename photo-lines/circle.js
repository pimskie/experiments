const qs = sel => document.querySelector(sel);
const qsa = sel => Array.from(document.querySelectorAll(sel));
const distanceBetween = (vec1, vec2) => Math.hypot(vec2.x - vec1.x, vec2.y - vec1.y);
const randomBetween = (min, max) => Math.random() * (max - min) + min;
const getPixelIndex = ({ x, y }, imageData) => (~~x + ~~y * imageData.width) * 4;

const sourceURL = './image11.jpg';

const ctxInput = qs('.js-source').getContext('2d');
const ctxOutput = qs('.js-output').getContext('2d');
const simplex = new SimplexNoise();

const loadImage = () => {
	const image = new Image();

	return new Promise((resolve, reject) => {
		image.addEventListener('load', (e) => {
			return resolve(image);
		});

		image.src = sourceURL;
	});
};

const getPixelIntensity = (imageData, position) => {
	const i = getPixelIndex(position, imageData);
	const { data } = imageData;

	const r = data[i] || 255;
	const g = data[i + 1] || 255;
	const b = data[i + 2] || 255;
	const a = data[i + 3] || 255;

	const percent = (r + g + b) / (3 * 255);
	const intensity = 1 - percent;

	return intensity;
};

const setupCanvases = (ctxInput, ctxOutput, image, maxWidth = 500) => {
	const { width: widthOriginal, height: heightOriginal } = image;
	const widthMax = 500;
	const width = Math.min(widthOriginal, widthMax);
	const height = heightOriginal / (widthOriginal / width)

	const ctxs = [ctxInput, ctxOutput];

	ctxs.forEach((c) => {
		c.clearRect(0, 0, c.canvas.width, c.canvas.height);

		c.canvas.width = width;
		c.canvas.height = height;
	});

	ctxInput.drawImage(image, 0, 0, width, height);
}

const drawCircle = (center, radius, segments, imageData, ctx) => {
	const TAU = Math.PI * 2;
	const angleStep = TAU / segments;

	// 1 + (1 - (1 - (1 * 0.1)))

	for (let i = 1; i < segments + 1; i++) {
		const angleFrom = angleStep * (i - 1);
		const angleTo = angleStep * i;

		const from = {
			x: center.x + (Math.cos(angleFrom) * radius),
			y: center.y + (Math.sin(angleFrom) * radius),
		};

		const to = {
			x: center.x + (Math.cos(angleTo) * radius),
			y: center.y + (Math.sin(angleTo) * radius),
		};

		ctx.beginPath();
		ctx.moveTo(from.x, from.y);
		ctx.lineTo(to.x, to.y);
		ctx.stroke();
		ctx.closePath();
	}
};

const go = async () => {
	const image = await loadImage();

	setupCanvases(ctxInput, ctxOutput, image);

	const { canvas: { width, height } } = ctxOutput;
	const imageData = ctxInput.getImageData(0, 0, width, height);

	let radius = Math.max(width, height) * 0.48;
	const decay = 10;

	const center = {
		x: width * 0.5,
		y: height * 0.5,
	};

	const run = () => {
		while (radius >= decay) {
			drawCircle(center, radius, 100, imageData, ctxOutput);

			radius -= decay;
		}
	};

	run();
};

go();
