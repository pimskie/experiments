// Inspired by: https://www.openprocessing.org/sketch/85797
// Which is also much nicer

const canvas = document.querySelector('canvas');
const ctx = canvas.getContext('2d');

const w = 500;
const h = 500;
const midX = w >> 1;
const midY = h >> 1;

const PI = Math.PI;
const TO_RADIAN = PI / 180;

canvas.width = w;
canvas.height = h;

class Branch {
	constructor(position = {x : 0, y: 0}, length = 100, divergeAt = 0.5, angle = 0, depth = 0, amp = 45 * TO_RADIAN) {
		this.position = position;
		this.length = length;
		this.divergeAt = divergeAt;
		this.angle = angle;
		this.depth = depth;

		this.color = '#000';
		this.amp = amp;
		this.branches = [];

		this.grow();
	}

	grow() {
		if (!this.canBranch) {
			return;
		}

		this.branches = [];

		const nextLength = this.length * 0.75;
		const nextDepth = this.depth + 1;

		this.branches.push(
			new Branch(
				this.growPosition,
				nextLength,
				this.divergeAt,
				this.angle + this.amp,
				nextDepth,
				this.amp
			),
			new Branch(
				this.growPosition,
				nextLength,
				this.divergeAt,
				this.angle - this.amp,
				nextDepth,
				this.amp
			)
		);
	}

	update(amp, divergeAt) {
		this.amp = amp;
		this.divergeAt = divergeAt;

		this.grow();
	}

	get growPosition() {
		const dl = this.length * this.divergeAt;

		return {
			x: this.position.x + (Math.cos(this.angle) * dl),
			y: this.position.y + (Math.sin(this.angle) * dl),
		};
	}

	get canBranch() {
		return this.depth < 3;
	}
}

const branchPos = { x: midX, y: midY };
const divergeAt = 0.25;

const branches = [
	new Branch(
		branchPos,
		midY,
		divergeAt,
		-90 * TO_RADIAN,
		0
	),
	new Branch(
		branchPos,
		midY,
		divergeAt,
		0,
		0
	),
	new Branch(
		branchPos,
		midY,
		divergeAt,
		90 * TO_RADIAN,
		0
	),
	new Branch(
		branchPos,
		midY,
		divergeAt,
		180 * TO_RADIAN,
		0
	),
];


const drawBranch = (b) => {
	const endX = b.length;
	const endY = 0;

	ctx.save();
	ctx.beginPath();

	ctx.strokeStyle = b.color;
	ctx.translate(b.position.x, b.position.y);
	ctx.rotate(b.angle);

	ctx.moveTo(0, 0);
	ctx.lineTo(endX, endY);

	ctx.stroke();
	ctx.closePath();
	ctx.restore();

	b.branches.forEach(drawBranch);
};

const clear = () => {
	ctx.clearRect(0, 0, ctx.canvas.width,ctx.canvas.height);
};

const loop = () => {
	clear();

	branches.forEach(drawBranch);

	requestAnimationFrame(loop);
};

const onPointerMove = (e) => {
	const target = (e.touches && e.touches.length) ? e.touches[0] : e;
	const { clientX: x, clientY: y } = target;

	const width = window.innerWidth;
	const height = window.innerHeight;

	const widthHalf = width / 2;
	const ampX = ((x - widthHalf) / widthHalf) * (45 * TO_RADIAN);
	const ampY = y / height;

	branches.forEach((b) => {
		b.update(ampX, ampY);
	});
};

document.addEventListener('mousemove', onPointerMove);
document.addEventListener('touchmove', onPointerMove);

loop();
