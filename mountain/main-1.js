/* globals noise: false */

noise.seed(Math.random());

const canvas = document.querySelector('canvas');
const ctx = canvas.getContext('2d');

const PI = Math.PI;
const PI2 = PI * 2;
const TO_RADIAN = PI / 180;
const TO_DEGREE = 180 / PI;
const TICK_SPEED = 0.02;

// all set in `setStage`
let w = window.innerWidth;
let h = 500;
let midY = h >> 1;
let tick = 0;

canvas.width = w;
canvas.height = h;

const shape = {
	color: '#000',
	angle: 0,
	speed: 0.01,
	position: {
		x: 0,
		y: midY,
	},

	triangles: [
		// {
		// 	angle: 1,
		// 	color: 'rgba(100, 100, 100, 0.4)',
		// 	arms: [
		// 		{ length: 150, angle: -45 * TO_RADIAN },
		// 		{ length: 160, angle: -48 * TO_RADIAN },
		// 	],
		// },

		{
			angle: 0.1,
			color: 'rgba(210, 210, 210, 0.1)',
			arms: [
				{ length: 150, angle: 0 * TO_RADIAN },
				{ length: 160, angle: 20 * TO_RADIAN },
			],
		},
		{
			angle: 0,
			color: 'rgba(255, 255, 255, 0.1)',
			arms: [
				{ length: 150, angle: 0 * TO_RADIAN },
				{ length: 160, angle: 15 * TO_RADIAN },
			],
		},
	],
};

const drawCircle = (pos) => {
	ctx.beginPath();
	ctx.fillStyle = 'black';
	ctx.arc(pos.x, pos.y, 1, 0, PI * 2, false);
	ctx.fill();
	ctx.closePath();
};

const setupStage = () => {
	onResize();
};

const onResize = () => {
	w = window.innerWidth;

	midY = h >> 1;

	canvas.width = w;
	canvas.height = h;
};

const clear = () => {
	ctx.fillStyle = 'rgba(0, 0, 0, 1)';
	ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
};

let r = 10;

const loop = () => {
	// clear();

	shape.position.x += 2;
	shape.position.y = midY;// + (Math.sin(shape.angle) * r);

	shape.angle -= shape.speed;

	// drawCircle(shape.position);
	const { x: fromX, y: fromY } = shape.position;

	shape.triangles.forEach((triangle) => {
		ctx.strokeStyle = triangle.color;
		ctx.fillStyle = triangle.color;

		ctx.beginPath();
		ctx.moveTo(fromX, fromY);

		triangle.arms.forEach((arm) => {
			const angle = shape.angle + triangle.angle + arm.angle;
			const toX = fromX + (Math.cos(angle) * arm.length);
			const toY = fromY + (Math.sin(angle) * arm.length);

			ctx.lineTo(toX, toY);
		});

		ctx.lineTo(fromX, fromY);
		ctx.fill();
		ctx.closePath();
	});

	if (shape.position.x > w) {
		shape.position.x = -r;

		tick += TICK_SPEED;

		r = 30 * noise.perlin2(tick, tick);

		console.log(r);
	}

	requestAnimationFrame(loop);
};

window.addEventListener('resize', onResize);

setupStage();
loop();
