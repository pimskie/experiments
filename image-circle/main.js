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

const midX = width * 0.5;
const midY = height * 0.5;

const painters = [];

let phase = 0;
let rafId;

let pixelData;


canvasDraw.width = width;
canvasDraw.height = height;

canvasImage.width = width;
canvasImage.height = height;

class Painter {
	constructor(radius, angle, speed) {
		this.radius = radius;
		this.radiusBase = this.radius;

		this.angle = angle;
		this.speed = speed;

		this.width = 1;
		this.position = { x: 0, y: 0 };

		this.setPosition();
	}

	setPosition() {
		this.position.x = Math.cos(this.angle) * this.radius;
		this.position.y = Math.sin(this.angle) * this.radius;
	}

	get positionClean() {
		const x = Math.cos(this.angle) * this.radiusBase;
		const y = Math.sin(this.angle) * this.radiusBase;

		return { x, y };
	}

	getNoiseValue(frame) {
		const scale = 0.01;
		const { position } = this;

		return simplex.noise2D(position.x * scale, position.y * scale);
		// return simplex.noise3D(position.x * scale, position.y * scale, frame * (scale * 0.5));
	}

	update(frame = 1) {
		const noiseValue = this.getNoiseValue(frame);

		this.angle += this.speed;
		this.radius = this.radiusBase + (20 * noiseValue);
		this.width = 2 + (2 * noiseValue);

		this.setPosition();
	}
}

const getPixelIndex = (x, y, imageData) => (~~x + ~~y * imageData.width) * 4;

const getColor = (position, ctx) => {
	const pixelIndex = getPixelIndex(position.x, position.y, pixelData);

	const r = pixelData.data[pixelIndex];
	const g = pixelData.data[pixelIndex + 1];
	const b = pixelData.data[pixelIndex + 2];

	const a = (r + g + b) <= 50 ? 0 : 1;

	return `rgba(${r}, ${g}, ${b}, ${a})`;
}

const gogogo = (img) => {
	simplex = new SimplexNoise(Math.random());

	cancelAnimationFrame(rafId);

	painters.splice(0, painters.length);
	ctxImage.drawImage(img, 0, 0);
	ctxDraw.drawImage(img, 0, 0);

	pixelData = ctxImage.getImageData(0, 0, width, height);

	const numBrushes = 2000;

	for (let i = 0; i < numBrushes; i++) {
		const r =  (Math.random() * ((img.width)));
		const a = Math.random() * TAU;
		const s = (Math.random() * 0.02);

		painters.push(new Painter(r, a, s));
	}

	loop();
};

const loop = () => {
	painters.forEach((p) => {
		const { x: x1, y: y1 } = p.position;

		p.update(phase);

		const { x: x2, y: y2 } = p.position;

		ctxDraw.beginPath();

		ctxDraw.strokeStyle = getColor({
			x: midX + p.positionClean.x,
			y: midY + p.positionClean.y,
		}, ctxImage);

		ctxDraw.lineWidth = p.width;

		ctxDraw.moveTo(midX + x1, midY + y1);
		ctxDraw.lineTo(midX + x2, midY + y2);

		ctxDraw.stroke();
		ctxDraw.closePath();
	});

	phase += 1;
	rafId = requestAnimationFrame(loop);
};

const img = document.createElement('img');

img.crossOrigin = 'Anonymous';
img.addEventListener('load', () => {
	gogogo(img);

	canvasDraw.addEventListener('mouseup', () => gogogo(img));
});

img.src = 'http://pimskie.dev/public/assets/mona-lisa-500.jpg';
