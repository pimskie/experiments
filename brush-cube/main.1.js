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

	clear() {
		this.ctx.clearRect(0, 0, this.width, this.height);
	}
}

const stage = new Stage('canvas', 500, 500);
const targetLength = 30;
let loopCount = 0;

class Branch {
	constructor(angle, from, stage) {
		this.stage = stage;

		this.angle = angle;
		this.from = from;

		this.to = { x: from.x, y: from.y };
		this.origin = { x: from.x, y: from.y };

		this.length = 0;
	}

	run() {
		anime({
			targets: this,
			length: targetLength,
			easing: 'easeOutCubic',
			duration: 250,

			update: () => {
				this.draw();
			},
			// update: () => draw(line),
			// complete: () => {
			// 	if (loopCount < 20) {
			// 		if (line.direction === Math.PI / 2) {
			// 			addLine(Math.PI * 0.25, { x: line.to.x, y: line.to.y });
			// 			addLine(Math.PI * 0.75, { x: line.to.x, y: line.to.y });
			// 		} else {
			// 			addLine(Math.PI * 0.5, { x: line.to.x, y: line.to.y });
			// 		}
			// 	} else {
			// 		addLine(Math.PI / 2, {
			// 			x: stage.widthHalf + (Math.cos(Math.PI / 2) * targetLength),
			// 			y: Math.sin(Math.PI / 2) * targetLength,
			// 		});
			// 	}

			// 	line = null;

			// 	loopCount++;
			// },
		});
	}

	draw() {
		const { ctx } = this.stage;
		const { angle, length, from, to } = this;

		to.x = from.x + (Math.cos(angle) * length);
		to.y = from.y + (Math.sin(angle) * length);

		ctx.beginPath();
		ctx.moveTo(from.x, from.y);
		ctx.lineTo(to.x, to.y);
		ctx.stroke();
		ctx.closePath();
	}
}

const draw = (line) => {
	c
};

const loop = () => {
	requestAnimationFrame(loop);
};

const branch = new Branch(Math.PI / 2, { x: stage.widthHalf, y: 0 }, stage);

branch.run();
