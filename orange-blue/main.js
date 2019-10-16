// https://math.stackexchange.com/questions/51539/a-math-function-that-draws-water-droplet-shape
// https://www.wolframalpha.com/input/?i=quadrifolium
// teardrop curve
// https://unsplash.com/photos/DSwBHyWKiVw
// https://unsplash.com/photos/qEswHvOmi1c

// 1: soft-light
// 2: luminosity
// 4: soft-light

const simplex = new SimplexNoise(Math.random());
const clamp = (value, min, max) => Math.max(min, Math.min(value, max));

const ctx = document.querySelector('.js-canvas').getContext('2d');
const { canvas } = ctx;

const width = window.innerWidth;
const height = window.innerHeight;
const cx = width >> 1;
const cy = height >> 1;

canvas.width = width;
canvas.height = height;

const numPoints = 50;

let phase = 0;

const loadImage = (url) => {
	const image = new Image();

	return new Promise((resolve, reject) => {
		image.addEventListener('load', e => resolve(e.target));
		image.addEventListener('error', e => reject(new Error('error :(')));

		image.src = url;
	});
};

const calcAlpha = (min, max, scale) => {
	const scaleNorm = scale - min;
	const maxNorm = max - min;
	const dist = Math.hypot(scaleNorm - maxNorm);
	const percent = clamp(1 - (dist / maxNorm), 0, 1);

	return percent;
};


const generatePath = (numPoints, width, padding, height, phase) => {
	const noiseScale = 0.001;
	const pointSpacing = (width + (padding * 2)) / (numPoints + 1);

	const points = new Array(numPoints).fill().map((_, i) => {
		const x = -padding + (pointSpacing + (pointSpacing * i));
		const n = simplex.noise3D(x * noiseScale, cy * noiseScale, phase);
		const y = 20 * n;

		return { x, y };
	});

	points.unshift({ x: 0, y: 0, });
	points.push({ x: width, y: 0 });
	points.push({ x: width, y: height });
	points.push({ x: 0, y: height });

	return points;
};

const drawSky = (ctx, width, height) => {
	const fill = ctx.createLinearGradient(0, 0, 0, height);
	fill.addColorStop(0, '#e6a33d');
	fill.addColorStop(0.5, '#ca5a1e');

	ctx.fillStyle = fill;
	ctx.fillRect(0, 0, width, height);
}

const drawSun = (ctx, radius, x, y) => {
	const fill = ctx.createLinearGradient(x - radius, y - radius, x + radius, y + radius);
	fill.addColorStop(0, '#ecfa92');
	fill.addColorStop(0.8, '#f78613');

	ctx.fillStyle = fill;
	ctx.beginPath();
	ctx.arc(x, y, radius, 0, Math.PI * 2);
	ctx.fill();
	ctx.closePath();
}

const drawPath = (ctx, path) => {
	ctx.beginPath();

	path.forEach((point, i) => {
		const method = i === 0 ? 'moveTo' : 'lineTo';
		const { x, y } = point;

		ctx[method](x, y);
	});

	ctx.closePath();
};


const drawWaveShape = (ctx, y, path, alpha) => {
	const fill = ctx.createLinearGradient(0, 0, 0, y);
	fill.addColorStop(0, `rgba(245, 113, 13, ${alpha})`);
	fill.addColorStop(0.5, `rgba(47, 130, 170, 1)`);

	ctx.save();
	ctx.translate(0, y);
	ctx.fillStyle = fill;
	drawPath(ctx, path);
	ctx.fill();
	ctx.restore();
};

const drawWaveImage = (ctx, y, path, images) => {
	ctx.globalCompositeOperation = 'soft-light';

	const scaleStart = 1;
	const scaleEnd = 2;

	images.forEach((image, i) => {
		image.scale += 0.0002;

		const imageScale = image.scale;
		const imageWidth = width * imageScale;
		const imageHeight = height * imageScale;
		const imageOffsetLeft = -(imageWidth - width) * 0.5;

		const imageAlpha = calcAlpha(scaleStart, scaleEnd, imageScale);

		ctx.save();
		ctx.globalAlpha = imageAlpha;
		ctx.translate(0, y);
		drawPath(ctx, path);

		ctx.clip();
		ctx.drawImage(image.image, imageOffsetLeft, -y, imageWidth, imageHeight);
		ctx.restore();

		if (image.scale >= scaleEnd + scaleStart) {
			image.scale = scaleStart;
		}

	});

	ctx.globalCompositeOperation = 'source-over';
};

const drawSunReflection = (ctx, y, height, radius, path, phase) => {
	const noise = simplex.noise2D(phase, phase);
	const blur = 15 + (5 * noise);

	const fill = ctx.createLinearGradient(cx, 0, cx, y + height);
	fill.addColorStop(0, 'rgba(209, 110, 40, 0.5)');
	fill.addColorStop(0.75, 'rgba(209, 110, 40, 0)');

	ctx.save();
	ctx.translate(0, y);
	drawPath(ctx, path);

	ctx.clip();

	ctx.fillStyle = fill;
	ctx.filter = `blur(${blur}px)`;
	ctx.beginPath();
	ctx.moveTo(cx - radius, -100);
	ctx.lineTo(cx + radius, -100);
	ctx.lineTo(cx + (radius * 3), height);
	ctx.lineTo(cx - (radius * 3), height);
	ctx.closePath();
	ctx.fill();

	ctx.restore();
};


const clear = () => {
	ctx.clearRect(0, 0, canvas.width, canvas.height);
};

const loop = (images) => {
	clear();

	drawSky(ctx, width, height);
	drawSun(ctx, 150, cx, cy - 50);

	const padding = 50;
	const numWaves = 3;
	let wavesSpacing = 20;

	for (let i = 0; i < numWaves; i++) {
		const path = generatePath(numPoints, width, padding, cy, phase + (i * 0.5));

		drawWaveShape(ctx, cy + (i * wavesSpacing), path, 1 - (i / (numWaves + 2)));
		drawWaveImage(ctx, cy + (i * wavesSpacing), path, images, phase);

		wavesSpacing *= 1.5;
	}

	const path = generatePath(numPoints, width, padding, cy, phase);

	drawSunReflection(ctx, cy, cy, 100, path, phase);
	phase += 0.005;

	requestAnimationFrame(() => loop(images));
};

const setup = async () => {
	const image = await loadImage('https://pimskie.dev/public/assets/water-bump.png');
	const numImages = 5;

	const images = new Array(numImages).fill().map((_, i) => {
		const setting = {
			static: i === 0,
			image,
			scale: 1 + ((1 / numImages) * i),
		};

		return setting;
	});

	loop(images);
};

setup();
