const simplex = new SimplexNoise();

const ease = t => t; // (--t)*t*t+1; // easeOutCubic
const map = (value, start1, stop1, start2, stop2) => ((value - start1) / (stop1 - start1)) * (stop2 - start2) + start2;
const distanceBetween = (vec1, vec2) => Math.hypot(vec2.x - vec1.x, vec2.y - vec1.y);

const canvas = document.querySelector('.js-canvas');
const ctx = canvas.getContext('2d');

const width = 500;
const height = 500;

canvas.width = width;
canvas.height = height;

let phase = 0;
const phaseSpeed = 0.007;

const radiusMin = 10;
const radiusMax = width * 0.45;
const connectDistance = 90;

const numRings = 6;
const dotsPerRing = 9;
const numDots = numRings * dotsPerRing;

const angleStep = Math.PI * 2 / numDots;

const dots = new Array(numDots).fill().map((_, index) => {
	const percent = (index % numRings) / (numRings);
	const offset = -1 + (2 * percent);

	const dot = {
		offset,
		index,
		x: 0,
		y: 0,
		xPrev: 0,
		yPrev: 0,
		speed: 1,
		connectedTo: [],

		update: function (phaseGlobal) {
			this.connectedTo = [];

			const phase = this.offset + phaseGlobal;
			const tick = Math.cos(phase);
			const ringRadius = radiusMin + (tick * (radiusMax - radiusMin));
			const rotation = phaseGlobal * 0.1;

			this.xPrev = this.x;
			this.yPrev = this.y;

			this.size = 2 + (8 * Math.abs(ringRadius / radiusMax));
			this.angle = angleStep * this.index + rotation;
			this.x = Math.cos(this.angle) * ringRadius;
			this.y = Math.sin(this.angle) * ringRadius;
			this.speed = distanceBetween(this, { x: this.xPrev, y: this.yPrev });
		}
	};

	dot.update(0);

	return dot;
});

const drawDot = (ctx, { x, y, angle, speed, size }) => {
	const { canvas } = ctx;
	const rx = Math.max(size, size * (speed / 3));
	const ry = Math.min(size, size / speed);

	ctx.save();
	ctx.translate(canvas.width * 0.5, canvas.height * 0.5);

	ctx.beginPath();
	ctx.ellipse(x, y, rx, ry, angle, 0, Math.PI * 2, false)
	ctx.closePath();
	ctx.fill();
	ctx.restore();
};

const connect = (ctx, from, to, percent) => {
	ctx.save();
	ctx.translate(canvas.width * 0.5, canvas.height * 0.5);

	ctx.beginPath();
	ctx.strokeStyle = `rgba(210, 210, 210, ${percent})`;
	ctx.moveTo(from.x, from.y);
	ctx.lineTo(to.x, to.y);
	ctx.stroke();
	ctx.closePath();
	ctx.restore();
};

const loop = () => {
	ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

	dots.forEach((dotA) => {
		dotA.update(phase);

		dots.forEach((dotB) => {
			if (dotA === dotB) {
				return;
			}

			const distance = distanceBetween(dotA, dotB);

			if (distance > connectDistance) {
				return;
			}

			const percent = 1 - (distance / connectDistance);

			connect(ctx, dotA, dotB, percent);
		});
	});


	dots.forEach(dot => drawDot(ctx, dot));

	phase += phaseSpeed;

	requestAnimationFrame(loop);
};

loop(0);


