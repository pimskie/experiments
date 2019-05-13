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
	constructor({ midX, midY, angle = 0, phaseOffset = 0, phaseGlobal = 0, hue = 230 } = {}) {
		this.midX = midX;
		this.midY = midY;

		this.angle = angle;

		this.phase = phaseGlobal + phaseOffset;
		this.phaseOffset = phaseOffset;
		this.hue = hue;

		this.from = { x: 0, y: 0 };
		this.to = { x: 0, y: 0 };

		this.settings = {
			radius: midX,
			length: midX * 2,
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

const TAU = Math.PI * 2;
const stage = new Stage('canvas', 500, 500);

const settings = {
	numLines: 50,
	phase: 0,
	lineAngleChange: 0,
	lineAngleStep: 0,
	linePhaseOffset: 0,
	drawFocalPoints: true,
};

let lines = [];

const generate = () => {
	const { phase, numLines, linePhaseOffset, lineAngleStep } = settings;
	const hueMin = 300;
	const hueMax = 350;
	const hueStep = (hueMax - hueMin) / numLines;

	lines = new Array(numLines)
		.fill()
		.map((_, i) => new Line({
			midX: stage.widthHalf,
			midY: stage.heightHalf,
			angle: lineAngleStep * i,
			phaseGlobal: phase,
			phaseOffset: linePhaseOffset * i,
			hue: hueMin + (hueStep * i),
		}));
};

const clear = () => {
	stage.clear();
};

const animate = () => {
	clear();

	const { phase, lineAngleChange, drawFocalPoints } = settings;

	lines.forEach((line) => {
		line.update(phase, lineAngleChange);
		line.draw(stage.ctx, drawFocalPoints);
	});
};

const draw = () => {
	generate();
	animate();
};

const loop = () => {
	// draw();

	requestAnimationFrame(loop);
};

const animSpeed = 1000;

const timeline = anime.timeline({
	targets: settings,
	easing: 'linear',

	update: () => {
		generate();
		animate();
	},
});

timeline.add({
	lineAngleStep: () => TAU / settings.numLines,
	phase: 0.25,
	duration: animSpeed,
});

timeline.add({
	phase: 0.5,
	lineAngleChange: Math.PI,
	duration: animSpeed,
});

timeline.add({
	linePhaseOffset: Math.PI / (settings.numLines * 5),
	phase: Math.PI / 2,
	duration: animSpeed * 2,
});

timeline.add({
	linePhaseOffset: 0,
	lineAngleChange: Math.PI * 0.25,
	phase: {
		value: '*= 1.5',
	},
	duration: animSpeed * 2,
});


// timeline.add({
// 	numLines: {
// 		value: '*= 2',
// 		round: 1,
// 	},
// 	lineAngleStep: () => Math.PI / settings.numLines,

// 	duration: animSpeed,
// });

// timeline.add({
// 	phase: {
// 		value: '*= 0.25',
// 	},
// 	duration: animSpeed,
// });
