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
		return '#011627'; // this.palette[0];
	}

	get lineColor() {
		return '#FDFFFC'; // this.palette[4];
	}

	get pointColor1() {
		return '#41EAD4'; // this.palette[3];
	}

	get pointColor2() {
		return '#F71735';
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

		this.points = new Array(100).fill().map((_, i) => {
			const r = (this.heightHalf * 0.5) + Math.random() * (this.heightHalf / 2);
			const p = r / this.heightHalf;
			const o = p;
			const c = i % 2 === 0 ? this.pointColor1 : this.pointColor2;

			const point = {
				r,
				o,
				a: Math.random() * TAU,
				s: 0.0005 + (Math.random() * 0.0008),
				c,
			};

			return point;
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

		this.mouseAngle = Math.atan2(this.heightHalf - y, this.widthHalf - x);

		this.line.from.x = widthHalf + (Math.cos(this.mouseAngle) * radius);
		this.line.from.y = heightHalf + (Math.sin(this.mouseAngle) * radius);
		this.line.to.x = widthHalf + (Math.cos(this.mouseAngle + Math.PI) * radius);
		this.line.to.y = heightHalf + (Math.sin(this.mouseAngle + Math.PI) * radius);
	}

	setPalette() {
		this.palette = Stage.getPalette(this.colors);
	}

	drawLine(from, to, color, width = 1) {
		this.ctx.strokeStyle =color;

		this.ctx.beginPath();
		this.ctx.lineWidth = width;
		this.ctx.moveTo(from.x, from.y);
		this.ctx.lineTo(to.x, to.y);
		this.ctx.stroke();
		this.ctx.closePath();
	}

	drawPoint (point) {
		const { from, to } = this.line;
		const wh = this.canvas.width * 0.5;
		const hh = this.canvas.height * 0.5;

		point.a += point.s;
		point.x = wh + (Math.cos(point.a) * point.r);
		point.y = hh + (Math.sin(point.a) * point.r);

		const denominator = Math.hypot(to.x - from.x, to.y - from.y);
		const numerator = ((to.y - from.y) * point.x) - ((to.x - from.x) * point.y) + (to.x * from.y) - (to.y * from.x);
		const distance = numerator / denominator;

		const pointAngle = Math.atan2(to.y - from.y, to.x - from.x) + (Math.PI / 2);
		const pointRadius = 0.5 + Math.abs(distance / this.heightHalf) * 3;
		const lineWidth = 0.5 + (Math.abs(distance / this.heightHalf) - 0.5);

		const toX = point.x + (Math.cos(pointAngle) * distance);
		const toY = point.y + (Math.sin(pointAngle) * distance);

		this.ctx.beginPath();
		this.ctx.fillStyle = point.c;
		this.ctx.arc(point.x, point.y, pointRadius, 0, TAU);
		this.ctx.fill();
		this.ctx.closePath();

		this.ctx.save();
		this.ctx.globalAlpha = point.o;
		this.drawLine(point, { x: toX, y: toY }, this.lineColor, lineWidth);
		this.ctx.restore();
	};


	run() {
		this.ctx.globalCompositeOperation = 'source-over';
		this.ctx.fillStyle = this.backgroundColor;
		this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

		this.points.forEach((p, i) => this.drawPoint(p, i));

		const rectWidth = this.heightHalf;

		this.ctx.save();
		this.ctx.translate(this.widthHalf, this.heightHalf);
		this.ctx.rotate(this.mouseAngle + (Math.PI / 4));
		this.ctx.globalCompositeOperation = 'difference';
		this.ctx.fillStyle = '#fff';
		this.ctx.fillRect(-rectWidth / 2, -rectWidth / 2, rectWidth, rectWidth);
		this.ctx.restore();

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

const stage = new Stage(canvas, window.innerWidth, window.innerHeight);

stage.init();
stage.run();
