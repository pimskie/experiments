// https://ptsjs.org/
const TAU = Math.PI * 2;
const PERP = Math.PI / 2;

const canvas = document.querySelector('.js-draw');

class Stage {
	constructor(canvas, width, height) {
		this.canvas = canvas;
		this.ctx = canvas.getContext('2d');

		this.canvas.width = width;
		this.canvas.height = height;

		this.hypo = Math.hypot(width, height);

		this.mouseAngle = 0;
		this.points = [];

		this.line = { from: { x: 0, y: height * 0.5 }, to: { x: width, y: height * 0.5 } };

		this.colors = [['#fff', '#000', '#000', '#000','#000']];
		this.palette = this.colors[0];
	}

	get backgroundColor() {
		return this.palette[0];
	}

	get lineColor() {
		return this.palette[4];
	}

	get pointColor() {
		return this.palette[3];
	}

	get width() {
		return this.canvas.width;
	}

	get widthHalf() {
		return this.width * 0.5;
	}

	get height() {
		return this.canvas.height;
	}

	get heightHalf() {
		return this.height * 0.5;
	}

	async init() {
		this.colors = await Stage.getColors();

		this.points = new Array(100).fill().map(() => {
			const r = 50 + Math.random() * this.heightHalf;
			const o = r / this.heightHalf;
			const p = {
				r,
				o,
				a: Math.random() * TAU,
				s: 0.0005 + (Math.random() * 0.0005),
			};

			return p;
		});

		this.setPalette();

		this.canvas.addEventListener('mousemove', e => this.onMouseMove(e));
		this.canvas.addEventListener('mouseup', () => this.setPalette());
	}

	onMouseMove(e) {
		const { width, height } = this.canvas;
		const widthHalf = width * 0.5;
		const heightHalf = height * 0.5;
		const radius = width;

		const x = e.clientX - e.target.offsetLeft;
		const y = e.clientY - e.target.offsetTop;

		this.mouseAngle = Math.atan2(this.heightHalf - y, this.widthHalf - x) * 0.5;

		this.line.from.x = widthHalf + (Math.cos(this.mouseAngle) * radius);
		this.line.from.y = heightHalf + (Math.sin(this.mouseAngle) * radius);
		this.line.to.x = widthHalf + (Math.cos(this.mouseAngle + Math.PI) * radius);
		this.line.to.y = heightHalf + (Math.sin(this.mouseAngle + Math.PI) * radius);
	}

	setPalette() {
		this.palette = Stage.getPalette(this.colors);
	}

	drawLine(from, to, color) {
		this.ctx.strokeStyle =color;

		this.ctx.beginPath();
		this.ctx.moveTo(from.x, from.y);
		this.ctx.lineTo(to.x, to.y);
		this.ctx.stroke();
		this.ctx.closePath();
	}

	drawPoint (point, index) {
		const { from, to } = this.line;
		const wh = this.canvas.width * 0.5;
		const hh = this.canvas.height * 0.5;

		point.a += point.s;
		point.x = wh + (Math.cos(point.a) * point.r);
		point.y = hh + (Math.sin(point.a) * point.r);

		const denominator = Math.hypot(to.x - from.x, to.y - from.y);
		const numerator = ((to.y - from.y) * point.x) - ((to.x - from.x) * point.y) + (to.x * from.y) - (to.y * from.x);
		const distance = numerator / denominator;

		const angle = Math.atan2(to.y - from.y, to.x - from.x) + (Math.PI / 2);

		const toX = point.x + (Math.cos(angle) * distance);
		const toY = point.y + (Math.sin(angle) * distance);

		this.ctx.beginPath();
		this.ctx.fillStyle = this.palette[4 - (index % 2)];
		this.ctx.arc(point.x, point.y, 2, 0, TAU);
		this.ctx.fill();
		this.ctx.closePath();

		this.ctx.save();
		this.ctx.globalAlpha = point.o;
		this.drawLine(point, { x: toX, y: toY }, this.lineColor);
		this.ctx.restore();
	};


	run() {
		this.ctx.fillStyle = this.backgroundColor;
		this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

		this.points.forEach((p, i) => this.drawPoint(p, i));

		requestAnimationFrame(() => this.run());
	}

	static getPalette(colors) {
		return colors[Math.floor(Math.random() * colors.length)];
	}

	static getColors() {
		return fetch('//unpkg.com/nice-color-palettes@2.0.0/100.json')
			.then(res => res.json());
	}

}

const stage = new Stage(canvas, window.innerWidth, 500);

stage.init();
stage.run();
