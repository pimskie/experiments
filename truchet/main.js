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

const tileWidth = 20;
const tileHalfWidth = tileWidth * 0.5;

const ghost = new Stage(document.querySelector('.js-ghost'), tileWidth, tileWidth);
const stage = new Stage(document.querySelector('.js-draw'), 500, 500);

const cols = Math.round(stage.width / ghost.width);
const rows = Math.round(stage.height / ghost.height);

let rotations = [];
let drawFunction;

const clear = () => {
	ghost.clear();
	stage.clear();
};

const reset = () => {
	clear();

	const drawFuntions = [drawArc, drawLine, drawTriangle];

	drawFunction = drawFuntions[Math.floor(Math.random() * drawFuntions.length)];
	rotations = new Array(rows * cols).fill().map(() => Math.floor(Math.random() * 4) * Math.PI / 2);
};

const drawArc = (ctx, percent) => {
	const endAngle = (Math.PI / 2) * percent;

	ctx.beginPath();
	ctx.strokeStyle = '#000';
	ctx.lineWidth = 1;
	ctx.arc(0, 0, tileHalfWidth, 0, endAngle, false);
	ctx.stroke();
	ctx.closePath();

	ctx.save();
	ctx.translate(tileWidth, tileWidth);
	ctx.rotate(Math.PI);
	ctx.drawImage(ghost.canvas, 0, 0);
	ctx.restore();
};

const drawLine = (ctx, percent) => {
	const hypo = Math.hypot(ghost.width, ghost.height);
	const radius = hypo * percent;
	const a = Math.PI / 4;

	ctx.lineWidth = 1;
	ctx.beginPath();
	ctx.lineCap = 'square';
	ctx.moveTo(0, 0);
	ctx.lineTo(Math.cos(a) * radius, Math.sin(a) * radius);
	ctx.stroke();
	ctx.closePath();
};

const drawTriangle = (ctx, percent) => {
	percent *= 0.5;

	ctx.lineCap = 'square';

	ctx.beginPath();
	ctx.moveTo(0, 0);
	ctx.lineTo(ghost.width * percent, 0);
	ctx.lineTo(0, ghost.height * percent);
	ctx.fill();
	ctx.closePath();

	ctx.save();
	ctx.translate(tileWidth, tileWidth);
	ctx.rotate(Math.PI);
	ctx.drawImage(ghost.canvas, 0, 0);
	ctx.restore();
};

const draw = () => {
	const { ctx: ctxGhost } = ghost;
	const { percent } = animation;

	clear();

	drawFunction(ctxGhost, percent);

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
		percent: 1,

		duration: 3000,
		delay: animation.delay,

		easing: 'easeOutQuad',

		begin: reset,
		update: draw,
	}).finished;

	anime({
		targets: animation,
		percent: 0,
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

const animation = { percent: 0, delay: 0 };

reset();
animate();
