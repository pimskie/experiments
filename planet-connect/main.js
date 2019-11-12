const simplex = new SimplexNoise();

const canvas = document.querySelector('.js-canvas');
const ctx = canvas.getContext('2d');

const width = 500;
const height = 500;

const midX = width * 0.5;
const midY = height * 0.5;

canvas.width = width;
canvas.height = height;

let phase = 0;
const phaseSpeed = 0.03;

const numRings = 5;
const dotsPerRing = 10;
const numDots = numRings * dotsPerRing;

const ease = t => t * (2 - t);
const map = (value, start1, stop1, start2, stop2) => ((value - start1) / (stop1 - start1)) * (stop2 - start2) + start2;
const distanceBetween = (vec1, vec2) => Math.hypot(vec2.x - vec1.x, vec2.y - vec1.y);

const drawDot = (ctx, { x, y, size, angle, speed }) => {
	const rx = Math.max(size, size * (speed * 0.35));
	const ry = size;

	ctx.save();
	ctx.translate(x, y);
	ctx.beginPath();
	ctx.ellipse(0, 0, rx, ry, angle, 0, Math.PI * 2);
	ctx.closePath();
	ctx.fill();
	ctx.restore();
};

const connect = (ctx, from, to, percent) => {
	ctx.beginPath();
	ctx.strokeStyle = `rgba(0, 0, 0, 0.01)`;
	ctx.lineWidth = percent;
	ctx.moveTo(from.x, from.y);
	ctx.lineTo(to.x, to.y);
	ctx.closePath();
	ctx.stroke();
};

const angleStep = Math.PI * 2 / numDots;
const radiusMax = width * 0.45;

const dots = new Array(numDots).fill().map((_, i) => {
	const dot = {
		offset: (i % numRings * 2) / (numRings - 2),
		index: i,
		angleStart: angleStep * i,
		angle: angleStep * i,

		update: function (phase = 0) {
			const oldX = this.x;
			const oldY = this.y;

			const offsetPhase = this.offset + phase;
			const cosNormal = map(Math.cos(offsetPhase), -1, 1, 0, 1);
			const tick = ease(cosNormal);

			const ringRadius = tick * radiusMax;

			this.angle = this.angleStart + phase * 0.1;

			this.size = 1 + (8 * Math.abs(ringRadius / radiusMax));
			this.x = midX + (Math.cos(this.angle) * ringRadius);
			this.y = midY + (Math.sin(this.angle) * ringRadius);

			this.speed = distanceBetween({ x: oldX, y: oldY }, { x: this.x, y: this.y });
		},
	};

	dot.update();

	return dot;
});

const loop = () => {
	ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

	dots.forEach((dotA) => {
		dotA.update(phase);

		drawDot(ctx, dotA);

		dots.forEach((dotB) => {
			if (dotB !== dotA) {
				const distance = distanceBetween(dotA, dotB);
				if (distance < 100) {
					const percent = distance / 100;

					connect(ctx, dotA, dotB, percent);
				}
			}
		});
	});

	phase += phaseSpeed;

	requestAnimationFrame(loop);
};

loop(0);


