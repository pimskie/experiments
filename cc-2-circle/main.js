const TAU = Math.PI * 2;
const W = 500;
const H = W;
const R = W * 0.4;

let frame = 0;

noise.seed(Math.random());

const ctx = document.querySelector('.js-lines').getContext('2d');

const mousePosition = {
	x: 0,
	y: 0,
};

const clear = () =>ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
const getNoiseValue = ({ x, y, z = 1 }, scale = 0.009) => noise.perlin3(x * scale, y * scale, z);

const setupCanvas = (width, height) => {
	ctx.canvas.width = width;
	ctx.canvas.height = height;
};


const drawCircle = (scale = 1) => {
	const detail = 100;
	const step = TAU / detail;
	const scaleInverse = 1 - scale;

	ctx.save();
	ctx.translate((W * 0.5) + (mousePosition.x * scaleInverse) * 0.5, H * 0.5 + (mousePosition.y * scaleInverse) * 0.5);
	ctx.beginPath();
	ctx.strokeStyle = `rgba(0, 0, 0, ${scaleInverse})`;
	ctx.fillStyle = `hsla(210, 100%, 35%, 0.02)`;

	for (let i = 0; i < detail; i++) {
		const angle = i * step;

		const x = Math.cos(angle) * (R * scale);
		const y = Math.sin(angle) * (R * scale);

		const noiseValue = getNoiseValue({ x, y, z: frame * 0.02 }, 0.01);
		const mainRadiusIncrease = noiseValue * 100;
		const circleRadius = (R + mainRadiusIncrease) * scale;

		const xAltered = Math.cos(angle) * circleRadius;
		const yAltered = Math.sin(angle) * circleRadius;

		ctx.lineTo(xAltered, yAltered);
	}

	ctx.closePath();
	// ctx.stroke();
	ctx.fill();
	ctx.restore();
};

const loop = () => {
	clear();

	const count = 50;

	for (let i = 0; i < count; i++) {
		const scale = 1 - (i / count);

		drawCircle(scale);
	}

	frame += 1;

	requestAnimationFrame(loop);
};

const start = async () => {
	setupCanvas(W, H);

	ctx.canvas.addEventListener('click', clear);

	ctx.canvas.addEventListener('pointermove', (e) => {
		mousePosition.x = e.offsetX - (W * 0.5);
		mousePosition.y = e.offsetY - (H * 0.5);
	});

	loop();
};

start();
