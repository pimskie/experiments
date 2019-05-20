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
const side = 20;
const cols = Math.ceil(stage.width / side);
const rows = Math.ceil(stage.height / side);

const drawDiagonal = (from, angle, length) => {
	const to = {
		x: from.x + (Math.cos(angle) * length),
		y: from.y + (Math.sin(angle) * length),
	};

	stage.drawLine(from, to, 'red');
};

const numSides = 6;
const angleStep = (Math.PI * 2 / numSides);

const t1 = { x: Math.cos(0) * side, y: Math.sin(0) * side };
const t2 = { x: Math.cos(angleStep) * side, y: Math.sin(angleStep) * side };
const distance = (t1.x - t2.x) / 2;


const drawShape = () => {
	let angle = -Math.PI / 2;

	for (let i = 0; i < numSides; i++) {
		const to = {
			x: mid.x + (Math.cos(angle) * side),
			y: mid.y + (Math.sin(angle) * side),
		};
		stage.drawLine(mid, to);

		angle += angleStep;
	}
};

let mid = { x: stage.widthHalf, y: stage.heightHalf };
drawShape();

mid.x += side * 1.5 + distance;
drawShape();


// console.log(dy);

// let offsetX = 0;
// let y = 0;

// for (let i = 0; i < 1; i += 1) {
// 	for (let q = 0; q < cols; q += 1) {
// 		const x = offsetX + (q * side);

// 		const from = { x, y };
// 		const to = { x, y: y + side };

// 		stage.drawLine(from, to);
// 	}

// 	y += side / 2;
// 	offsetX = side / 2;
// }
