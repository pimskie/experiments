const simplex = new SimplexNoise(Math.random());

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

	drawArc(pos, r = 5, fill = '#000') {
		this.ctx.beginPath();
		this.ctx.fillStyle = fill;
		this.ctx.arc(pos.x, pos.y, r, 0, Math.PI * 2)
		this.ctx.fill();
		this.ctx.closePath();
	}

	clear() {
		this.ctx.fillStyle = 'rgba(255, 255, 255, 1)';
		this.ctx.fillRect(0, 0, this.width, this.height);
	}
}


class Line {
	constructor(begin, numPoints, width, height, color = '#000') {
		this.begin = {
			startX: begin.x,
			startY: begin.y,
			x: begin.x,
			y: begin.y,
		};

		this.numPoints = numPoints;
		this.color = color;

		this.beziers = [];

		this.create(numPoints, width, height);
	}

	get end() {
		return this.beziers[this.beziers.length - 1][2];
	}

	create(numPoints, width, height) {
		const pointSpacing = width / 2;

		const x = this.begin.x + (pointSpacing - 50 + (Math.random() * 100));
		const y = height;

		const cp = {
			x: x,
			y: y,
			startX: x,
			startY: y,
		};

		const p = {
			x: width,
			y: this.begin.y,
			startX: width,
			startY: this.begin.y,
		};

		this.beziers = [[cp, p]];
	}

	update(phase) {
		this.updatePoint(this.begin, phase);

		this.beziers.forEach((bezier, i) => {
			const [cp, p] = bezier;

			this.updatePoint(cp, phase + 1, 100, 400);
			this.updatePoint(p, phase, 20);
		});
	}

	updatePoint(point, phase, rx = 100, ry = 100) {
		const s = 0.00005;

		const n = simplex.noise3D(point.x * s, point.y * s, phase);
		const a = n * Math.PI * 2;

		point.x = Math.cos(a) * rx;
		point.y = Math.sin(a) * ry;

		point.x += point.startX;
		point.y += point.startY;
	}
}

(async () => {
	const stage = new Stage(document.querySelector('.js-arms'), window.innerWidth, window.innerHeight);

	let phase = 0;
	const speed = 0.0005;

	const lines = new Array(600).fill().map(() => new Line({ x: 100, y: stage.heightHalf }, 3, stage.width - 100, stage.heightHalf));

	const loop = () => {
		const { ctx } = stage;

		stage.clear();

		lines.forEach((line, index) => {
			const { beziers, color } = line;

			ctx.beginPath();
			ctx.strokeStyle = color;
			ctx.moveTo(line.begin.x, line.begin.y);

			beziers.forEach((bezier) => {
				const [cp1, p] = bezier;

				ctx.quadraticCurveTo(cp1.x, cp1.y, p.x, p.y);
			});

			line.update(phase + index * (1 / lines.length));

			ctx.stroke();
			ctx.closePath();

			// stage.drawArc(beziers[0][0]);

		});

		phase += speed;

		requestAnimationFrame(loop);
	};

	loop();

})();
