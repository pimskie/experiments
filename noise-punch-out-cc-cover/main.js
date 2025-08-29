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

// const IMAGE_URL = "https://pimskie.dev/public/assets/creative-coding.jpg";
const IMAGE_URL = "./creative-coding.jpg";
const PI2 = Math.PI * 2;
const canvas = document.body.querySelector("canvas");
const ctx = canvas.getContext("2d");

const canvasWidth = window.innerWidth;
const canvasHeight = window.innerHeight;

const midX = canvasWidth * 0.5;
const midY = canvasHeight * 0.5;

const imageWidth = 700;
const imageHeight = 400;

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

const imageToImageData = (img) => {
	// Create a small canvas just for the image data extraction
	const imageCanvas = document.createElement("canvas");
	imageCanvas.width = imageWidth;
	imageCanvas.height = imageHeight;

	const imageCtx = imageCanvas.getContext("2d");
	imageCtx.fillStyle = "white";
	imageCtx.fillRect(0, 0, imageWidth, imageHeight);

	// Draw the image at its natural size on the small canvas
	imageCtx.drawImage(img, 0, 0, imageWidth, imageHeight);

	const imageData = imageCtx.getImageData(0, 0, imageWidth, imageHeight);

	return imageData;
};

canvas.width = canvasWidth;
canvas.height = canvasHeight;

let rafId = null;
let phase = 0;
let imageData = null;
let particles = [];

const getParticle = () => {
	const left = midX - imageWidth / 2;
	const top = midY - imageHeight / 2;

	const posX = randomInt(left, left + imageWidth);
	const posY = randomInt(top, top + imageHeight);

	const particle = {
		x: posX,
		y: posY,
		velocity: 1 + Math.random() * 0.5,
		noise: randomArrayItem(noiseLayers),
		decay: 0.998,
		opacityChange: 0.005,
		life: 1,
		opacity: 0.5,
		angle: 0,
		strokeWidth: 1,
	};

	return particle;
};

const addParticle = () => {
	particles.push(getParticle());
};

const generate = () => {
	for (let i = 0; i < 5000; i++) {
		addParticle();
	}
};

const update = (particle, phase, bounds) => {
	const scale = 0.004;

	const noiseValue = particle.noise.noise3D(
		particle.x * scale,
		particle.y * scale,
		phase
	);

	particle.angle = noiseValue * PI2;

	particle.x += Math.cos(particle.angle) * particle.velocity;
	particle.y += Math.sin(particle.angle) * particle.velocity;

	const imageX = particle.x - (midX - imageWidth / 2);
	const imageY = particle.y - (midY - imageHeight / 2);

	const clampedX = Math.max(0, Math.min(imageWidth - 1, imageX));
	const clampedY = Math.max(0, Math.min(imageHeight - 1, imageY));

	const pixelIndex = getPixelIndex(clampedX, clampedY, imageData);
	const pixelData = getPixelData(pixelIndex, imageData);
	const isDark = pixelData.sum < 300;

	if (isDark) {
		particle.opacity *= 2;
		particle.opacity = Math.min(particle.opacity, 1);
	} else {
		particle.opacity *= 0.995;
		particle.opacity = Math.min(particle.opacity, 0.1);
	}

	particle.life *= particle.decay;

	if (
		particle.x > bounds.width ||
		particle.x < 0 ||
		particle.y > bounds.height ||
		particle.y < 0
	) {
		// Mark particle for removal and create a new one at a random position
		particle.life = 0;
		particle.opacity = 0;
	}
};

const draw = (particle) => {
	const yPercent = particle.y / canvasHeight;
	const hue = 200 + 100 * yPercent;
	const thickness = particle.strokeWidth;
	const opacity = particle.opacity * 10;

	ctx.beginPath();
	ctx.fillStyle = `hsla(${hue} 50% 10% / ${opacity}%)`;
	ctx.arc(particle.x, particle.y, thickness, 0, Math.PI * 2);
	ctx.fill();
	ctx.closePath();
};

const loop = () => {
	particles.forEach((particle) => {
		update(particle, phase, { width: canvasWidth, height: canvasHeight });
		draw(particle);
	});

	const removedCount = particles.length;
	particles = particles.filter((particle) => particle.life > 0.1);

	const removedParticles = removedCount - particles.length;

	for (let i = 0; i < removedParticles; i++) {
		addParticle();
	}

	phase += 0.0009;

	rafId = requestAnimationFrame(loop);
};

const img = await loadImage(IMAGE_URL);

imageData = imageToImageData(img);

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

	// Convert mouse position to image coordinates
	const imageX = mouseX - (midX - imageWidth / 2);
	const imageY = mouseY - (midY - imageHeight / 2);

	// Clamp coordinates to image bounds
	const clampedX = Math.max(0, Math.min(imageWidth - 1, imageX));
	const clampedY = Math.max(0, Math.min(imageHeight - 1, imageY));

	const pixelIndex = getPixelIndex(clampedX, clampedY, imageData);
	const pixelData = getPixelData(pixelIndex, imageData);

	console.log(
		`Mouse at (${mouseX}, ${mouseY}): RGBA(${pixelData.r}, ${pixelData.g}, ${pixelData.b}, ${pixelData.a}) - Sum: ${pixelData.sum}`
	);
});

