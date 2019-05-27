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

	drawLine(from, to) {
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

const randomMultipleOf = (maxValue, multipleOf) => {
	const randomValue = maxValue * Math.random();

	// random value between 0 and `maxValue`, dividable by `multipleOf`
	return randomValue - (randomValue % multipleOf);
};

const stage = new Stage('canvas', 500, 500);

const destinationLength = 20 + (Math.random() * 20);

const segment = {
	x: stage.widthHalf,
	y: stage.heightHalf,
	length: 0,
	angle: 0,
};

let from = {
	x: segment.x,
	y: segment.y,
};

let to = {
	x: segment.x,
	y: segment.y,
};

const go = () => {
	segment.x = to.x;
	segment.y = to.y;
	segment.angle = randomMultipleOf(Math.PI * 2, Math.PI / 4);
	segment.length = 0;

	anime({
		targets: segment,
		length: destinationLength,

		easing: 'easeOutCirc',
		duration: 100,

		update: () => {
			to.x = segment.x + (Math.cos(segment.angle) * segment.length);
			to.y = segment.y + (Math.sin(segment.angle) * segment.length);

			stage.drawLine(segment, to);
		},

		complete: () => {
			go();
		},
	});
};


go();
