import * as Utils from 'https://rawgit.com/pimskie/utils/master/utils.js';

const ctx = Utils.qs('canvas').getContext('2d');

const PI = Math.PI;
const QUART = PI / 2; // lol
const TAU = PI * 2;

const W = window.innerWidth;
const H = window.innerHeight;

const MID_X = W >> 1;
const MID_Y = H >> 1;

ctx.canvas.width = W;
ctx.canvas.height = H;

const LINE_WIDTH = 30;
const R = 20;
const R2 = R * 2;

const COLS = Math.floor(W / R) / 2;
const ROWS = Math.floor(H / R) / 2;

let trails = [];
let rafId = null;

const shuffleArray = arie => arie
	.map(a => [Math.random(), a])
	.sort((a, b) => a[0] - b[0])
	.map(a => a[1]);

class Trail {
	constructor(x, y, colors, angleInc, startAngle = PI) {
		this.x = x;
		this.y = y;

		this.colors = colors;
		this.angleInc = angleInc;

		this.startAngle = startAngle;
		this.endAngle = this.startAngle + this.angleInc;

		this.antiClockwise = false;
	}

	update(change) {
		const changeDirection = change;

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

	drawGrid(W, H, R);

	trails = [];

	cancelAnimationFrame(rafId);

	for (let i = 0; i < ROWS; i++) {
		const trail1 = new Trail(-R, R * (i * 3), ['#6E8898', '#9FB1BC'], PI, PI);
		const trail2 = new Trail(-R2, R * (i * 3), ['#9FB1BC', '#6E8898'], PI, PI);

		trails.push(trail1);
		trails.push(trail2);
	}

	loop();
};


const loop = () => {
	const [trail] = trails;
	trail.update(true);
	// trails.forEach(t => t.update(true));

	trails = shuffleArray(trails);

	rafId = requestAnimationFrame(loop);
};


ctx.canvas.addEventListener('click', init);

init();
