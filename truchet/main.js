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

	clear(color = 'rgba(0, 0, 0, 0)') {
		this.ctx.fillStyle = color;
		this.ctx.fillRect(0, 0, this.width, this.height);
	}
}

const randArrVal = arr =>  arr[Math.floor(Math.random() * arr.length)];

const cols = 30;
const rows = cols;

const stageWidth = 500;
const stageHeight = 500;

const tileWidth = Math.ceil(stageWidth / cols);
const tileHalfWidth = tileWidth * 0.5;

const ghost = new Stage(document.querySelector('.js-ghost'), tileWidth, tileWidth);
const stage = new Stage(document.querySelector('.js-draw'), stageWidth, stageHeight);



let rotations = [];
const color = '#000';

let drawFunction;

const clear = () => {
	ghost.ctx.clearRect(0, 0, ghost.width, ghost.height);
	stage.clear('#fff');
};

const reset = () => {
	clear();

	const drawFuntions = [drawArc, drawLine, drawTriangle, drawTriangleDouble];

	drawFunction = randArrVal(drawFuntions);
	rotations = new Array(rows * cols).fill().map(() => Math.floor(Math.random() * 4) * Math.PI / 2);
};

const drawArc = (ctx, percent) => {
	const endAngle = (Math.PI / 2) * percent;

	ctx.beginPath();
	ctx.strokeStyle = color;
	ctx.lineWidth = 2;
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
	const hypo = Math.hypot(ghost.width, ghost.height) * 1.2;
	const radius = hypo * percent;
	const a = Math.PI / 4;

	ctx.lineWidth = 2;
	ctx.strokeStyle = color;

	ctx.beginPath();
	ctx.lineCap = 'square';
	ctx.moveTo(0, 0);
	ctx.lineTo(Math.cos(a) * radius, Math.sin(a) * radius);
	ctx.stroke();
	ctx.closePath();
};

const drawTriangle = (ctx, percent) => {
	ctx.fillStyle = color;

	ctx.beginPath();
	ctx.moveTo(0, 0);
	ctx.lineTo(ghost.width * percent, 0);
	ctx.lineTo(0, ghost.height * percent);
	ctx.fill();
	ctx.closePath();
};

const drawTriangleDouble = (ctx, percent) => {
	percent *= 0.5;

	drawTriangle(ctx, percent);

	ctx.save();
	ctx.translate(tileWidth, tileWidth);
	ctx.rotate(Math.PI);
	ctx.drawImage(ghost.canvas, 0, 0);
	ctx.restore();
};

const draw = () => {
	clear();

	const { ctx: ctxGhost } = ghost;
	const { percent } = animation;

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
		easing: 'easeOutBack',

		begin: reset,
		update: draw,
	}).finished;

	anime({
		targets: animation,
		percent: 0,

		duration: 1500,
		delay: 1500,
		easing: 'easeInExpo',

		update: draw,

		complete: () => {
			animation.delay = 1000;

			animate();
		},
	});
};

const animation = { percent: 0, delay: 0 };

reset();
animate();
