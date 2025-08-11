const randomArrayValue = (arr) => arr[Math.floor(Math.random() * arr.length)];

const w = window.innerWidth;
const h = window.innerHeight;

const numLayers = 4;
const title = document.querySelector(".title");
const ctxs = new Array(numLayers).fill(0).map((_, i) => {
	const canvas = document.createElement("canvas");

	canvas.width = w;
	canvas.height = h;
	canvas.style.setProperty("--layer", i * 10);

	document.body.appendChild(canvas);

	return canvas.getContext("2d");
});

const noiseLayers = new Array(ctxs.length)
	.fill(0)
	.map((_, i) => new SimplexNoise());

let phase;
let sparks;

const reset = () => {
	title.classList.remove("go");

	// he is dirty, Paaatriiccck
	setTimeout(() => {
		title.classList.add("go");
	}, 100);

	phase = 0;

	sparks = new Array(100).fill(0).map((_, i) => {
		const ctx = randomArrayValue(ctxs);
		const depth = ctxs.indexOf(ctx) * 0.5;

		return {
			x: -300 * Math.random(),
			y: Math.random() * h,
			size: 2 + Math.random() + depth,
			life: 1,
			speed: 5 + 5 * Math.random() + depth,
			decay: 0.989 + 0.01 * Math.random(),
			noiseLayer: randomArrayValue(noiseLayers),
			ctx,
		};
	});
};

const clean = () => {
	ctxs.forEach((ctx) => {
		ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
		ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
	});
};

const update = (spark, phase) => {
	const scale = 0.001;
	const noiseLayer = spark.noiseLayer;
	const noise = noiseLayer.noise3D(spark.x * scale, spark.y * scale, phase, 0);
	const angleY = noise * Math.PI;

	spark.life *= spark.decay;

	spark.x += spark.speed * spark.life;
	spark.y += Math.sin(angleY) * (spark.speed * spark.life * spark.life * 0.5);
	spark.speed *= spark.decay;
};

const draw = ({ ctx, x, y, size, life }) => {
	ctx.save();
	ctx.translate(x, y);

	const r = 255;
	const g = 255 * life;
	const b = 0;

	// shadow
	ctx.fillStyle = `rgba(0, 0, 0, 1)`;
	ctx.beginPath();
	ctx.arc(2, 2, size * life, 0, Math.PI * 2);
	ctx.fill();
	ctx.closePath();

	// spark
	ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${life})`;
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

reset();
loop();

document.body.addEventListener("click", reset);

