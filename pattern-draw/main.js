import * as Utils from 'https://rawgit.com/pimskie/utils/master/utils.js';

const canvas = Utils.qs('canvas');
const ctx = canvas.getContext('2d');

ctx.globalCompositeOperation = 'lighter';

const W = 500;
const H = 500;
const MID_X = W * 0.5;
const MID_Y = H * 0.5;
const RADIUS = MID_X * 0.5;

ctx.canvas.width = W;
ctx.canvas.height = H;

let phase = 0;
let paused = false;

const connectionStep = 2;

const minimumPoints = 4;
const maxPoints = 10;
const angleStepMinumum = Math.PI * 2 / minimumPoints;
const angleStepMaximum = Math.PI * 2 / maxPoints;
const angleStepDiff = angleStepMaximum - angleStepMinumum;

const loop = () => {
	ctx.fillStyle = 'rgba(255, 255, 255, 1)';
	ctx.fillRect(0, 0, W, H);

	const percent = Utils.map(Math.sin(phase) * 100, -100, 100, 0, 1);

	const points = new Array(maxPoints + 1)
		.fill()
		.map((_, i) => {
			const angle = (i * angleStepMinumum + (angleStepDiff * i * percent)) % (Math.PI * 2);
			const radius = (RADIUS - 100) + (100 * percent);

			const x = MID_X + Math.cos(angle) * radius;
			const y = MID_Y + Math.sin(angle) * radius;

			return { x, y, angle };
		})
		.sort((a, b) => a.angle > b.angle ? 1 : a.angle < b.angle ? -1 : 0)
		.splice(1);


	ctx.beginPath();
	ctx.fillStyle = 'rgba(0, 0, 0, 1)';

	points.forEach((point, i) => {
		const { x, y } = point;

		if (i === 0) {
			ctx.moveTo(x, y);
		} else {
			ctx.lineTo(x, y);
		}
	});
	ctx.closePath();
	ctx.stroke();

	points.forEach((point, i) => {
		const indexTo = (i + connectionStep + points.length) % points.length;;
		const pointTo = points[indexTo];

		const { x, y } = point;
		const { x: xTo, y: yTo } = pointTo;

		ctx.beginPath();
		ctx.fillStyle = '#000';
		ctx.arc(x, y, 2, 0, Math.PI * 2, false);
		ctx.fill();
		ctx.closePath();

		// connection
		ctx.beginPath();
		ctx.moveTo(x, y);
		ctx.lineTo(xTo, yTo);
		ctx.stroke();
		ctx.closePath();
	});

	if (!paused) {
		phase += 0.008;
	}

	requestAnimationFrame(loop);
};

loop();

const onPointerMove = (e) => {
	const event = (e.touches && e.touches.length) ? e.touches[0] : e;
	const { clientX, clientY } = event;

	const x = clientX - e.target.offsetLeft;
	const y = clientY - e.target.offsetTop;

	const percentX = x / canvas.width;
	const percentY = y / canvas.height;
};

const onPointerDown = () => {
	paused = !paused;
};

canvas.addEventListener('mousemove', onPointerMove);
canvas.addEventListener('touchmove', onPointerMove);
canvas.addEventListener('mousedown', onPointerDown);
