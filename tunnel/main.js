const simplex = new SimplexNoise(Math.random());
const angleBetween = (vec1, vec2) => Math.atan2(vec2.y - vec1.y, vec2.x - vec1.x);
const distanceBetween = (vec1, vec2) => Math.hypot(vec1.x - vec2.x, vec1.y - vec2.y);
const wrapArrayIndex = (index, array) => (index + 1 + array.length) % array.length;

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

		this.radius = Math.max(this.width, this.height) * 0.5;
	}

	getRandomPosition() {
		return { x: this.width * Math.random(), y: this.height * Math.random() };
	}
}


class Segment {
	constructor(position, radius, numPoints) {
		this.position = position;
		this.radius = radius;
		this.numPoints = numPoints;
		this.angleStep = TAU / this.numPoints;

		this.points = new Array(this.numPoints).fill().map((_, i) => {
			const x = this.position.x + (Math.cos(this.angleStep * i) * this.radius);
			const y = this.position.y + (Math.sin(this.angleStep * i) * this.radius);

			return { x, y };
		});

	}

	update(radius, scale) {
		this.radius = radius;
		this.scale = scale;

		this.pointRadius = 8 * this.scale;

		this.points.forEach((p, i) => {
			p.x = this.position.x + (Math.cos(this.angleStep * i) * this.radius)
			p.y = this.position.y + (Math.sin(this.angleStep * i) * this.radius)
		});
	}

	connect(segment, ctx) {
		const alpha = this.scale;
		const color = `rgba(0, 0, 0, ${alpha})`;

		const { points: pointsSelf } = this;
		const { points: pointsOther } = segment;

		for (let index = 0; index < this.points.length; index++) {
			const point1 = pointsSelf[index];
			const indexNext = wrapArrayIndex(index, pointsSelf);

			const point2 = pointsSelf[indexNext];
			const point3 = pointsOther[indexNext];
			const point4 = pointsOther[index];

			ctx.beginPath();
			ctx.fillStyle = color;
			ctx.strokeStyle = color;
			ctx.moveTo(point1.x, point1.y);
			ctx.lineTo(point2.x, point2.y);
			ctx.lineTo(point3.x, point3.y);
			ctx.lineTo(point4.x, point4.y);
			// ctx.stroke();
			ctx.fill();
			ctx.closePath();
		}
	}

	draw(ctx) {
		this.points.forEach((point) => {
			const { x, y } = point;

			ctx.beginPath();
			ctx.fillStyle = `rgba(0, 0, 0, ${this.scale})`;
			ctx.arc(x, y, this.pointRadius, 0, TAU, false);
			ctx.fill();
			ctx.closePath();
		});
	}
}

class Tunnel {
	constructor({ center, near, far }) {
		this.center = center;

		this.near = near;
		this.far = far;

		this.distance = this.near - this.far;

		this.numSegments = 10;
		this.segmentPoints = 25;
		this.radiusDecrease = 0.8;

		this.segments = this.createSegments();
	}

	createSegments() {
		return new Array(this.numSegments).fill().map((_, i) => {
			const segmentRadius = this.near * Math.pow(this.radiusDecrease, i);

			const segment = new Segment(
				{ x: this.center.x, y: this.center.y },
				segmentRadius,
				this.segmentPoints,
			);

			return segment;
		});
	}

	update(phase) {
		const speed = 4;

		// this.segments[this.segments.length - 1].position.x += 1;

		this.segments.forEach((segment) => {
			if (segment.radius >= this.near) {
				segment.radius =  this.near * Math.pow(this.radiusDecrease, this.numSegments);
				segment.scale = segment.radius / this.near;
			}
		});

		this.segments.sort((s1, s2) => s1.scale - s2.scale);

		this.segments.forEach((segment) => {
			const segmentScale = segment.radius / this.near;
			const segmentSpeed = speed * segmentScale;

			const segmentRadiusNew = segment.radius + segmentSpeed;
			const segmentScaleNew = segmentRadiusNew /  this.near;

			segment.update(segmentRadiusNew, segmentScaleNew);
		});
	}

	draw(ctx) {
		for (let i = 0; i < this.segments.length; i++) {
			const segment = this.segments[i];

			// if (i < this.segments.length - 1) {
			// 	const segmentNext = this.segments[i + 1];

			// 	segment.connect(segmentNext, ctx);
			// }

			segment.draw(ctx);
		}
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
	}

	reset() {
		this.stage.clear();

		this.generate();
	}

	generate() {
		const { stage: { center, radius } } = this;
		const near = radius * 1.5;
		const far = 0;

		this.tunnel = new Tunnel({
			center,
			near,
			far,
		});
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

	// scene.setFocusPoint({
	// 	x: target.clientX - e.target.offsetLeft,
	// 	y: target.clientY - e.target.offsetTop,
	// });
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
