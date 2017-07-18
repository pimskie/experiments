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
		x: 10,
		y: midY,
	},

	triangles: [
		{
			color: 'rgba(0, 0, 0, 0.1)',
			points: [
				{ x: 50, y: -20 },
				{ x: -90, y: -30 },
				{ x: -50, y: 0 },
			],
		},
	],
};

const drawCircle = (pos) => {
	ctx.beginPath();
	ctx.fillStyle = 'black';
	ctx.arc(pos.x, pos.y, 2, 0, PI * 2, false);
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
	ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
};

let r = 10;

const loop = () => {
	// clear();

	shape.position.x += 1;
	shape.position.y = midY;

	shape.angle -= shape.speed;

	const { x: fromX, y: fromY } = shape.position;

	ctx.save();
	ctx.translate(fromX, fromY);
	ctx.rotate(shape.angle);

	shape.triangles.forEach((triangle) => {
		ctx.strokeStyle = triangle.color;
		ctx.fillStyle = triangle.color;


		ctx.beginPath();

		triangle.points.forEach((point, index) => {
			if (index === 0) {
				ctx.moveTo(point.x, point.y);
			} else {
				ctx.lineTo(point.x, point.y);
			}
		});

		ctx.lineTo(triangle.points[0].x, triangle.points[0].y);
		ctx.stroke();
		ctx.closePath();
	});

	ctx.restore();

	if (shape.position.x > w) {
		shape.position.x = -r;
	}

	requestAnimationFrame(loop);
};

window.addEventListener('resize', onResize);

setupStage();
loop();
