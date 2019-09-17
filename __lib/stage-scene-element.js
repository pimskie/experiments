class Stage {
	constructor(canvas, width, height) {
		this.canvas = canvas;
		this.context = this.canvas.getContext('2d');

		this.setSize(width, height);
	}

	clear() {
		this.context.clearRect(0, 0, this.width, this.height);
	}

	fade() {
		this.context.globalCompositeOperation = 'destination-out';
		this.context.fillStyle = 'rgba(0, 0, 0, 0.05)';
		this.context.fillRect(0, 0, this.width, this.height);
		this.context.globalCompositeOperation = 'lighter';
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

class Block {
	constructor(position, index) {
		const { x, y } = position;

		this.position = { x, y };
		this.index = index;
	}

	update() {

	}
}

class Scene {
	constructor(stage, numBlocks) {
		this.stage = stage;
		this.numBlocks = numBlocks;
		this.segmentSpacing = this.stage.height / this.numBlocks;

		this.blocks = [];
		this.rafId = null;
	}

	reset() {
		this.stage.clear();
		this.generate();
	}

	generate() {
		const { stage: { centerY } } = this;


	}


	run() {
		this.rafId = requestAnimationFrame(() => this.run());
	}
}

const stage = new Stage(document.querySelector('.js-canvas'), window.innerWidth, window.innerHeight);
const scene = new Scene(stage, 100);
scene.generate();
scene.run();

window.addEventListener('resize', () => {
	stage.setSize(window.innerWidth, window.innerHeight);
	scene.reset();
});

document.body.addEventListener('click', () => {
	scene.reset();
});
