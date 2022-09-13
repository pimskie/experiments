const ctx = document.querySelector(".js-canvas").getContext("2d");
const { canvas } = ctx;

noise.seed(Math.random());

const TAU = Math.PI * 2;
const W = 500;
const H = 500;

const MX = W >> 1;
const MY = H >> 1;

const detail = 200;
const angleStep = TAU / detail;
const radius = MX * 0.7;

let tick = 1;

canvas.width = W;
canvas.height = H;

const clear = () => {
	ctx.fillStyle = "rgba(255, 255, 255, 0.01)";
	ctx.fillRect(0, 0, W, H);
};

const draw = () => {
	ctx.save();

	const fill = ctx.createRadialGradient(MX, MY, 10, MX, MY, radius);

	fill.addColorStop(0, "rgba(200, 50, 50, 0.2)");
	fill.addColorStop(1, "rgba(160, 0, 0, 0.2)");

	ctx.beginPath();
	ctx.fillStyle = fill;

	for (let i = 0; i < detail; i++) {
		const angle = angleStep * i;
		const x = Math.cos(angle) * radius;
		const y = Math.sin(angle) * radius;
		const scale = 0.005;

		const noiseValue = noise.simplex3(x * scale, y * scale, tick * scale);

		const newRadius = radius + 50 * noiseValue;

		const newX = Math.cos(angle) * newRadius;
		const newY = Math.sin(angle) * newRadius;

		ctx.lineTo(MX + newX, MY + newY);
	}

	ctx.closePath();
	ctx.fill();
	ctx.restore();
};

const loop = () => {
	clear();

	draw();

	tick++;

	requestAnimationFrame(loop);
};

loop();
