const randomArrayItem = (arr) => arr[Math.floor(Math.random() * arr.length)];
const randomInt = (min, max) =>
	Math.floor(Math.random() * (max - min + 1)) + min;

const getPixelIndex = (x, y, imageData) => (~~x + ~~y * imageData.width) * 4;

const getPixelData = (index, imageData) => {
	const r = imageData.data[index];
	const g = imageData.data[index + 1];
	const b = imageData.data[index + 2];
	const a = imageData.data[index + 3];
	const sum = r + g + b + a;

	return { r, g, b, a, sum };
};

const map = (value, inMin, inMax, outMin, outMax) => {
	return ((value - inMin) * (outMax - outMin)) / (inMax - inMin) + outMin;
};

const IMAGE_URL = "https://pimskie.dev/public/assets/noise.jpg";
const PI2 = Math.PI * 2;
const canvas = document.body.querySelector("canvas");
const ctx = canvas.getContext("2d");

const canvasWidth = 1500;
const canvasHeight = 600;

const midX = canvasWidth * 0.5;
const midY = canvasHeight * 0.5;

const imageWidth = 500;
const imageHeight = 316;

const noiseLayers = new Array(2).fill(0).map(() => new SimplexNoise());

const loadImage = async (url) => {
	return new Promise((resolve, reject) => {
		const img = new Image();

		img.crossOrigin = "anonymous";

		img.onload = () => {
			resolve(img);
		};

		img.onerror = () => {
			reject(new Error(`Failed to load image from ${url}`));
		};

		img.src = url;
	});
};

const imageToImageData = (img, canvasWidth, canvasHeight) => {
	const canvas = document.createElement("canvas");

	canvas.width = canvasWidth;
	canvas.height = canvasHeight;

	const canvasMidX = canvasWidth * 0.5;
	const canvasMidY = canvasHeight * 0.5;

	const imageHalfWidth = img.width * 0.5;
	const imageHalfHeight = img.height * 0.5;

	const ctx = canvas.getContext("2d");
	ctx.fillStyle = "white";
	ctx.fillRect(0, 0, canvasWidth, canvasHeight);

	ctx.drawImage(
		img,
		0,
		0,
		imageWidth,
		imageHeight,
		canvasMidX - imageHalfWidth,
		canvasMidY - imageHalfHeight,
		img.width,
		img.height
	);

	const imageData = ctx.getImageData(0, 0, canvasWidth, canvasHeight);

	return imageData;
};

canvas.width = canvasWidth;
canvas.height = canvasHeight;

let rafId = null;
let phase = 0;
let imageData = null;
let particles = [];

const addParticle = () => {
	const left = midX - imageWidth / 2;
	const top = midY - imageHeight / 2;

	const posX = randomInt(left, left + imageWidth);
	const posY = randomInt(top, top + imageHeight);

	const particle = {
		x: posX,
		y: posY,
		velocity: 1 + Math.random(),
		noise: randomArrayItem(noiseLayers),
		decay: 0.998,
		opacityChange: 0.005,
		life: 1,
		opacity: 0.5,
		angle: 0,
	};

	particles.push(particle);
};

const generate = () => {
	for (let i = 0; i < 3000; i++) {
		addParticle();
	}
};

const update = (particle, phase, bounds) => {
	const scale = 0.005;

	const noiseValue = particle.noise.noise3D(
		particle.x * scale,
		particle.y * scale,
		phase
	);

	const noiseValueMapped = map(noiseValue, -0.4, 0.4, 0, 1);

	particle.angle = noiseValueMapped * PI2;

	particle.x += Math.cos(particle.angle);
	particle.y += Math.sin(particle.angle);

	const pixelIndex = getPixelIndex(particle.x, particle.y, imageData);
	const pixelData = getPixelData(pixelIndex, imageData);
	const isDark = pixelData.sum < 300;

	if (isDark) {
		particle.opacity *= 1.1;
	} else {
		particle.opacity *= 0.996;
		particle.opacity = Math.min(particle.opacity, 0.1);
	}

	particle.life *= particle.decay;

	// reset out of bounds
	if (particle.x > bounds.width) {
		particle.x = 0;
	}

	if (particle.x < 0) {
		particle.x = bounds.width;
	}

	if (particle.y > bounds.height) {
		particle.y = 0;
	}

	if (particle.y < 0) {
		particle.y = bounds.height;
	}
};

const draw = (particle) => {
	const yPercent = particle.y / canvasHeight;
	const hue = 180 + 180 * yPercent;
	const thickness = 1;
	const opacity = particle.opacity * 50;

	ctx.beginPath();
	ctx.fillStyle = `hsla(${hue} 50% 50% / ${opacity}%)`;
	ctx.arc(particle.x, particle.y, thickness, 0, Math.PI * 2);
	ctx.fill();
	ctx.closePath();
};

const loop = () => {
	particles.forEach((particle) => {
		update(particle, phase, { width: canvasWidth, height: canvasHeight });
		draw(particle);
	});

	particles = particles.filter((particle) => particle.life > 0.1);

	addParticle();

	phase += 0.0005;

	rafId = requestAnimationFrame(loop);
};

const img = await loadImage(IMAGE_URL);

imageData = imageToImageData(img, canvasWidth, canvasHeight);

generate();

loop();

canvas.addEventListener("click", () => {
	ctx.clearRect(0, 0, canvasWidth, canvasHeight);

	generate();
});

canvas.addEventListener("mousemove", (event) => {
	const rect = canvas.getBoundingClientRect();
	const mouseX = event.clientX - rect.left;
	const mouseY = event.clientY - rect.top;

	const pixelIndex = getPixelIndex(mouseX, mouseY, imageData);
	const pixelData = getPixelData(pixelIndex, imageData);

	console.log(
		`Mouse at (${mouseX}, ${mouseY}): RGBA(${pixelData.r}, ${pixelData.g}, ${pixelData.b}, ${pixelData.a}) - Sum: ${pixelData.sum}`
	);
});

