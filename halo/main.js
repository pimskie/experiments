const ctx = document.querySelector('.js-canvas').getContext('2d');

const { canvas } = ctx;

noise.seed(Math.random());

const TAU = Math.PI * 2;
const W = 500; // window.innerWidth;
const H = 500; //window.innerHeight;

const MX = W >> 1;
const MY = H >> 1;

const R = 100;
const R2 = R * 0.25;


const DETAIL = 100;
const ANGLE_STEP = TAU / DETAIL;

let phase = 1;

canvas.width = W;
canvas.height = H;

let circles = [];

const getNoiseValue = (x, y, iteration = 1) => {
	const positionScale = 0.01;
	const iterationScale = 0.02;

	const xs = x * positionScale;
	const ys = y * positionScale;
	const z = iteration * iterationScale;

	const n = noise.perlin3(xs, ys, z);

	return n;
};

const createCircle = (iteration) => {
	const points = new Array(DETAIL).fill().map((_, i) => {
		const angle = ANGLE_STEP * i;
		const x = Math.cos(angle) * R;
		const y = Math.sin(angle) * R;

		const noiseValue = getNoiseValue(x, y, iteration);

		return {
			angle,
			noiseValue,
		};
	});

	return {
		points,
		r: R,
		life: 1,
	};
};

const drawCircle = (circle) => {
	ctx.save();
	ctx.beginPath();

	circle.points.forEach((point) => {
		const pointR = circle.r + (50 * point.noiseValue);

		const x = (W >> 1) + Math.cos(point.angle) * pointR;
		const y = (H >> 1) + Math.sin(point.angle) * pointR;

		ctx.lineTo(x, y);

	});

	circle.r += 0.5;

	ctx.closePath();
	ctx.stroke();
	ctx.restore();
};

const clear = () => {
	ctx.clearRect(0, 0, W, H);
};

const loop = () => {
	clear();

	const circle = createCircle(phase);

	circles.push(circle);

	circles.forEach((circle) => {
		drawCircle(circle);

		circle.life *= 0.99;
	});

	circles = circles.filter(c => c.life > 0.1);

	phase++;

	requestAnimationFrame(loop);
};

loop();
