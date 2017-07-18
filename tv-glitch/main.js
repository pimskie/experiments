const IMG_URL = 'https://dl.dropboxusercontent.com/u/4792988/r8svXnw.jpg';
const IMG_URL2 = 'https://dl.dropboxusercontent.com/u/4792988/wmIMqHT.jpg';

let c = document.querySelector('.js-screen');
let ctx = c.getContext('2d');

let rafId = null;
let tick = performance.now();
let frame = 0;
let lines = [];
let glitches = [];
let img;

noise.seed(Math.random());

const randomBetween = (min, max, round = true) => {
	let rand = (Math.random() * (max - min + 1)) + min;

	if (round) {
		return ~~rand;
	}

	return rand;
}

let angle = 0;
const distort = () => {
	// creating scanlines
	const rowHeight = 1;
	const spacing = 1;

	// create wobble
	const offset = 10 + (noise.perlin2(tick, tick) * 30);
	const numRows = Math.round(c.height / rowHeight);
	const step = (Math.PI * 2) / (numRows * 0.5);

	let x = 0;
	let y = 0;

	for (let i = 0; i < numRows; i++) {
		x = Math.cos(angle) * offset;

		ctx.drawImage(img, 0, y, img.width, rowHeight, x, y, img.width, rowHeight);

		y += rowHeight + spacing;
		angle += step;
	}

	angle += step;
}

const overbright = () => {
	const brightness = 1 + Math.abs(2 * (noise.perlin2(tick, tick * 2)));
	const imageData = ctx.getImageData(0, 0, c.width, c.height);
	const data = imageData.data;

	for(i = 0; i < data.length; i += 4) {
		data[i] *= brightness;
		data[i + 1] *= brightness;
		data[i + 2] *= brightness;
	}

	ctx.putImageData(imageData, 0, 0);
}

const drawLine = (line) => {
	let stroke = ctx.getImageData(0, line.y, c.width, line.height);
	ctx.putImageData(stroke, 0, line.y + line.height);

	line.y += line.speed;

	if (line.y > img.height) {
		line.y = 0;
	}
}

const drawColorStrokes = (glitch, index) => {
	let { r, g, b, a, y, height } = glitch;

	let indexModifier = index * 0.05;
	let indexModifier2 = index * 2;
	let noiseValue = noise.perlin2(tick + indexModifier, tick + indexModifier);
	let noiseValue2 = noise.perlin2(tick + indexModifier2, tick + indexModifier2);

	let stroke = ctx.getImageData(0, y, c.width, height);
	let data = stroke.data;

	for (let i = 0; i < data.length; i += 4) {
		data[i] *= r;
		data[i + 1] *= g;
	}

	ctx.putImageData(stroke, 0, y + 10);

	glitch.y += noiseValue2 * 4;
}

const shiftHorizontally = (y, height, toLeft) => {
	let width = 10;
	let strokePiece;
	let restPiece;

	if (toLeft) {
		strokePiece = ctx.getImageData(0, y, width, height);
		restPiece = ctx.getImageData(width, y, img.width - width, height);

		ctx.putImageData(strokePiece, img.width - width, y);
		ctx.putImageData(restPiece, 0, y);
	} else {
		strokePiece = ctx.getImageData(img.width - width, y, width, height);
		restPiece = ctx.getImageData(0, y, img.width - width, height);

		ctx.putImageData(strokePiece, 0, y);
		ctx.putImageData(restPiece, width, y);
	}
}

const shiftVertically = () => {
	const displacement = noise.perlin2(0, tick * 0.5);
	const height = img.height * 0.75 * displacement;

	let topPiece;
	let bottomPiece;

	if (height >= 0) {
		topPiece = ctx.getImageData(0, 0, img.width, img.height - height);
		bottomPiece = ctx.getImageData(0, img.height - height, img.width, img.height);

		ctx.putImageData(bottomPiece, 0, 0);
		ctx.putImageData(topPiece, 0, height);
	}
	else {
		let absHeight = Math.abs(height);

		topPiece = ctx.getImageData(0, 0, img.width, absHeight);
		bottomPiece = ctx.getImageData(0, absHeight, img.width, img.height - absHeight);

		ctx.putImageData(topPiece, 0, img.height - absHeight);
		ctx.putImageData(bottomPiece, 0, 0);
	}
}

const loop = () => {
	ctx.clearRect(0, 0, c.width, c.height);

	distort();
	overbright();

	glitches.forEach(drawColorStrokes);
	lines.forEach(drawLine);

	if (frame % 100 < 50) {
		for (let i = 0; i < 3; i++) {
			let y = Math.abs(noise.perlin2(tick + i, tick + i)) * img.height;
			let height = 40;

			shiftHorizontally(y, height, i % 2 === 0);
		}
	}

	shiftVertically();

	frame++;
	tick += 0.005;

	rafId = requestAnimationFrame(loop);
}

const imageLoaded = (e) => {
	c.classList.add('is-on');

	lines = [];
	glitches = [];

	for (let i = 0; i < 3; i++) {
		let line = {
			y: randomBetween(0, img.height),
			speed: randomBetween(0.5, 1, false),
			height: randomBetween(1, 20)
		};

		lines.push(line);
	}

	for (let i = 0; i < 2; i++) {
		let r = Math.random() * 2 - 1;
		let g = Math.random() * 2 - 1;
		let b = Math.random() * 2 - 1;
		let a = Math.random() * 2 - 1;
		let y = Math.random() * img.height;
		let height = 30 + (Math.random() * 80);

		glitches.push({ r, g, b, a, y, height });
	}

	cancelAnimationFrame(rafId);

	loop();
}


const switchSource = () => {
	const newSource = img && img.src === IMG_URL ? IMG_URL2 : IMG_URL;

	let newImg = document.createElement('img');
	newImg.crossOrigin = 'anonymous';

	newImg.addEventListener('load', (e) => {
		img = newImg;

		imageLoaded(e);
	});

	newImg.src = newSource;
}

document.querySelector('.js-btn-switch').addEventListener('click', switchSource);
switchSource();