import anime from '//unpkg.com/animejs@3.0.1/lib/anime.es.js';

class Stage {
	constructor(canvasSelector, width, height) {
		this.canvas = document.querySelector(canvasSelector);
		this.ctx = this.canvas.getContext('2d');

		this.width = width;
		this.height = height;
	}

	get width() {
		return this.canvas.width;
	}

	get height() {
		return this.canvas.height;
	}

	get widthHalf() {
		return this.width * 0.5;
	}

	get heightHalf() {
		return this.height * 0.5;
	}

	set width(w) {
		this.canvas.width = w;
	}

	set height(h) {
		this.canvas.height = h;
	}

	drawLine(from, to, color = '#000') {
		this.ctx.strokeStyle = color;
		this.ctx.beginPath();
		this.ctx.moveTo(from.x, from.y);
		this.ctx.lineTo(to.x, to.y);
		this.ctx.stroke();
		this.ctx.closePath();
	}

	clear() {
		this.ctx.clearRect(0, 0, this.width, this.height);
	}
}

const stage = new Stage('canvas', 500, 500);
const sideLength = 50;
const cols = Math.ceil(stage.width / sideLength);
const rows = Math.ceil(stage.height / sideLength);

const numSides = 6;
const angleStep = (Math.PI * 2) / numSides;

const mid = { x: stage.widthHalf, y: stage.heightHalf };
const legEnd = { x: mid.x + (Math.cos(angleStep / 2) * sideLength), y: mid.y + (Math.sin(angleStep / 2) * sideLength) };
const distanceX = Math.abs(legEnd.x - mid.x);
const distanceY = Math.abs(legEnd.y - mid.y);

const drawShape = (mid, ctx) => {
	let angle = -Math.PI / 2;

	ctx.save();
	ctx.translate(mid.x, mid.y);

	ctx.moveTo(Math.cos(angle) * sideLength, Math.sin(angle) * sideLength);

	for (let i = 1; i < numSides; i++) {
		angle += angleStep;

		ctx.lineTo(Math.cos(angle) * sideLength, Math.sin(angle) * sideLength);
	}

	ctx.closePath();
	ctx.stroke();

	ctx.restore();
};


let x = distanceX;
let y = distanceY * 2;

const forms = [];

for (let i = 0; i < rows; i += 1) {
	for (let q = 0; q < cols; q += 1) {
		drawShape({ x, y }, stage.ctx);
		drawShape({ x: x - distanceX, y: y - distanceY }, stage.ctx);

		x += distanceX * 2;
	}

	x = i % 2 === 0 ? distanceX * 2 : distanceX;
	y += distanceY * 3;
}

console.log( { distanceX, distanceY });

