import anime from '//unpkg.com/animejs@3.0.1/lib/anime.es.js';

class Stage {
	constructor(canvas, width, height) {
		this.canvas = canvas;
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

const randomMultipleOf = (maxValue, multipleOf) => {
	const randomValue = maxValue * Math.random();

	return randomValue - (randomValue % multipleOf);
};

const tileWidth = 20;
const tileHalfWidth = tileWidth * 0.5;

const ghost = new Stage(document.querySelector('.js-ghost'), tileWidth, tileWidth);
const stage = new Stage(document.querySelector('.js-draw'), 500, 500);

const cols = Math.round(stage.width / ghost.width);
const rows = Math.round(stage.height / ghost.height);

const animation = { angle: 0, length: 0, delay: 0 };

let rotations = [];

const clear = () => {
	ghost.clear();
	stage.clear();
};

const reset = () => {
	clear();

	rotations = new Array(rows * cols).fill().map(() => Math.floor(Math.random() * 2) * Math.PI / 2);
};

const generatePattern = () => {
	const { ctx: ghostCtx } = ghost;
	const { angle, length } = animation;

	ghostCtx.beginPath();
	ghostCtx.strokeStyle = '#000';
	ghostCtx.lineWidth = tileHalfWidth * 0.5;
	ghostCtx.arc(0, 0, tileHalfWidth, angle, angle + length, false);
	ghostCtx.stroke();
	ghostCtx.closePath();

	ghostCtx.save();
	ghostCtx.translate(tileWidth, tileWidth);
	ghostCtx.rotate(Math.PI);
	ghostCtx.drawImage(ghost.canvas, 0, 0);
	ghostCtx.restore();
};

const draw = () => {
	clear();
	generatePattern();

	const { ctx } = stage;

	let i = 0;

	for (let row = 0; row < rows; row += 1) {
		for (let col = 0; col < cols; col += 1) {
			const x = tileHalfWidth + (col * tileWidth);
			const y = tileHalfWidth + (row * tileWidth);
			const rotation = rotations[i];

			ctx.save();
			ctx.translate(x, y);
			ctx.rotate(rotation);
			ctx.drawImage(ghost.canvas, -tileHalfWidth, -tileHalfWidth);
			ctx.restore();

			i++;
		}
	}
};

const animate = async () => {
	await anime({
		targets: animation,
		length: Math.PI / 2,

		duration: 3000,
		delay: animation.delay,

		easing: 'easeOutQuad',

		begin: reset,
		update: draw,
	}).finished;

	anime({
		targets: animation,
		length: 0,
		duration: 1500,
		delay: 1000,
		easing: 'easeInExpo',

		update: draw,
		complete: () => {
			animation.delay = 500;
			animate();
		},
	});
};

reset();
animate();
