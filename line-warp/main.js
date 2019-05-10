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
	constructor(stageWidth, stageHeight, angle = 0, phase = 0, hue = 230) {
		this.stageHalfWidth = stageWidth * 0.5;
		this.stageHalfHeight = stageHeight * 0.5;

		this.angle = angle;
		this.phase = phase;
		this.hue = hue;

		this.from = { x: 0, y: 0 };
		this.to = { x: 0, y: 0 };

		this.settings = {
			angleChange: 0,
			radius: this.stageHalfWidth,
			length: stageWidth,
		};

		this.update();
	}

	update(increment = 0) {
		this.phase += increment;

		const halfPi = Math.PI * 0.5;
		const { length, radius, angleChange } = this.settings;

		const amplitude = Math.sin(this.phase) * radius;
		const angleModifier = Math.sin(this.phase) * angleChange;

		this.focalX = this.stageHalfWidth + (Math.cos(this.angle) * amplitude);
		this.focalY = this.stageHalfWidth + (Math.sin(this.angle) * amplitude);

		this.from.x = this.focalX + (Math.cos(this.angle + halfPi + angleModifier) * length);
		this.from.y = this.focalY + (Math.sin(this.angle + halfPi + angleModifier) * length);

		this.to.x = this.focalX + (Math.cos(this.angle - halfPi + angleModifier) * length);
		this.to.y = this.focalY + (Math.sin(this.angle - halfPi + angleModifier) * length);
	}

	draw(ctx, drawFocalPoint = false) {
		ctx.strokeStyle = `hsla(${this.hue}, 100%, 80%, 0.75)`;

		ctx.beginPath();
		ctx.moveTo(this.from.x, this.from.y);
		ctx.lineTo(this.to.x, this.to.y);
		ctx.stroke();
		ctx.closePath();

		if (drawFocalPoint) {
			ctx.beginPath();
			ctx.fillStyle = `hsl(${this.hue}, 100%, 50%)`;
			ctx.arc(this.focalX, this.focalY, 2, 0, Math.PI * 2);
			ctx.fill();
			ctx.closePath();
		}
	}
}

const stage = new Stage('canvas', 500, 500);

const settings = {
	numLines: 10,
	timeOffset: 0.05,
	rotations: 1,
	drawFocalPoints: true,
};

let lines = [];
let phase = 0;
const speed = 0.01;

const generate = () => {
	const { numLines, rotations, timeOffset: phaseStep } = settings;

	const angleStep = (Math.PI * rotations) / numLines;

	const hueMin = 300;
	const hueMax = 350;
	const hueStep = (hueMax - hueMin) / numLines;

	lines = new Array(numLines)
		.fill()
		.map((_, i) => new Line(stage.width, stage.height, angleStep * i, phase + (phaseStep * i), hueMin + (hueStep * i)));

};

const clear = () => {
	stage.clear();
};

const reset = () => {
	clear();
	generate();
};

const draw = () => {
	clear();
};

const animate = () => {
	clear();

	lines.forEach((line) => {
		// line.update(speed);
		line.draw(stage.ctx, settings.drawFocalPoints);
	});

	requestAnimationFrame(animate);
};

const gui = new dat.GUI();
gui.add(settings, 'numLines').min(10).max(400).step(1).onChange(reset);
gui.add(settings, 'timeOffset').min(0).max(0.2).onChange(reset);
gui.add(settings, 'rotations').min(0).max(4).step(0.25).onChange(reset);
gui.add(settings, 'drawFocalPoints');


reset();
animate();
