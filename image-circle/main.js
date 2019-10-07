const lerp = (norm, min, max) => (max - min) * norm + min;
const map = (value, start1, stop1, start2, stop2) => ((value - start1) / (stop1 - start1)) * (stop2 - start2) + start2;
const angleBetween = (vec1, vec2) => Math.atan2(vec2.y - vec1.y, vec2.x - vec1.x);

const width = 500;
const height = 500;
const cx = width * 0.5;
const cy = height * 0.5;

const ctx = document.querySelector('.js-canvas').getContext('2d');
const { canvas } = ctx;

canvas.width = width;
canvas.height = height;

const settings = {
	count: 100,
	scaleNormal: 0,
	scaleFactor: 200,
	radiusScaleFactor: 0.1,
	scaleMax: 7,
	rotateNormal: -1,
	rotateMax: 2,
	rotateAlternate: false,
	pointerAngle: 0,
};

const loadImage = (url) => {
	const image = new Image();

	return new Promise((resolve, reject) => {
		image.addEventListener('load', e => resolve(e.target));
		image.addEventListener('error', e => reject(new Error('error :(')));

		image.src = url;
	});
};

const drawImage = (img, { radius = cx, scale = 1, rotation = 0, angle = 0 }) => {
	const focusX = 0.5;
	const focusY = 0.5;

	const offsetX = (width * scale - width) * focusX;
	const offsetY = (width * scale - width) * focusY;

	ctx.save();
	ctx.beginPath();
	ctx.arc(cx, cy, radius, 0, Math.PI * 2);
	ctx.closePath();

	ctx.clip();

	ctx.translate(cx, cy);
	ctx.rotate(rotation);
	ctx.drawImage(img, -offsetX - cx, -offsetY - cy, width * scale, height * scale);
	ctx.restore();
};

const setupControls = (canvas, settings) => {
	const gui = new dat.GUI();
	gui.add(settings, 'count').min(2).max(200);
	gui.add(settings, 'rotateAlternate');
	gui.add(settings, 'scaleFactor').min(1).max(100).step(1);

	canvas.addEventListener('pointermove', (e) => {
		const { width, height, offsetLeft, offsetTop } = canvas;
		const x = e.clientX - offsetLeft;
		const y = e.clientY - offsetTop;
		const angle = angleBetween({ x: cx, y: cy }, { x, y });

		settings.scaleNormal = y / height;
		settings.rotateNormal = x / width;
		settings.pointerAngle = angle;
	});
};

const setup = async () => {
	const image = await loadImage('img.jpg');

	setupControls(ctx.canvas, settings)

	run(image, settings, 0);
};

const run = (image, settings, phase) => {
	ctx.clearRect(0, 0, width, height);

	const { count, scaleMax, radiusScaleFactor, scaleNormal, rotateNormal, rotateMax, rotateAlternate } = settings;

	const radiusEnd = cx * radiusScaleFactor;
	const radiusStep = (cx - radiusEnd) / count;
	const scaleStep = (scaleMax - 1) / count;

	const rotateFactor = map(rotateNormal, 0, 1, -rotateMax, rotateMax);
	const scaleFactor = lerp(scaleNormal, 0.001, 0.4)

	for (let i = 0; i < count; i++) {
		const isEven = i % 2 == 0;
		const rotateInverse = isEven && rotateAlternate ? -1 : 1;
		const rotation = (rotateFactor / count) * i * rotateInverse;

		const scale = 1 + ((i + 1) * scaleStep * scaleNormal);
		// const scale = 1 + (Math.pow(scaleStep, i * scaleFactor));
		const options = {
			scale,
			rotation,
			radius: cx - (radiusStep * i),
			angle: settings.pointerAngle,
		};

		drawImage(image, options);
	}

	phase += 0.01;

	requestAnimationFrame(() => run(image, settings, phase));
};

setup();
