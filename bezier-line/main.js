const simplex = new SimplexNoise('seed');

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

	get end() {
		return this.beziers[this.beziers.length - 1][2];
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

			const cp1 = { startX: cp1x, x: cp1x, startY: cp1y, y: cp1y };
			const cp2 = { startX: cp2x, x: cp2x, startY: cp2y, y: cp2y };
			const point = { startX: pointX, x: pointX, startY: pointY, y: pointY };

			startX = pointX;

			return [cp1, cp2, point];
		});
	}

	getNoiseValue(p, phase) {
		const noiseScale = 0.01;

		return simplex.noise3D(p.x * noiseScale, p.y * noiseScale, phase);
	}

	update(phase) {
		const beginNoise = this.getNoiseValue(this.begin, phase);
		const endNoise = this.getNoiseValue(this.end, phase);

		// const beginAngle = beginNoise;
		// const endAngle = endNoise;

		// this.begin.x += Math.cos(beginAngle);
		// this.begin.y += Math.sin(beginAngle);

		// this.end.x += Math.cos(endAngle);
		// this.end.y += Math.sin(endAngle);

		this.beziers.forEach((bezier, i) => {
			const [cp1, cp2] = bezier;

			const noise1 = this.getNoiseValue(cp1, phase);
			const noise2 = this.getNoiseValue(cp2, phase);

			cp1.x += Math.cos(noise1);
			cp1.y += Math.sin(noise1);

			cp2.x += Math.cos(noise2);
			cp2.y += Math.sin(noise2);
		});
	}
}

(async () => {
	const palettes = await fetch('//unpkg.com/nice-color-palettes@2.0.0/100.json')
		.then(res => res.json());

	let palette = palettes.map((a) => [Math.random(), a]).sort((a, b) => a[0] - b[0]).map((a) => a[1])[0];

	const stage = new Stage(document.querySelector('.js-arms'), window.innerWidth, window.innerHeight);

	let phase = 0;
	const speed = 0.001;

	const lines = new Array(4).fill().map((_, i) => {
		const index = (i + palette.length) % palette.length;
		const color = palette[index];

		return new Line({ x: 0, y: stage.heightHalf }, 2, stage.width, stage.heightHalf, color);
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
