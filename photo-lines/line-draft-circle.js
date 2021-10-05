const qs = sel => document.querySelector(sel);
const qsa = sel => Array.from(document.querySelectorAll(sel));
const distanceBetween = (vec1, vec2) => Math.hypot(vec2.x - vec1.x, vec2.y - vec1.y);
const randomBetween = (min, max) => Math.random() * (max - min) + min;
const getPixelIndex = ({ x, y }, imageData) => (~~x + ~~y * imageData.width) * 4;

const sourceURL = './image1.jpg';

const ctxInput = qs('.js-source').getContext('2d');
const ctxOutput = qs('.js-output').getContext('2d');
const simplex = new SimplexNoise();

class Line {
	constructor(center, radius) {
		this.center = center;
		this.radius = radius;

		this.angle = 0;
		this.angleSpeed = 0.1;
		this.decay = 0.07;
		this.width = 0.5;

		this.posFrom = {
			x: this.center.x + (Math.cos(this.angle) * this.radius),
			y:this.center.y + (Math.sin(this.angle) * this.radius),
		};

		this.posTo = {
			x: this.posFrom.x,
			y: this.posFrom.y,
		};
	}

	update(intensity) {
		this.radius -= this.decay;
		this.radius = Math.max(0, this.radius);

		this.angle += this.angleSpeed;
		this.width += intensity;
		this.width *= 0.85;

		this.updatePosition();
	}

	updatePosition() {
		this.posFrom = {
			x: this.posTo.x,
			y: this.posTo.y,
		};

		this.posTo = {
			x: this.center.x + (Math.cos(this.angle) * this.radius),
			y: this.center.y + (Math.sin(this.angle) * this.radius),
		};
	}
}

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

const drawSegment = (imageData, line, ctxOutput, iteration) => {
	const { posFrom, posTo } = line;

	const intesityDark = getPixelIntensity(imageData, line.posTo);
	const intensityWhite = 1 - intesityDark;

	const noiseScale = 0.005;
	const noiseValue = simplex.noise2D(posFrom.x * noiseScale, posFrom.y * noiseScale);

	const lineIntensity = noiseValue;

	line.update(intesityDark);

	ctxOutput.beginPath();
	ctxOutput.lineWidth = line.width;
	ctxOutput.moveTo(posFrom.x, posFrom.y);
	ctxOutput.lineTo(posTo.x, posTo.y);
	ctxOutput.closePath();
	ctxOutput.stroke();
};

const go = async () => {
	const image = await loadImage();

	setupCanvases(ctxInput, ctxOutput, image);

	const { canvas: { width, height } } = ctxOutput;
	const imageData = ctxInput.getImageData(0, 0, width, height);

	const radius = Math.max(width, height) * 0.51;
	const center = {
		x: width * 0.5,
		y: height * 0.5,
	};

	const line = new Line(center, radius);

	const run = () => {
		// const iterations = 20000;

		// for (let i = 0; i < iterations; i++) {
		// 	drawSegment(imageData, line, ctxOutput, i);
		// }

		while (line.radius > 1) {
			drawSegment(imageData, line, ctxOutput);
		}

		// drawSegment(imageData, line, ctxOutput);
		// drawSegment(imageData, line, ctxOutput);

		// requestAnimationFrame(run);
	};

	run();
};

go();
