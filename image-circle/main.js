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
const painters = [];

let phase = 0;
let rafId;

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
	}

	get position() {
		const x = Math.cos(this.angle) * this.radius;
		const y = Math.sin(this.angle) * this.radius;

		return { x, y };
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

	update(frame) {
		const noiseValue = this.getNoiseValue(frame);

		this.angle += this.speed;
		this.radius = this.radiusBase + (20 * noiseValue);
		this.width = 5 + (1 * noiseValue);
	}
}


const getColor = (position, ctx) => {
	const pixel = ctx.getImageData(position.x, position.y, 1, 1).data;
	const [r, g, b] = pixel;
	const a = (r + g + b) <= 50 ? 0 : 1;

	return `rgba(${r}, ${g}, ${b}, ${a})`;
}

const gogogo = (img) => {
	simplex = new SimplexNoise(Math.random());

	cancelAnimationFrame(rafId);

	painters.splice(0, painters.length);
	ctxDraw.clearRect(0, 0, canvasDraw.width, canvasDraw.height);
	ctxImage.drawImage(img, 0, 0);

	for (let i = 0; i < 1500; i++) {
		const r =  (Math.random() * ((img.width)));
		const a = Math.random() * TAU;
		const s = -0.01 + (Math.random() * 0.02);

		painters.push(new Painter(r, a, s));
	}

	loop();
};

const loop = () => {
	const midX = canvasDraw.width >> 1;
	const midY = canvasDraw.height >> 1;

	painters.forEach((p) => {
		ctxDraw.beginPath();

		ctxDraw.strokeStyle = getColor({
			x: midX + p.positionClean.x,
			y: midY + p.positionClean.y,
		}, ctxImage);

		ctxDraw.lineWidth = p.width;

		ctxDraw.moveTo(midX + p.position.x, midY + p.position.y);

		p.update(phase);

		ctxDraw.lineTo(midX + p.position.x, midY + p.position.y);

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
