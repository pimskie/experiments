const distanceBetween = (vec1, vec2) => Math.hypot(vec2.x - vec1.x, vec2.y - vec1.y);

const simplex = new SimplexNoise();

const canvas = document.querySelector('.js-canvas');
const ctx = canvas.getContext('2d');

const TAU = Math.PI * 2;

const width = 500;
const height = 500;

const midX = width >> 1;
const midY = height >> 1;
const hypo = distanceBetween({ x: 0, y: 0 }, { x: midX, y: midY });

canvas.width = width;
canvas.height = height;

let frame = 0;
let phase = 0;
const phaseSpeed = 0.001;

class Trail {
	constructor(position, angle, detail, spacing, velocity) {
		this.position = position;
		this.angle = angle;
		this.heading = angle;

		this.velocity = velocity;

		this.spacingCurrent = 1;
		this.spacing = spacing;

		this.detail = detail;
		this.trail = new Array(this.detail).fill();

		this.initTrail();
	}

	initTrail() {
		this.trail = this.trail.map((_, i) => {
			return {
				x: Math.cos(this.angle) * (this.spacingCurrent * i),
				y: Math.sin(this.angle) * (this.spacingCurrent * i),
			};
		});
	}

	update(phase, index) {
		const tip = { ...this.trail[this.detail - 1] };

		const scale = 0.02;
		const noise = simplex.noise3D(tip.x * scale, tip.y * scale, (this.angle + index) * scale);
		const angleModifier = 0.75 * noise;

		this.angle = this.heading + angleModifier;

		const newTip = {
			x: tip.x + (Math.cos(this.angle) * this.velocity),
			y: tip.y + (Math.sin(this.angle) * this.velocity),
		};

		const percent = distanceBetween(newTip, tip) / this.spacingCurrent; // this.spacing;

		for (let i = 0; i < this.detail - 1; i++) {
			const p1 = this.trail[i];
			const p2 = this.trail[i + 1];

			p1.x += (p2.x - p1.x) * percent;
			p1.y += (p2.y - p1.y) * percent;
		}

		this.trail[this.detail - 1] = newTip;

		const d2 = distanceBetween({ x: 0, y: 0 }, newTip);

		this.spacingCurrent = Math.max(2, this.spacing * (d2 / 100));
	}

	isOutside(width, height) {
		const [first] = this.trail;

		const x = this.position.x + first.x;
		const y = this.position.y + first.y;

		return (x > width || x < 0 || y > height || y < 0);
	}

	draw(ctx) {
		ctx.strokeStyle = '#fff';
		ctx.fillStyle = '#fff';
		ctx.lineCap = 'round';

		ctx.save();
		ctx.translate(this.position.x, this.position.y);

		for (let i = 0; i < this.trail.length - 1; i++) {
			const width = (i / this.trail.length) * 10;

			ctx.beginPath();
			ctx.lineWidth = width;
			ctx.moveTo(this.trail[i].x, this.trail[i].y);
			ctx.lineTo(this.trail[i + 1].x, this.trail[i + 1].y);

			ctx.stroke();
		}

		ctx.closePath();
		ctx.restore();
	}
}

let angle = 0;
let trails = [];

const addTrail = (angle) => {
	const position = {
		x: midX + Math.cos(angle),
		y: midY + Math.sin(angle)
	};

	const velocity = 1.5 + (Math.random() * 0.25);
	const detail = 6;
	const spacing = 8;

	const trail = new Trail(position, angle, detail, spacing, velocity);

	trails.push(trail);
};

const drawOverlay = (ctx) => {
	const fill = ctx.createRadialGradient(midX, midY, 0, midX, midY, hypo);
	fill.addColorStop(0, 'rgba(0, 0, 0, 0)');
	fill.addColorStop(0.75, 'rgba(0, 0, 0, 1)');

	ctx.fillStyle = fill;
	ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
};

const clear = () => {
	ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
};

const reset = () => {
	clear();
};


const loop = () => {
	clear();

	if (frame % 1 === 0) {
		addTrail(angle);

		frame = 1;
	}

	trails.forEach((trail, index) => {
		trail.update(phase, index);
		trail.draw(ctx);
	});

	trails = trails.filter(t => !t.isOutside(width, height));

	drawOverlay(ctx);

	angle += 0.2; // 0.25;
	frame += 1;
	phase += phaseSpeed;

	requestAnimationFrame(loop);
};

loop();

canvas.addEventListener('click', reset);
