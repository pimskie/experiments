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
		this.ctx.clearRect(0, 0, this.width, this.height);
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

	create(numPoints, width, height) {
		let startX = this.begin.x;
		const y = this.begin.y;

		const pointSpacing = width / (numPoints - 1);

		this.beziers = new Array(numPoints - 1).fill().map((_, i) => {
			const pointX = startX + pointSpacing;
			const pointY = y;

			const cp1x = startX + (pointSpacing * 0.3);
			const cp1y = y + 100;

			const cp2x = startX + (pointSpacing * 0.6);
			const cp2y = y - 100;

			const cp1 = { startX: cp1x, x: cp1x, y: cp1y };
			const cp2 = { startX: cp2x, x: cp2x, y: cp2y };
			const point = { startX: pointX, x: pointX, startY: pointY, y: pointY };

			startX = pointX;

			return [cp1, cp2, point];
		});
	}

	update(phase) {
		const ampX = 100;
		const ampY = 200;
		const a1 = Math.PI;
		const a2 = 0;

		this.begin.y = this.begin.startY - (Math.cos(phase + a1) * ampY * 0.5);

		this.beziers.forEach((bezier, i) => {
			const [cp1, cp2, p] = bezier;

			cp1.x = cp1.startX + (Math.cos(phase + a1) * ampX);
			cp1.y = this.begin.y + (Math.sin(phase + a1) * ampY);

			cp2.x = cp2.startX - (Math.cos(phase + a1) * ampX);
			cp2.y = this.begin.y + (Math.sin(phase + a2) * ampY);

			p.y = p.startY - (Math.cos(phase + a1) * ampY * 0.5);
		});
	}
}

(async () => {
	const palettes = await fetch('//unpkg.com/nice-color-palettes@2.0.0/100.json')
		.then(res => res.json());

	let palette = palettes.map((a) => [Math.random(), a]).sort((a, b) => a[0] - b[0]).map((a) => a[1])[0];

	const stage = new Stage(document.querySelector('.js-arms'), window.innerWidth, window.innerHeight);

	let phase = 0;
	const speed = 0.01;

	const lines = new Array(20).fill().map((_, i) => {
		const index = (i + palette.length) % palette.length;
		const color = palette[index];

		return new Line({ x: 0, y: stage.heightHalf }, 3, stage.width, stage.heightHalf, color);
	});

	const loop = () => {
		const { ctx } = stage;

		stage.clear();

		lines.forEach((line, index) => {
			const { beziers, color } = line;

			ctx.beginPath();
			ctx.strokeStyle = color;
			ctx.moveTo(line.begin.x, line.begin.y);

			beziers.forEach((bezier) => {
				const [cp1, cp2, p] = bezier;

				ctx.bezierCurveTo(cp1.x, cp1.y, cp2.x, cp2.y, p.x, p.y);
			});

			line.update(phase + (index * (2 / lines.length)));

			ctx.stroke();
			ctx.closePath();
		});

		phase += speed;

		requestAnimationFrame(loop);
	};

	loop();

})();
