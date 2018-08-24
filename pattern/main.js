import * as Utils from 'https://rawgit.com/pimskie/utils/master/utils.js';

const ctx = Utils.qs('canvas').getContext('2d');

const PI = Math.PI;
const QUART = PI / 2; // lol
const TAU = PI * 2;

const W = 500;
const H = 500;

ctx.canvas.width = W;
ctx.canvas.height = H;

const LINE_WIDTH = 10;
const R = 10;
const R2 = R * 2;

let trails = [];
let frame = 0;
let rafId = null;

const shuffleArray = arie => arie
	.map(a => [Math.random(), a])
	.sort((a, b) => a[0] - b[0])
	.map(a => a[1]);

class Trail {
	constructor(x, y, colors, angleInc) {
		this.x = x;
		this.y = y;

		this.colors = colors;
		this.angleInc = angleInc;

		this.startAngle = 0;
		this.endAngle = this.startAngle + this.angleInc;

		this.antiClockwise = false;
	}

	iterate() {
		const changeDirection = Math.random() > 0.5;

		if (changeDirection) {
			this.acw = !this.acw;
		}

		this.startAngle = changeDirection
			? this.endAngle - PI
			: this.endAngle;

		if (this.startAngle === -PI) {
			this.startAngle = PI;
		}

		this.endAngle = this.acw
			? this.startAngle - this.angleInc
			: this.startAngle + this.angleInc;

		if (changeDirection) {
			this.x -= Math.cos(this.startAngle) * R2;
			this.y -= Math.sin(this.startAngle) * R2;
		}

		if (Math.abs(this.startAngle) === TAU) {
			this.endAngle = -this.angleInc;
			this.startAngle = 0;
		}

		this.draw(this.x, this.y, this.startAngle, this.endAngle, this.acw);
	}

	draw(x, y, startAngle, endAngle, acw = false) {
		const [outside, inside] = this.colors;

		this.drawSegment(x, y, startAngle, endAngle, acw, LINE_WIDTH, outside);
		this.drawSegment(x, y, startAngle, endAngle, acw, LINE_WIDTH * 0.75, inside);
	}

	drawSegment(x, y, startAngle, endAngle, acw, lineWidth, color) {
		ctx.beginPath();
		ctx.lineWidth = lineWidth;
		ctx.strokeStyle = color;
		ctx.arc(x, y, R, startAngle, endAngle, acw);
		ctx.stroke();
		ctx.closePath();
	}
}

const drawLine = (from, to) => {
	ctx.beginPath();
	ctx.lineWidth = 0.5;
	ctx.strokeStyle = 'rgba(0, 0, 0, 0.2)';

	ctx.moveTo(from.x, from.y);
	ctx.lineTo(to.x, to.y);

	ctx.stroke();
	ctx.closePath();
};

const drawGrid = (width, height, size) => {
	let y = 0;

	for (let x = 0; x <= width; x += size) {
		const from = { x, y: 0 };
		const to = { x, y: height };

		drawLine(from, to);
	}

	for (let y = 0; y <= height; y += size) {
		const from = { x: 0, y };
		const to = { x: width, y };

		drawLine(from, to);
	}
};


const clear = () => {
	ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
};

const init = () => {
	clear();

	// drawGrid(W, H, R);

	trails = [];
	frame = 0;

	cancelAnimationFrame(rafId);

	for (let i = 0; i < 15; i++) {
		const t1 = new Trail(Math.random() * W, Math.random() * H, ['#6E8898', '#9FB1BC'], QUART);
		const t2 = new Trail(Math.random() * W, Math.random() * H, ['#1A535C', '#F7FFF7'], QUART);
		const t3 = new Trail(Math.random() * W, Math.random() * H, ['#A23E48', '#FF3C38'], QUART);

		trails.push(t1);
		trails.push(t2);
		trails.push(t3);
	}

	loop();
};

const loop = () => {
	trails.forEach((trail) => {
		if (trail.x < -R || trail.x > W + R || trail.y < -R || trail.y > H + R) {
			// trail.x = MID_X - R;
			// trail.y = MID_Y - R;
		}

		trail.iterate();
		trail.draw();
	});

	shuffleArray(trails);

	frame++;

	if (frame < 500) {
		rafId = requestAnimationFrame(loop);
	}
};


ctx.canvas.addEventListener('click', init);

init();
loop();
