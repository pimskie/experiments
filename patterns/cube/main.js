// https://twitter.com/Art_Relatable/status/1126486986099834880
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


const stage = new Stage('canvas', 300, 300);
const side = 40;
const cols = Math.ceil(stage.width / side);
const rows = Math.ceil(stage.height / side);

const numSides = 6;
const angleStep = (Math.PI * 2) / numSides;

const mid = { x: stage.widthHalf, y: stage.heightHalf };
const legEnd = { x: mid.x + (Math.cos(angleStep / 2) * side), y: mid.y + (Math.sin(angleStep / 2) * side) };
const distanceX = Math.abs(legEnd.x - mid.x);
const distanceY = Math.abs(legEnd.y - mid.y);

const drawShape = (anchor) => {
	let angle = -Math.PI / 2;

	for (let i = 0; i < numSides; i++) {
		const to = {
			x: anchor.x + (Math.cos(angle) * side),
			y: anchor.y + (Math.sin(angle) * side),
		};

		stage.drawLine(anchor, to);

		angle += angleStep;
	}
};

let x = 0;
let y = 0;

for (let i = 0; i < rows; i += 1) {
	for (let q = 0; q < cols; q += 1) {
		drawShape({ x, y });

		x += distanceX * 2;
	}

	x = i % 2 === 0 ? distanceX : 0;
	y += distanceY * 3;
}
