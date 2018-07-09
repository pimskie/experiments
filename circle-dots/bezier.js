
class Stage {
	constructor({ selector, width, height, fullscreen = true } = {}) {
		const canvas = document.querySelector(selector);

		this.ctx = canvas.getContext('2d');
		this.rafId = null;
		this.loop = this.loop.bind(this);

		this.setup(width, height, fullscreen);
	}

	get canvas() {
		return this.ctx.canvas;
	}

	get width() {
		return this.canvas.width;
	}

	set width(w) {
		this.canvas.width = w;
	}

	get height() {
		return this.canvas.height;
	}

	set height(h) {
		this.canvas.height = h;
	}

	setup(width, height, fullscreen) {
		const { canvas } = this.ctx;

		if (fullscreen) {
			width = window.innerWidth;
			height = window.innerHeight;
		}

		this.width = width;
		this.height = height;
	}

	run(cb) {
		this.loop(cb);

		return this;
	}

	clear() {
		const { canvas: { width, height } } = this.ctx;

		this.ctx.clearRect(0, 0, width, height);
	}

	stop() {
		cancelAnimationFrame(this.rafId);
	}

	loop(cb = () => { }) {
		this.clear();

		cb();

		this.rafId = requestAnimationFrame(() => this.loop(cb));
	}
}

const simplex = new SimplexNoise('seed');
noise.seed(1);

const stage = new Stage({ selector: '.js-canvas' });

const numBeziers = 20;
const beziers = new Array(numBeziers).fill().map((b, i) => {
	const percent = ((i + 1) / numBeziers);

	return {
		points: [
			[0, stage.height * 0.5],
			[stage.width * 0.25, stage.height * Math.random()],
			[stage.width * 0.75, stage.height * Math.random()],
			[stage.width, stage.height * 0.5]
		],
		percent,
	};
});

let phase = 0;

const drawAnchor = (cp) => {
	const [x, y] = cp;
	const { ctx } = stage;

	ctx.beginPath();
	ctx.rect(x, y, 10, 10);
	ctx.fill();
	ctx.closePath();
};

const drawBezier = (bezier, index, phase) => {
	const { ctx, height } = stage;
	const { percent, points } = bezier;
	const [, cp1, cp2] = points;

	const scale = 0.0005;
	const mid = height * 0.5;

	const noise1 = Math.cos((cp1[1] * scale) + phase + index);
	const noise2 = Math.cos(phase + index + 1 + Math.PI);

	cp1[1] = mid + (mid * noise1);
	cp2[1] = mid + (mid * noise2);

	ctx.beginPath();
	ctx.strokeStyle = `hsla(100, 100%, 0%, ${percent})`;
	ctx.moveTo(...points[0]);
	ctx.bezierCurveTo(...[].concat(...points.slice(1)));

	ctx.stroke();
	ctx.closePath();

	// drawAnchor(cp1);
	// drawAnchor(cp2);
};

const update = () => {
	beziers.forEach((bezier, index) => drawBezier(bezier, index, phase));

	phase += 0.01;
};



stage.run(update);
