
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

		// this.ctx.fillStyle = 'rgba(255, 255, 255, 0.01)';
		// this.ctx.fillRect(0, 0, width, height);

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
const stage = new Stage({ selector: '.js-canvas' });

const numElements = 4;
const { height } = stage;
const half = height * 0.5;

const elements = new Array(numElements).fill().map((b, i) => {
	const percent = ((i + 1) / numElements);

	return {
		points: [
			[10, half - (Math.random() * 300)],
			[100, half],
			[10, half + (Math.random() * 300)],
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

const draw = (element, index, phase) => {
	const { ctx, height } = stage;
	const mid = height * 0.5;
	const scale = 0.001;
	const elementPhase = phase + index;

	const { percent, points: [from, cp, to] } = element;

	from[0] += Math.abs(simplex.noise3D(elementPhase, elementPhase, elementPhase) * 5);
	from[1] += simplex.noise3D(elementPhase, elementPhase, elementPhase) * 5;

	to[0] += Math.abs(simplex.noise3D(elementPhase + 0.2, elementPhase + 0.2, elementPhase) * 5);
	to[1] = mid + (mid * Math.sin(elementPhase + 0.2, elementPhase + 0.2, elementPhase))

	cp[0] += Math.abs(simplex.noise3D(elementPhase + 0.4, elementPhase + 0.4, elementPhase) * 2);
	cp[1] += simplex.noise2D(elementPhase + 0.4, elementPhase + 0.4, elementPhase);

	// from[0] += Math.abs(simplex.noise3D(from[0] * scale, from[1] * scale, phase) * 5);
	// from[1] += simplex.noise3D(from[1] * scale, from[1] * scale, phase) * 5;

	// to[0] += Math.abs(simplex.noise3D(to[0] * scale, to[1] * scale, phase) * 5);
	// to[1] = mid + (mid * Math.sin(phase + index + 1))

	// cp[0] += Math.abs(simplex.noise3D(cp[0] * scale, cp[1] * scale, phase) * 2);
	// cp[1] += simplex.noise2D(cp[0] * scale, cp[1] * scale);

	ctx.beginPath();
	ctx.strokeStyle = `hsla(${percent * 100}, 100%, 50%, 0.1)`;
	ctx.moveTo(...from);
	ctx.quadraticCurveTo(...cp, ...to);
	ctx.stroke();
	ctx.closePath();

	// drawAnchor(cp);
};

const update = () => {
	elements.forEach((element, index) => draw(element, index, phase));

	phase += 0.01;
};



stage.run(update);
