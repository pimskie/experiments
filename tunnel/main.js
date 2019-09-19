const simplex = new SimplexNoise(Math.random());
const angleBetween = (vec1, vec2) => Math.atan2(vec2.y - vec1.y, vec2.x - vec1.x);
const distanceBetween = (vec1, vec2) => Math.hypot(vec1.x - vec2.x, vec1.y - vec2.y);

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

		this.radius = Math.min(this.width, this.height) * 0.5;
	}

	getRandomPosition() {
		return { x: this.width * Math.random(), y: this.height * Math.random() };
	}
}


class Segment {
	constructor(position, radius, numPoints, scale) {
		this.position = position;
		this.radius = radius;
		this.numPoints = numPoints;
		this.scale = scale;

		this.pointRadius = 8 * this.scale;
	}

	update(radius, scale) {
		this.radius = radius;
		this.scale = scale;

		this.pointRadius = 8 * this.scale;
	}

	draw(ctx) {
		const ai = TAU / this.numPoints;

		for (let i = 0; i < this.numPoints; i++) {
			const x = Math.cos(ai * i) * this.radius;
			const y = Math.sin(ai * i) * this.radius;

			ctx.save();
			ctx.beginPath();
			ctx.translate(this.position.x, this.position.y);
			ctx.arc(x, y, this.pointRadius, 0, TAU, false);
			ctx.fill();
			ctx.closePath();
			ctx.restore();
		}
	}
}

class Tunnel {
	constructor({ center, near, far }) {
		this.center = center;

		this.near = near;
		this.far = far;
		this.distance = this.near - this.far;

		this.numSegments = 10;
		this.segmentPoints = 15;

		this.segments = this.createSegments();
	}

	createSegments() {
		let radiusDecrease = 0.7;
		let segmentRadius = this.near;

		return new Array(this.numSegments).fill().map((_, i) => {
			const sizeScale = Math.max(0.001, segmentRadius / this.near);

			const segment = new Segment(
				{ x: this.center.x, y: this.center.y },
				segmentRadius,
				this.segmentPoints,
				sizeScale
			);

			segmentRadius *= radiusDecrease;

			return segment;
		});
	}

	update(phase) {
		const speed = 1;

		this.segments.forEach((segment) => {
			const segmentSpeed = speed * segment.scale;

			const segmentRadius = segment.radius + segmentSpeed;
			const segmentScale = segmentRadius /  this.near;

			segment.update(segmentRadius, segmentScale);
		});
	}

	draw(ctx) {
		this.segments.forEach(s => s.draw(ctx));
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

		this.automated = true;

		this.setFocusPoint(stage.center);
	}

	reset() {
		this.stage.clear();

		this.generate();
	}

	generate() {
		const { stage: { center, radius } } = this;
		const near = radius;
		const far = 0;

		this.tunnel = new Tunnel({
			center,
			near,
			far,
		});
	}

	setFocusPoint(point) {
		this.focusPoint = {
			x: point.x,
			y: point.y,
		};
	}

	run() {
		const { stage } = this;

		stage.clear();

		this.tunnel.update(this.phase);
		this.tunnel.draw(stage.context);

		this.phase += 0.03;
		this.rafId = requestAnimationFrame(() => this.run());
	}
}

const stage = new Stage(document.querySelector('.js-canvas'), 500, 500);
const scene = new Scene(stage);

const onPointerMove = (e) => {
	const target = (e.touches && e.touches.length) ? e.touches[0] : e;

	scene.setFocusPoint({
		x: target.clientX - e.target.offsetLeft,
		y: target.clientY - e.target.offsetTop,
	});
};

const onPointerOver = () => {
	scene.automated = false;
};

const onPointerLeave = () => {
	scene.automated = true;
};

// stage.canvas.addEventListener('mousemove', onPointerMove);
// stage.canvas.addEventListener('touchmove', onPointerMove);

// stage.canvas.addEventListener('mouseenter', onPointerOver);
// stage.canvas.addEventListener('touchstart', onPointerOver);

// stage.canvas.addEventListener('mouseleave', onPointerLeave);
// stage.canvas.addEventListener('touchend', onPointerLeave);

scene.generate();
scene.run();
