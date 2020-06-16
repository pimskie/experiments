// https://fyprocessing.tumblr.com/post/98066742289/bigblueboo-turn-urge

const ctx = document.querySelector('canvas').getContext('2d');
const size = 500;
const mid = { x: size * 0.5, y: size * 0.5 };
const tau = Math.PI * 2;
const speed = 0.01;
const map = (value, start1, stop1, start2, stop2) => ((value - start1) / (stop1 - start1)) * (stop2 - start2) + start2;

ctx.canvas.width = size;
ctx.canvas.height = size;

class Group {
	constructor({ pos, radius, numRings, baseAngle = 0, phase = 0 }) {
		this.pos = pos;
		this.radius = radius;
		this.numRings = numRings;
		this.baseAngle = baseAngle;
		this.phase = phase;
	}

	update(speed) {
		this.phase += speed;
	}

	draw(ctx, hue) {
		ctx.save();
		ctx.translate(this.pos.x, this.pos.y);
		ctx.strokeStyle = `hsla(${hue}, 50%, 50%, 0.25)`;

		for (let i = 0; i < this.numRings; i++) {
			const percent = tau * (i / this.numRings);
			const phaseLocal = this.phase + percent;
			const radius = 10 + Math.abs(Math.sin((phaseLocal / 2) - this.baseAngle - (Math.PI / 2))) * 70;
			const radiusInc = radius;

			ctx.beginPath();
			ctx.arc(Math.cos(phaseLocal) * this.radius, Math.sin(phaseLocal) * this.radius, radiusInc, 0, tau);
			ctx.stroke();
			ctx.closePath();
		}

		ctx.restore();
	}

}

const clear = () => ctx.clearRect(0, 0, size, size);

const numGroups = 4;
const groups = new Array(numGroups).fill().map((_, i) => {
	const angle = (tau / numGroups) * i;
	const baseAngle = Math.PI + (Math.PI / numGroups) * i;
	const radius = 80;

	return new Group({
		pos: { x: mid.x + (Math.cos(angle) * radius), y: mid.y + (Math.sin(angle) * radius) },
		radius,
		numRings: 20,
		baseAngle,
		phase: (i / numGroups) * tau,
	});
});

const loop = () => {
	clear();

	groups.forEach((group, i) => {
		const inc = i % 2 === 0 ? speed : -speed;
		const c = (group.phase + group.baseAngle) * (180 / Math.PI);

		group.update(inc);
		group.draw(ctx, c);
	});

	requestAnimationFrame(loop);
};

loop();
