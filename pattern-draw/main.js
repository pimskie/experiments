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

let paused = false;

class Figure {
	constructor(minPoints, maxPoints, radius, phase = 0, connectionStep = 2, speed = 0.008) {
		this.minPoints = minPoints;
		this.maxPoints = maxPoints;
		this.radius = radius;
		this.connectionStep = connectionStep;

		this.angleStepMinumum = Math.PI * 2 / this.minPoints;
		this.angleStepMaximum = Math.PI * 2 / this.maxPoints;
		this.angleStepDiff = this.angleStepMaximum - this.angleStepMinumum;

		this.speed = speed;
		this.phase = phase;
	}

	update() {
		this.phase += this.speed;

		const percent = Utils.map(Math.sin(this.phase) * 100, -100, 100, 0, 1);

		this.points = new Array(this.maxPoints + 1)
			.fill()
			.map((_, index) => {
				const angle = (index * this.angleStepMinumum + (this.angleStepDiff * index * percent)) % (Math.PI * 2);
				const radius = (this.radius - 100) + (100 * percent);

				const x = MID_X + Math.cos(angle) * radius;
				const y = MID_Y + Math.sin(angle) * radius;

				return { x, y, angle, index };
			})
			.sort((a, b) => a.angle > b.angle ? 1 : a.angle < b.angle ? -1 : 0)
			.splice(1);
	}

	draw(ctx) {
		ctx.beginPath();
		ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';

		this.points.forEach((point, i) => {
			const { x, y } = point;

			if (i === 0) {
				ctx.moveTo(x, y);
			} else {
				ctx.lineTo(x, y);
			}
		});
		ctx.closePath();
		ctx.fill();
		// ctx.stroke();

		this.points.forEach((point, i) => {
			const indexTo = (i + this.connectionStep + this.points.length) % this.points.length;;
			const pointTo = this.points[indexTo];

			const { x, y, index } = point;
			const { x: xTo, y: yTo } = pointTo;

			const pointAlpha = 0.1 + (0.9 / this.points.length * index);

			ctx.beginPath();
			ctx.fillStyle = `rgba(0, 0, 0, ${pointAlpha})`;
			ctx.arc(x, y, 2, 0, Math.PI * 2, false);
			ctx.fill();
			ctx.closePath();

			// connection
			ctx.beginPath();
			ctx.moveTo(x, y);
			ctx.lineTo(xTo, yTo);
			// ctx.stroke();
			ctx.closePath();
		});
	}
}

const NUM_FIGURES = 1;
const figures = new Array(NUM_FIGURES).fill().map((_, i) => {
	const phase = (Math.PI / 2) / NUM_FIGURES * i;
	const speed = i % 2 === 0 ? 0.008 : -0.008;

	return new Figure(4, 10, RADIUS, phase, 2, speed);
});

const clear = () => {
	ctx.fillStyle = 'rgba(255, 255, 255, 1)';
	ctx.fillRect(0, 0, W, H);
};
const loop = () => {
	clear();

	figures.forEach((f, i) => {
		f.update();
		f.draw(ctx);
	});

	for (let i = 0; i < figures.length - 1; i++) {
		const { points: pointsFrom } = figures[i];
		const { points: pointsTo } = figures[i + 1];

		pointsFrom.forEach((pointFrom, i) => {
			const pointTo = pointsTo[i];

			ctx.beginPath();
			ctx.moveTo(pointFrom.x, pointFrom.y);
			ctx.lineTo(pointTo.x, pointTo.y);
			// ctx.stroke();
			ctx.closePath();
		});
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
