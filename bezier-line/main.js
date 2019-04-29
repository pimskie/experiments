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
	constructor(begin, numPoints, width, height) {
		this.begin = begin;
		this.numPoints = numPoints;

		this.beziers = [];

		this.create(numPoints, width, height);
	}

	create(numPoints, width, height) {
		let begin = {
			x: this.begin.x,
			y: this.begin.y,
		};

		const pointSpacing = width / (numPoints - 1);

		this.beziers = new Array(numPoints - 1).fill().map((_, i) => {
			const x = pointSpacing * (i + 1);
			const y = height;

			const end = { x, y };

			const cp1x = (begin.x + end.x) * 0.5;
			const cp2x = (begin.x + end.x) * 0.5;

			const cp1 = { x: cp1x, y: height - 100 };
			const cp2 = { x: cp2x, y: height + 100 };

			begin.x = end.x;
			begin.y = end.y;

			return [cp1, cp2, end];
		});
	}

	update() {

	}
}

(async () => {
	const palettes = await fetch('//unpkg.com/nice-color-palettes@2.0.0/100.json')
		.then(res => res.json());

	const stage = new Stage(document.querySelector('.js-arms'), window.innerWidth, window.innerHeight);

	let palette = [];
	let phase = 0;
	const speed = 0.01;

	const reset = () => {
		stage.clear();

		palette = palettes.map((a) => [Math.random(), a]).sort((a, b) => a[0] - b[0]).map((a) => a[1])[0];
	};

	const line = new Line({ x: 0, y: stage.heightHalf }, 3, stage.width, stage.heightHalf);

	const loop = () => {
		const { ctx } = stage;

		stage.clear();

		ctx.beginPath();
		ctx.moveTo(line.begin.x, line.begin.y);

		line.beziers.forEach((bezier) => {
			const [cp1, cp2, p] = bezier;

			ctx.bezierCurveTo(cp1.x, cp1.y, cp2.x, cp2.y, p.x, p.y);
		});

		ctx.stroke();
		ctx.closePath();


		line.beziers.forEach((bezier) => {
			const [cp1, cp2, p] = bezier;

		stage.drawArc(cp1, 3, 'red');
		stage.drawArc(cp2, 3, 'green');

			stage.drawArc(p, 4);
		});

		stage.drawArc(line.begin, 3, 'red');

		phase += speed;

		// requestAnimationFrame(loop);
	};

	reset();
	loop();

})();
