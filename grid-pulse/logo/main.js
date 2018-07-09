const simplex = new SimplexNoise();

const IMG_PATH = './af-logo-black-small.png';

const q = (sel) => document.querySelector(sel);

const canvasTrail = q('.js-canvas-trail');
const canvasImage = q('.js-canvas-image');

const ctxTrail = canvasTrail.getContext('2d');
const ctxImage = canvasImage.getContext('2d');

const PI2 = Math.PI * 2;
const FF = PI2 / 8;
const img = new Image();
img.crossOrigin = 'Anonymous';

let imageData;

let width;
let height;
let widthHalf;
let heightHalf;

let rafId;
let phase = 0;
let trails = [];
const trailWidth = 1;

const getPixelIndex = (x, y, imageData) => (~~x + ~~y * imageData.width) * 4;

const getRGBA = (x, y, imageData) => {
	const index = getPixelIndex(x, y, imageData);

	return [
		imageData.data[index],
		imageData.data[index + 1],
		imageData.data[index + 2],
		imageData.data[index + 3],
	];
}

const getAngle = () => {
	const angle = (PI2 * Math.random());

	return angleFF = angle - (angle % FF);
};

const getImageData = (ctx, image) => {
	const { width: imageWidth, height: imageHeight } = image;
	const { canvas: { width: canvasWidth, height: canvasHeight } } = ctx;
	const canvasMidX = canvasWidth / 2;
	const canvasMidY = canvasHeight / 2;
	const imageMidX = imageWidth / 2;
	const imageMidY = imageHeight / 2;

	ctx.drawImage(image, canvasMidX - imageMidX, canvasMidY - imageMidY);

	return ctx.getImageData(0, 0, canvasWidth, canvasHeight);
};

class Trail {
	constructor({ canvasWidth, canvasHeight, x, y, angle, angleInc } = {}) {
		this.canvasWidth = canvasWidth;
		this.canvasHeight = canvasHeight;

		this.defaultX = x;
		this.defaultY = y;

		this.angle = angle;
		this.angleInc = angleInc;

		this.widthStart = 1.5;

		this.reset();
	}

	get isDead() {
		return (
			this.x < 0 ||
			this.x > this.canvasWidth ||
			this.y < 0 ||
			this.y > this.canvasHeight ||
			this.opacity < 0.05 ||
			this.width < 0.2
		);
	}

	reset() {
		this.x = this.defaultX;
		this.y = this.defaultY;

		this.width = this.widthStart;
		this.opacity = 0.99;
	}

	update(isInside) {
		const { x, y } = this;
		const increaseAngle = Math.random() > 0.5;

		let changeAngle = Math.random() > 0.95;
		let lightness = 50;
		let opacity = 1;
		let saturation = 100;
		this.velocity = 1;
		this.width = 10;

		if (!isInside) {
			this.opacity *= 0.96;
			this.width = 2;
			this.velocity = 3;
			opacity = this.opacity;
			lightness = 50;
			saturation = 30;
		}

		if (changeAngle && increaseAngle) {
			this.angle += this.angleInc;
		} else if (changeAngle) {
			this.angle -= this.angleInc;
		}

		const scale = isInside ? 0.0005 : 0.0006;
		const n = simplex.noise3D(x * scale, y * scale, phase);
		const hue = -250 + (120 * n);

		this.color = `hsla(${hue}, ${saturation}%, ${lightness}%, ${opacity})`;
	}

	render(ctx, phase, lightness = 50) {
		let { x, y, velocity, angle } = this;

		ctx.beginPath();
		ctx.lineWidth = this.width;
		ctx.lineCap = 'butt';
		ctx.strokeStyle = this.color;

		ctx.moveTo(this.x, this.y);

		this.x += Math.cos(angle) * velocity;
		this.y += Math.sin(angle) * velocity;

		ctx.lineTo(this.x, this.y);
		ctx.stroke();
		ctx.closePath();
	}
}

const create = () => {
	const left = widthHalf - (img.width * 0.5);
	let num = 1000;

	while (num--) {
		const settings = {
			canvasWidth: width,
			canvasHeight: height,
			x: left + (img.width * Math.random()),
			y: height >> 1,
			angle: getAngle(),
			angleInc: FF,
		};

		trails.push(new Trail(settings));
	}
};

const reset = () => {
	cancelAnimationFrame(rafId);

	width = window.innerWidth;
	height = window.innerHeight;
	widthHalf = width * 0.5;
	heightHalf = height * 0.5;

	canvasTrail.width = canvasImage.width = width;
	canvasTrail.height = canvasImage.height = height;

	trails = [];

	img.src = IMG_PATH;
};

const clear = () => {
	ctxTrail.fillStyle = 'rgba(0, 0, 0, 0.05)';
	ctxTrail.fillRect(0, 0, ctxTrail.canvas.width, ctxTrail.canvas.height);
};

const loop = () => {
	clear();

	const left = widthHalf - (img.width * 0.5);

	trails.forEach((trail) => {
		const { x, y } = trail;
		const rgba = getRGBA(x, y, imageData);
		const [, , , alpha] = rgba;

		const isInside = alpha > 200;

		trail.update(isInside);
		trail.render(ctxTrail);

		if (trail.isDead) {
			trail.reset();
		}
	});

	phase += 0.005;

	rafId = requestAnimationFrame(loop);
};

img.addEventListener('load', (e) => {
	imageData = getImageData(ctxImage, img);

	create();
	loop();

	canvasTrail.addEventListener('click', reset);
	window.addEventListener('resize', reset);

});

reset();
