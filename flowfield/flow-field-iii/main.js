/* global noise: false, dat: false, */

// https://www.bit-101.com/blog/2017/10/28/flow-fields-part-ii/

noise.seed(Math.random());

const q = (sel) => document.querySelector(sel);
const PI2 = Math.PI * 2;

const canvas = q('canvas');
const ctx = canvas.getContext('2d');

let width = window.innerWidth;
let height = window.innerHeight;

canvas.width = width;
canvas.height = height;

const numParticles = 2000;
let particles = [];
let phase = Math.random() * Math.PI;

class Bitmap {
	constructor() {
		this.imageData = null;

		this.img = new Image();
		this.img.crossOrigin = 'Anonymous';
		this.img.addEventListener('load', (e) => this.onImageLoaded(e));

		const canvas = document.createElement('canvas');
		this.ctx = canvas.getContext('2d');

		canvas.classList.add('canvas-reference');

		document.body.appendChild(canvas);
	}

	get width() {
		return this.ctx.canvas.width;
	}

	get height() {
		return this.ctx.canvas.height;
	}

	load(imageUrl) {
		this.img.src = imageUrl;
	}

	onLoad() {
	//
	}

	onImageLoaded(e) {
		const { target: image, target: { width, height } } = e;

		this.ctx.canvas.width = width;
		this.ctx.canvas.height = height;

		this.ctx.drawImage(image, 0, 0);

		this.imageData = this.ctx.getImageData(0, 0, width, height);

		this.onLoad();
	}

	getRgb(x, y) {
		const index = this.getPixelIndex(x, y);
		const { data } = this.imageData;

		return [
	  data[index],
	  data[index + 1],
	  data[index + 2],
		];
	}

	getPixelIndex(x, y) {
		return (~~x + ~~y * this.imageData.width) * 4;
	}

	toggle(show) {
		this.ctx.canvas.classList.toggle('is-on', show);
	}
}

class Particle {
	constructor(x, y) {
		this.x = x;
		this.y = y;

		this.vx = 0;
		this.vy = 0;
	}

	update(noiseValue, length = 1) {
		this.vx += Math.cos(noiseValue) * length;
		this.vy += Math.sin(noiseValue) * length;

		this.x += this.vx;
		this.y += this.vy;

		this.vx *= 0.1;
		this.vy *= 0.1;
	}

	checkBounds(width, height) {
		if (this.x <= 0) {
	  this.x = width;
		} else if (this.x >= width) {
	  this.x = 0;
		}

		if (this.y <= 0) {
	  this.y = height;
		} else if (this.y >= height) {
	  this.y = 0;
		}
	}
}


const getForceColor = (rgb, inverse = true) => {
	const sum = rgb.reduce((acc, val) => acc + val);
	const avg = sum / 3;
	const val = avg / 255;

	if (inverse) {
		return 1 - val;
	}

	return val;
};

const getForceNoise = (x, y, phase) => {
	const scale = 0.01;

	return noise.perlin3(x * scale, y * scale, phase);
};


const reset = () => {
	particles = [];

	width = bitmap.width;
	height = bitmap.height;

	canvas.width = width;
	canvas.height = height;

	for (let i = 0; i < numParticles; i++) {
		const x = Math.random() * width;
		const y = Math.random() * height;

		particles.push(new Particle(x, y));
	}
};

const clear = () => {
	ctx.fillStyle = `hsla(0, 0%, 100%, 0.002)`;
	ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
};

const run = () => {
	clear();

	particles.forEach((p) => {
		const rgb = bitmap.getRgb(p.x, p.y);
		rgb.push(0.3);

		const forceColor = getForceColor(rgb, settings.inverse) * (1 - settings.perlin);
		const forceNoise = getForceNoise(p.x, p.y, phase) * settings.perlin;

		const force = (forceColor + forceNoise) * PI2;

		ctx.beginPath();
		ctx.lineWidth = settings.lineWidth;
		ctx.strokeStyle = settings.color ? `rgba(${rgb.join(', ')})` : 'black';

		ctx.moveTo(p.x, p.y);

		p.update(force, settings.lineLength);

		ctx.lineTo(p.x, p.y);

		ctx.stroke();
		ctx.closePath();

		p.checkBounds(ctx.canvas.width, ctx.canvas.height);

	});

	phase += 0.01;

	requestAnimationFrame(run);
};

const imageMap = {
	iceland: 'https://res.cloudinary.com/da7lts5bq/image/upload/c_scale,q_73,w_800/v1513845611/iceland_j75nck.jpg',
	einstein: 'https://res.cloudinary.com/da7lts5bq/image/upload/q_69/v1513845611/einstein_nqlmdl.jpg',
	tiger: 'https://res.cloudinary.com/da7lts5bq/image/upload/v1513845611/tiger_edplr6.jpg',
};

const settings = {
	color: false,
	inverse: true,
	lineLength: 3,
	lineWidth: 0.1,
	perlin: 0.1,
	image: 'einstein',
	reset,
};

const loadImage = () => {
	bitmap.load(imageMap[settings.image]);
};

const bitmap = new Bitmap();
bitmap.onLoad = reset;

loadImage();
run();

canvas.addEventListener('mousedown', () => bitmap.toggle(true));
canvas.addEventListener('mouseup', () => bitmap.toggle(false));

const gui = new dat.GUI({ autoPlace: false });
gui.add(settings, 'color').onChange(reset);
gui.add(settings, 'inverse').onChange(reset);
gui.add(settings, 'perlin', 0, 1).step(0.01).onChange(reset);
gui.add(settings, 'lineLength', 0.1, 20).step(0.1).onChange(reset);
gui.add(settings, 'lineWidth', 0.1, 5).step(0.01).onChange(reset);
gui.add(settings, 'image', [ 'einstein', 'iceland', 'tiger' ]).onChange(() => {
	loadImage();
});
gui.add(settings, 'reset');

q('.js-ui').appendChild(gui.domElement);
