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

		this.centerX = this.width * 0.5;
		this.centerY = this.height * 0.5;

		this.canvas.width = this.width;
		this.canvas.height = this.height;
	}

	getRandomPosition() {
		return { x: this.width * Math.random(), y: this.height * Math.random() };
	}
}

class Block {
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
		this.rotation = (this.wave * Math.cos(this.percent + phase));
	}

	draw(ctx) {
		const { center, width, height } = this;
		const radius = width * 0.12;
		const scaledWidth = width * 0.75;

		ctx.save();
		ctx.fillStyle = '#b3b6b1';
		ctx.translate(center.x, center.y + radius);
		ctx.rotate(this.rotation);
		ctx.beginPath();
		ctx.rect(-scaledWidth * 0.5, -radius , scaledWidth, height * 0.5);
		ctx.fill();
		ctx.closePath();
		ctx.restore();

		ctx.save();
		ctx.translate(center.x, center.y);
		ctx.beginPath();
		ctx.fillStyle = '#282c2e';
		ctx.arc(0, radius, radius, 0, Math.PI * 2, false);
		ctx.fill();
		ctx.closePath();
		ctx.restore();
	}
}

class Scene {
	constructor(stage, cols, rows) {
		this.phase = 0;

		this.stage = stage;
		this.cols = cols;
		this.rows = rows;

		this.spacing = 10;
		this.padding = 20;

		this.blocks = [];
		this.rafId = null;
	}

	reset() {
		this.stage.clear();

		this.generate();
	}

	generate() {
		this.blocks = [];

		const width = (this.stage.width - this.padding - (this.cols * this.spacing)) / this.cols;
		const height = (this.stage.height - this.padding - (this.rows * this.spacing)) / this.rows;

		const midCol = this.cols * 0.5;
		const midRow = this.rows * 0.5;

		for (let col = 0; col < this.cols; col++) {
			const x = (col * width) + (col + 1) * this.spacing;

			for (let row = 0; row < this.rows; row++) {
				const y = (row * height) + (row + 1) * this.spacing;

				const percentX = 2 - Math.abs((col / midCol) - 1);
				const percentY = (2 - Math.abs((row / midRow) - 1)) * percentX;

				this.blocks.push(new Block({ x, y }, width, height, percentY, percentX));
			}
		}
	}

	draw(block) {
		const { stage: { context } } = this;

		block.update(this.phase);
		block.draw(context);
	}

	run() {
		this.phase += 0.01;

		this.stage.clear();

		this.blocks.forEach(this.draw, this);
		this.rafId = requestAnimationFrame(() => this.run());
	}
}

const stage = new Stage(document.querySelector('.js-canvas'), 600, 600);
const scene = new Scene(stage, 9, 9);

scene.generate();
scene.run();
