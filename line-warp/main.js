import anime from '//unpkg.com/animejs@3.0.1/lib/anime.es.js';

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
	constructor({ midX, midY, angle = 0, phaseOffset = 0, phaseGlobal = 0 } = {}) {
		this.midX = midX;
		this.midY = midY;

		this.angle = angle;

		this.phase = phaseGlobal + phaseOffset;
		this.phaseOffset = phaseOffset;

		this.from = { x: 0, y: 0 };
		this.to = { x: 0, y: 0 };

		this.settings = {
			radius: midX,
			length: midX,
		};

		this.update(phaseGlobal);
	}

	update(phaseGlobal = 0, angleChange = 0) {
		this.phase = phaseGlobal + this.phaseOffset;

		const halfPi = Math.PI * 0.5;
		const { length, radius } = this.settings;

		const amplitude = Math.sin(this.phase) * radius;
		const angleModifier = Math.sin(this.phase) * angleChange;

		this.focalX = this.midX + (Math.cos(this.angle) * amplitude);
		this.focalY = this.midX + (Math.sin(this.angle) * amplitude);

		this.from.x = this.focalX + (Math.cos(this.angle + halfPi + angleModifier) * length);
		this.from.y = this.focalY + (Math.sin(this.angle + halfPi + angleModifier) * length);

		this.to.x = this.focalX + (Math.cos(this.angle - halfPi + angleModifier) * length);
		this.to.y = this.focalY + (Math.sin(this.angle - halfPi + angleModifier) * length);
	}

	draw(ctx, drawFocalPoint = false, hue = 300) {
		const color = `hsla(320, 100%, 60%, 0.5)`;

		ctx.strokeStyle = color;
		ctx.beginPath();
		ctx.moveTo(this.from.x, this.from.y);
		ctx.lineTo(this.to.x, this.to.y);
		ctx.stroke();
		ctx.closePath();

		if (drawFocalPoint) {
			this.drawAnchor(ctx, { x: this.focalX, y: this.focalY }, color);
		}
	}

	drawAnchor(ctx, position, color, radius = 2) {
		ctx.beginPath();
		ctx.fillStyle = color;
		ctx.arc(position.x, position.y, radius, 0, Math.PI * 2);
		ctx.fill();
		ctx.closePath();
	}
}

const TAU = Math.PI * 2;
const stage = new Stage('canvas', 500, 500);

const settings = {
	minHue: 300,
	maxHue: 360,
	numLines: 2,
	phase: 0,
	lineAngleChange: 0,
	lineAngleStep: 0,
	linePhaseOffset: 0,
	drawFocalPoints: true,
};

let lines = [];

const generate = () => {
	const { phase, numLines, linePhaseOffset, lineAngleStep } = settings;
	lines = new Array(numLines)
		.fill()
		.map((_, i) => new Line({
			midX: stage.widthHalf,
			midY: stage.heightHalf,
			angle: lineAngleStep * i,
			phaseGlobal: phase,
			phaseOffset: linePhaseOffset * i,
		}));
};

const clear = () => {
	stage.clear();
};

const animate = () => {
	clear();

	const { minHue, maxHue, phase, lineAngleChange, drawFocalPoints } = settings;

	lines.forEach((line) => {
		line.update(phase, lineAngleChange);

		const distance = Math.hypot(stage.widthHalf - line.focalX, stage.heightHalf - line.focalY);
		const percent = distance / Math.hypot(stage.widthHalf, stage.heightHalf);
		const hue = minHue + ((maxHue - minHue) * percent);

		line.draw(stage.ctx, drawFocalPoints, hue);
	});
};

const animSpeed = 4000;

const timeline = anime.timeline({
	targets: settings,
	duration: animSpeed,
	easing: 'linear',
	direction: 'alternate',
	loop: true,

	loopBegin: () => {
		// settings.phase = 0;
	},

	update: () => {
		settings.phase += 0.005;
		generate();
		animate();
	},
});

timeline.add({
	numLines: {
		value: 200,
		round: 1,
	},

	lineAngleStep: () => TAU / 200,
});

timeline.add({
	lineAngleChange: Math.PI * 0.5,
});


timeline.add({
	linePhaseOffset: 0.003,
});

timeline.add({
	linePhaseOffset: 0,

	lineAngleChange: {
		value: '*= 2',
	},
});
