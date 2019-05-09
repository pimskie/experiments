class Stage {
	constructor(canvasSelector, width, height) {
		this.canvas = document.querySelector(canvasSelector);
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

	clear() {
		this.ctx.clearRect(0, 0, this.width, this.height);
	}
}

class Line {
	constructor(stageWidth, stageHeight, angle = 0, phase = 0) {
		this.stageHalfWidth = stageWidth * 0.5;
		this.stageHalfHeight = stageHeight * 0.5;

		this.angle = angle;
		this.phase = phase;

		this.from = { x: 0, y: 0 };
		this.to = { x: 0, y: 0 };

		this.settings = {
			angleChange: 1,
			radius: this.stageHalfWidth,
			length: stageWidth,
		};

		this.update();
	}

	update(increment = 0) {
		this.phase += increment;

		const halfPi = Math.PI * 0.5;
		const { length, radius } = this.settings;

		const lineRadius = Math.cos(this.phase) * radius;

		this.focalX = this.stageHalfWidth + (Math.cos(this.angle) * lineRadius);
		this.focalY = this.stageHalfWidth + (Math.sin(this.angle) * lineRadius);

		this.from.x = this.focalX + (Math.cos(this.angle + halfPi) * length);
		this.from.y = this.focalY + (Math.sin(this.angle + halfPi) * length);

		this.to.x = this.focalX + (Math.cos(this.angle - halfPi) * length);
		this.to.y = this.focalY + (Math.sin(this.angle - halfPi) * length);
	}

	draw(ctx) {
		ctx.strokeStyle = '#616161';

		ctx.beginPath();
		ctx.moveTo(this.from.x, this.from.y);
		ctx.lineTo(this.to.x, this.to.y);
		ctx.stroke();
		ctx.closePath();

		ctx.beginPath();
		ctx.arc(this.focalX, this.focalY, 3, 0, Math.PI * 2);
		ctx.fill();
		ctx.closePath();
	}
}

const stage = new Stage('canvas', 500, 500);

const numLines = 4;
const angleStep = (Math.PI * 2) / numLines;
const phaseStep = 0.5 / numLines;

const lines = new Array(numLines).fill().map((_, i) => new Line(stage.width, stage.height, angleStep * i, 0 ));

let phase = 0;
const speed = 0.01;

const clear = () => {
	stage.clear();
};

const reset = () => {
	clear();
};

const draw = () => {
	clear();
};

const animate = () => {
	clear();

	lines.forEach((line) => {
		line.update(speed);
		line.draw(stage.ctx);
	});

	requestAnimationFrame(animate);
};

reset();
animate();
