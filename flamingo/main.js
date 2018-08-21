// https://www.youtube.com/watch?v=7t54saw9I8k
// https://www.youtube.com/watch?v=7t54saw9I8

// https://www.youtube.com/watch?v=hbgDqyy8bIw

// import * as Utils from 'https://rawgit.com/pimskie/utils/master/utils.js';
import * as Utils from './utils.js';

const ctx = Utils.qs('canvas').getContext('2d');
const TAU = Math.PI * 2;

const W = 500;
const H = 500;
const MID_X = W * 0.5;
const MID_Y = H * 0.5;

ctx.canvas.width = W;
ctx.canvas.height = H;

class Segment {
	constructor(start, angle, length, parent = null) {
		this.start = start;
		this.angle = angle;
		this.length = length;
		this.parent = parent;

		this._end = new Vector();
	}

	get end() {
		const x = this.start.x + Math.cos(this.angle) * this.length;
		const y = this.start.y + Math.sin(this.angle) * this.length;

		this._end.x = x;
		this._end.y = y;

		return this._end;
	}

	follow(target) {
		const dir = target.subtract(this.start);

		this.angle = dir.angle;
		this.start.x = target.x - Math.cos(this.angle) * this.length;
		this.start.y = target.y - Math.sin(this.angle) * this.length;

		if (this.parent) {
			this.parent.follow(this.start);
		}
	}

	draw(ctx) {
		const {start, end } = this;

		ctx.beginPath();
		ctx.moveTo(start.x, start.y);
		ctx.lineTo(end.x, end.y);
		ctx.stroke();
		ctx.closePath();
	}
}

const segments = [];
let start = new Vector(MID_X, MID_Y);
let parent = null;

for (let i = 0; i < 3; i++)  {
	segments.push(new Segment(start, 0, 50, parent));

	start = segments[i].end.clone();
	parent = segments[i];
}

const mouse = new Vector(MID_X, MID_Y);

const clear = () => {
	ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
};

const loop = () => {
	clear();

	segments[segments.length - 1].follow(mouse);

	segments.forEach((segment) => {
		segment.draw(ctx);
	});

	requestAnimationFrame(loop);
};

const onPointerMove = (e) => {
	const event = (e.touches && e.touches.length) ? e.touches[0] : e;
	const { target, clientX: pointerX, clientY: pointerY } = event;

	const x = pointerX - target.offsetLeft;
	const y = pointerY - target.offsetTop;

	mouse.x = x;
	mouse.y = y;
};


ctx.canvas.addEventListener('mousemove', onPointerMove);
ctx.canvas.addEventListener('touchmove', onPointerMove);

loop();
