const qs = sel => document.querySelector(sel);
const qsa = sel => Array.from(document.querySelectorAll(sel));
const distanceBetween = (vec1, vec2) => Math.hypot(vec2.x - vec1.x, vec2.y - vec1.y);
const randomBetween = (min, max) => Math.random() * (max - min) + min;
const getPixelIndex = ({ x, y }, imageData) => (~~x + ~~y * imageData.width) * 4;

const sourceURL = './image.jpg';

const ctxInput = qs('.js-source').getContext('2d');
const ctxOutput = qs('.js-output').getContext('2d');

const simplex = new SimplexNoise();

class Line {
	constructor(position, bounds) {
		this.position = position;
		this.positionPrevious = { x: this.position.x, y: this.position.y };
		this.bounds = bounds;

		this.amplitude = 2;
		this.length = 1;
		this.smoothness = 80;
		this.intensity = 0;

		this.getNewDirection();
	}

	update() {
		const incX = Math.cos(this.directionFrom) * this.length;
		const incY = Math.sin(this.directionFrom) * this.length;

		this.positionPrevious = { x: this.position.x, y: this.position.y };

		this.position.x += incX;
		this.position.y += incY;

		this.directionFrom += (this.directionTo - this.directionFrom) / this.smoothness;

		this.intensity *= 0.9;

		if (Math.abs(this.directionFrom - this.directionTo) <= 0.05) {
			this.getNewDirection(this.directionFrom);
		}
	}

	getNewDirection(from) {
		this.directionFrom = from || Math.random() * (Math.PI * 2);
		this.directionTo = this.directionFrom + randomBetween(-this.amplitude, this.amplitude)
	}

	checkBounds() {
		if (this.position.x < 0) {
			this.position.x = this.bounds.x;
		} else if (this.position.x > this.bounds.x) {
			this.position.x = 0;
		}

		if (this.position.y < 0) {
			this.position.y = this.bounds.y;
		} else if (this.position.y > this.bounds.y) {
			this.position.y = 0;
		}
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

	const percent = (r + g + b) / 765;
	const intensity = 1 - percent;

	return intensity;
};

const go = async () => {
	const image = await loadImage();
	const { width, height } = image;

	const lines = new Array(200).fill().map((i) => {
		const position = {
			x: Math.random() * width,
			y: Math.random() * height,
		};

		const bounds = {
			x: width,
			y: height,
		};

		const line = new Line(position, bounds);

		return line;
	});


	[ctxInput, ctxOutput].forEach((c) => {
		c.clearRect(0, 0, c.canvas.width, c.canvas.height);

		c.canvas.width = width;
		c.canvas.height = height;
	});

	ctxInput.drawImage(image, 0, 0);

	const imageData = ctxInput.getImageData(0, 0, width, height);

	const run = () => {
		lines.forEach((line) => {
			const intensityDark = getPixelIntensity(imageData, line.position);
			const intensityWhite = 1 - intensityDark;

			const lineWidth = 1; // (2 * (1 - intensityWhite));
			const smoothness = 30;
			const amplitude = 1 - (1 - intensityDark);

			line.smoothness = smoothness;
			line.intensity += intensityDark * 0.1;
			line.length = 3;

			ctxOutput.beginPath();
			ctxOutput.lineWidth = lineWidth;
			ctxOutput.strokeStyle = `rgba(0, 0, 0, ${0.01 + Math.pow(line.intensity, 3)})`;
			ctxOutput.moveTo(line.position.x, line.position.y);
			ctxOutput.lineTo(line.positionPrevious.x, line.positionPrevious.y);
			ctxOutput.closePath();
			ctxOutput.stroke();

			line.checkBounds();
			line.update();

		});

		requestAnimationFrame(run);
	};

	run();
};

go();
