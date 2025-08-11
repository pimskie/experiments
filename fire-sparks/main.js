const randomArrayValue = (arr) => arr[Math.floor(Math.random() * arr.length)];

const w = window.innerWidth;
const h = window.innerHeight;

const canvas = document.querySelector("canvas");
canvas.width = w;
canvas.height = h;

const ctx = canvas.getContext("2d");

const noiseLayers = new Array(50).fill(0).map((_, i) => {
	const simplex = new SimplexNoise();
	return simplex;
});

let phase = 0;

const sparks = new Array(50).fill(0).map((_, i) => ({
	x: -100 * Math.random(),
	y: Math.random() * h,
	size: 3,
	life: 1,
	speed: 5 + 5 * Math.random(),
	decay: 0.99 + 0.01 * Math.random(),
	noiseLayer: randomArrayValue(noiseLayers),
}));

const clean = () => {
	ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
};

const update = (spark, phase) => {
	const scale = 0.0001;
	const noiseLayer = spark.noiseLayer;
	const noise = noiseLayer.noise3D(spark.x * scale, spark.y * scale, phase, 0);
	const angleY = noise * Math.PI;

	spark.life *= spark.decay;

	spark.x += spark.speed * spark.life;
	spark.y += Math.sin(angleY) * (spark.speed * spark.life);
	spark.speed *= spark.decay;

	if (spark.y > h) {
		spark.y = 0;
	}

	if (spark.y < 0) {
		spark.y = h;
	}
};

const draw = ({ x, y, size, life }) => {
	ctx.save();

	ctx.translate(x, y);
	ctx.fillStyle = "white";
	ctx.beginPath();
	ctx.arc(0, 0, size * life, 0, Math.PI * 2);
	ctx.fill();
	ctx.closePath();
	ctx.restore();
};

const tick = () => {
	phase += 0.001;
	sparks.forEach((spark) => {
		update(spark, phase);
		draw(spark);
	});
};

const loop = () => {
	clean();
	tick();
	requestAnimationFrame(loop);
};

loop();

