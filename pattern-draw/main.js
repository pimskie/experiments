import * as Utils from 'https://rawgit.com/pimskie/utils/master/utils.js';

const canvasFigure = Utils.qs('.js-canvas-figure');
const ctxFigure = canvasFigure.getContext('2d');

const W = 500;
const H = 500;
const MID_X = W * 0.5;
const MID_Y = H * 0.5;
const RADIUS = MID_X * 0.95;

ctxFigure.canvas.width = W;
ctxFigure.canvas.height =  H;

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
				// const radius = (this.radius - 100) + (100 * percent);
				const radius = 50 + ((this.radius - 50) * percent);

				const x = MID_X + Math.cos(angle) * radius;
				const y = MID_Y + Math.sin(angle) * radius;

				return { x, y, angle, index };
			})
			.sort((a, b) => a.angle > b.angle ? 1 : a.angle < b.angle ? -1 : 0)
			.splice(1);
	}

	draw(ctx1, ctx2) {
		ctx1.beginPath();
		ctx1.strokeStyle = 'rgba(0, 0, 0, 1)';


		this.points.forEach((point, i) => {
			const { x, y } = point;

			if (i === 0) {
				ctx1.moveTo(x, y);
			} else {
				ctx1.lineTo(x, y);
			}
		});
		ctx1.closePath();
		ctx1.stroke();

		this.points.forEach((point, i) => {
			const indexTo = (i + this.connectionStep + this.points.length) % this.points.length;;
			const pointTo = this.points[indexTo];

			const { x, y, index } = point;
			const { x: xTo, y: yTo } = pointTo;

			const pointAlpha = 0.1 + (0.9 / this.points.length * index);

			ctx1.beginPath();
			ctx1.fillStyle = `rgba(0, 0, 0, ${pointAlpha})`;
			ctx1.arc(x, y, 2, 0, Math.PI * 2, false);
			ctx1.fill();
			ctx1.closePath();

			ctx1.beginPath();
			ctx1.strokeStyle = 'rgba(150, 150, 150, 1)';
			ctx1.moveTo(x, y);
			ctx1.lineTo(xTo, yTo);
			ctx1.stroke();
			ctx1.closePath();
		});
	}
}

const NUM_FIGURES = 4;
const figures = new Array(NUM_FIGURES).fill().map((_, i) => {
	const phase = ((Math.PI * 2) / NUM_FIGURES) * i;
	const speed = 0.008;i % 2 === 0 ? 0.008 : -0.008;

	return new Figure(4, 10, RADIUS, phase, 2, speed);
});

const loop = () => {
	ctxFigure.clearRect(0, 0, W, H);

	figures.forEach((f, i) => {
		f.update();
		f.draw(ctxFigure);
	});

	requestAnimationFrame(loop);
};

loop();

const onPointerMove = (e) => {
	const event = (e.touches && e.touches.length) ? e.touches[0] : e;
	const { clientX, clientY } = event;

	const x = clientX - e.target.offsetLeft;
	const y = clientY - e.target.offsetTop;

	const percentX = x / canvasFigure.width;
	const percentY = y / canvasFigure.height;
};

const onPointerDown = () => {
	paused = !paused;
};

canvasFigure.addEventListener('mousemove', onPointerMove);
canvasFigure.addEventListener('touchmove', onPointerMove);
canvasFigure.addEventListener('mousedown', onPointerDown);
