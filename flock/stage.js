import Vector from '//rawgit.com/pimskie/vector/master/vector.js';

class Stage {
	constructor(canvas, width, height) {
		this.canvas = canvas;
		this.context = this.canvas.getContext('2d');

		this.setSize(width, height);
	}

	clear() {
		// this.context.clearRect(0, 0, this.width, this.height);

		this.context.globalCompositeOperation = 'destination-out';
		this.context.fillStyle = 'rgba(0, 0, 0, 0.02)';
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

		this.center = new Vector(this.centerX, this.centerY);
	}

	getRandomPosition() {
		return new Vector(this.width * Math.random(), this.height * Math.random());
	}
}

export default Stage;
