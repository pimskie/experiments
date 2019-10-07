import * as Utils from 'https://rawgit.com/pimskie/utils/master/utils.js';

const TAU = Math.PI * 2;

class Stage {
	constructor(canvas, width, height) {
		this.canvas = canvas;
		this.ctx = this.canvas.getContext('2d');

		this.setSize(width, height);
	}

	clear() {
		this.ctx.clearRect(0, 0, this.width, this.height);
	}

	fade() {
		this.ctx.globalCompositeOperation = 'destination-out';
		this.ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
		this.ctx.fillRect(0, 0, this.width, this.height);
		this.ctx.globalCompositeOperation = 'lighter';
	}

	setSize(width, height) {
		this.width = width;
		this.height = height;

		this.centerX = this.width * 0.5;
		this.centerY = this.height * 0.5;

		this.radius = Math.min(this.width, this.height) * 0.5;

		this.canvas.width = this.width;
		this.canvas.height = this.height;

		this.center = { x: this.centerX, y: this.centerY };
	}

	getRandomPosition() {
		return { x: this.width * Math.random(), y: this.height * Math.random() };
	}
}

class Shape {
	constructor(position, width, height, numPoints) {
		this.position = position;
		this.width = width;
		this.height = height;
		this.numPoints = numPoints;
	}

	generate(centerX) {
		this.simplex = new SimplexNoise(Math.random());

		const heightHalf = this.height * 0.5;
		const step = Math.PI / this.numPoints;
		const startA = -Math.PI * 0.5;

		const tick = 0;

		this.points = new Array(this.numPoints).fill().map((_, i) => {
			const pointStep = i * step;
			const px = Math.cos(startA + pointStep) * this.width;
			const py = Math.sin(startA + pointStep) * (this.height - heightHalf);
			const s = 0.001;
			const s2 = 0.01;
			const n = (this.simplex.noise3D(px * s, py * s, tick)) * Math.PI;
			const r = this.simplex.noise3D(px * s2, py * s2, tick) * 50;
			const a = Utils.clamp(n, -Math.PI * 0.1, Math.PI * 0.1);

			const p = {
				px,
				py,
				x: Math.min(this.position.x, px + (Math.cos(a) * r)),
				y: py + (Math.sin(a) * r),
			};

			return p;
		});
	}

	update(tick) {
		this.points.forEach((point) => {
			const { px, py } = point;

			const s = 0.001;
			const s2 = 0.01;
			const n = (this.simplex.noise3D(px * s, py * s, tick)) * Math.PI;
			const r = this.simplex.noise3D(px * s2, py * s2, tick) * 50;
			const a = Utils.clamp(n, -Math.PI * 0.1, Math.PI * 0.1);

			point.x = px + (Math.cos(a) * r);
			point.y = py + (Math.sin(a) * r);
		});
	}

	draw(ctx) {
		ctx.save();
		ctx.translate(this.position.x, this.position.y);
		ctx.beginPath();

		ctx.moveTo(0, this.height / 2);

		this.points.forEach((p, i) => {
			ctx.lineTo(p.x, p.y);
		});

		ctx.lineTo(0, this.height / 2);

		ctx.closePath();
		ctx.stroke();
		ctx.restore();
	}
}

class Scene {
	constructor(stage) {
		this.stage = stage;

		this.speed = 0.01;
		this.phase = 0;

		this.shape = new Shape(
			{ x: this.stage.centerX, y: this.stage.centerY },
			50,
			this.stage.height - 50,
			500,
		);

		this.rafId = null;
	}

	reset() {
		this.stage.clear();
		this.generate();
	}

	generate() {
		this.shape.generate(this.stage.centerX);

		cancelAnimationFrame(this.rafId);
		this.run();
	}

	duplicate() {
		const { stage: { ctx, centerX, centerY, width, height } } = this;

		ctx.save();
		ctx.translate(centerX, centerY);
		ctx.scale(-1, 1);
		// ctx.drawImage(ctx.canvas, -width / 2, -height / 2);
		ctx.restore();
	}

	run() {
		const { stage, stage: { ctx } } = this;

		// stage.clear();

		this.shape.update(this.phase);
		this.shape.draw(ctx);

		this.phase += this.speed;
		this.rafId = requestAnimationFrame(() => this.run());
	}
}

const stage = new Stage(document.querySelector('.js-canvas'), 500, 500);
const scene = new Scene(stage);

scene.generate();

document.body.addEventListener('click', () => {
	scene.reset();
});
