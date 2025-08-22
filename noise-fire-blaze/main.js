const randomInt = (min, max) =>
	Math.floor(Math.random() * (max - min + 1)) + min;

const randomArrayItem = (arr) => arr[Math.floor(Math.random() * arr.length)];

const canvas = document.body.querySelector("canvas");
const ctx = canvas.getContext("2d");

const PI2 = Math.PI * 2;
const w = 600;
const h = 300;

const midX = w * 0.5;
const midY = h * 0.5;
const distanceMax = 150;

const numLayers = 3;
const numSparks = 120;

const noiseLayers = new Array(numLayers).fill(0).map(() => new SimplexNoise());

const getRandomSpark = () => {
	const depth = randomInt(0, numLayers - 1);
	const noise = randomArrayItem(noiseLayers);

	const depthPercentage = depth / (numLayers - 1);
	const velocity = 2 + Math.random() + depth;
	const size = 1 + 3 * depthPercentage;

	return {
		x: -100 + Math.random() * 100,
		y: Math.random() * h,
		life: 1,
		decay: 0.989 + Math.random() * 0.001,
		depth,
		noise,
		velocity,
		size,
		angle: 0,
	};
};

let sparks = new Array(numSparks)
	.fill(0)
	.map(getRandomSpark)
	.sort((a, b) => a.depth - b.depth);

canvas.width = w;
canvas.height = h;

let rafId = null;
let phase = 0;

const updateSpark = (spark, phase) => {
	const noiseScale = 0.001;

	const noiseValue = spark.noise.noise3D(
		spark.x * noiseScale,
		spark.y * noiseScale,
		phase
	);

	const angle = noiseValue * Math.PI;
	const amplitude = Math.sin(angle) * (spark.velocity * 0.4 * spark.life);

	spark.x += spark.velocity;
	spark.y += amplitude;

	spark.life *= spark.decay;
	spark.velocity *= spark.decay;
	spark.angle = angle;
};

const drawSpark = (spark, tick) => {
	ctx.beginPath();
	ctx.lineWidth = spark.size * spark.life;

	ctx.fillStyle = `rgba(255, ${255 * spark.life}, 0, ${spark.life})`;
	ctx.strokeStyle = `rgba(255, ${255 * spark.life}, 0, ${spark.life})`;

	ctx.moveTo(spark.x, spark.y);
	ctx.lineTo(
		spark.x + Math.cos(spark.angle) * 2,
		spark.y + Math.sin(spark.angle) * 2
	);
	ctx.fill();
	ctx.stroke();
	ctx.closePath();
};

const loop = () => {
	ctx.clearRect(0, 0, w, h);

	sparks.forEach((spark) => {
		updateSpark(spark, phase);
		drawSpark(spark, phase);
	});

	sparks = sparks.filter((spark) => spark.life > 0.2 && spark.x < w);

	for (let i = 0; i < 3; i++) {
		sparks.push(getRandomSpark());
	}

	phase += 0.001;

	rafId = requestAnimationFrame(loop);
};

canvas.addEventListener("click", () => {
	if (rafId) {
		cancelAnimationFrame(rafId);
		rafId = null;
	} else {
		loop();
	}
});

loop();

