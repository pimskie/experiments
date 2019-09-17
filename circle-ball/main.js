const TAU = Math.PI * 2;

class Stage {
	constructor(canvas, width, height) {
		this.canvas = canvas;
		this.context = this.canvas.getContext('2d');

		this.setSize(width, height);
	}

	clear() {
		this.context.clearRect(0, 0, this.width, this.height);
	}

	setSize(width, height) {
		this.width = width;
		this.height = height;

		this.center = {
			x: this.width * 0.5,
			y: this.height * 0.5,
		};

		this.canvas.width = this.width;
		this.canvas.height = this.height;
	}

	getRandomPosition() {
		return { x: this.width * Math.random(), y: this.height * Math.random() };
	}
}

class Element {
	constructor(position, width, height, wave, percent) {
		this.position = position;
		this.percent = percent;

		this.width = width;
		this.height = height;

		this.wave = wave;

		this.center = {
			x: this.position.x + (this.width * 0.5),
			y: this.position.y + (this.height * 0.5),
		};
	}

	update(phase) {

	}

	draw(ctx) {

	}
}

class Scene {
	constructor(stage) {
		this.phase = 0;

		this.stage = stage;

		this.padding = 50;
		this.radius = (stage.width - (this.padding * 2)) * 0.5;

		this.elements = [];
		this.rafId = null;
	}

	reset() {
		this.stage.clear();

		this.generate();
	}

	generate() {

	}

	draw() {
		const { stage: { context, center } } = this;
		const numCircles = 10;
		const radiusStep = this.radius / numCircles;

		for (let i = 0; i < numCircles; i++) {
			this.drawCircle(context, center, radiusStep * i)
		}
	}

	drawCircle(ctx, center, radius) {
		const numParticles = radius / 5;
		console.log(1 - (radius / this.radius));

		const size = 1 + ((1 - (radius / this.radius)) * 10);
		this.drawParticles(ctx, center, radius, numParticles, size);
	}

	drawParticles(ctx, center, radius, numParticles, size) {
		const angleStep = TAU / numParticles;

		for (let i = 0; i < numParticles; i++) {
			const x = center.x + (Math.cos(angleStep * i) * radius);
			const y = center.y + (Math.sin(angleStep * i) * radius);

			ctx.save();
			ctx.translate(x, y);
			ctx.beginPath();
			ctx.arc(0, 0, size, 0, TAU, false);
			ctx.fill();
			ctx.closePath();
			ctx.restore();
		}
	}


	run() {
		this.phase += 0.01;

		this.stage.clear();

		this.draw(stage.context);
		// this.rafId = requestAnimationFrame(() => this.run());
	}
}

const stage = new Stage(document.querySelector('.js-canvas'), 500, 500);
const scene = new Scene(stage);

scene.generate();
scene.run();
