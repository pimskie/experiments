const distanceBetween = (vec1, vec2) => Math.hypot(vec2.x - vec1.x, vec2.y - vec1.y);

const simplex = new SimplexNoise();

const canvas = document.querySelector('.js-canvas');
const ctx = canvas.getContext('2d');

const TAU = Math.PI * 2;

const width = 500;
const height = 500;

const midX = width >> 1;
const midY = height >> 1;

canvas.width = width;
canvas.height = height;

let frame = 0;
let phase = 0;
const phaseSpeed = 0.001;

class Trail {
	constructor(position, angle, detail, spacing, velocity) {
		this.position = position;
		this.angle = angle;
		this.velocity = velocity;
		this.spacing = spacing;
		this.detail = detail;

		this.spacingCurrent = 1;

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

	update() {
		const tip = { ...this.trail[this.detail - 1] };

		const scale = 0.01;
		const noise = simplex.noise3D(tip.x * scale, tip.y * scale, this.angle * scale);
		const angleModifier = 0.01 * noise;

		this.angle += angleModifier;

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

		this.spacing *= 0.997;

		const d2 = distanceBetween({ x: 0, y: 0 }, newTip);
		this.spacingCurrent = this.spacing * (d2 / 100);
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

const radius = 1;
let angle = 0;
let trails = [];

const addTrail = (radius, angle) => {
	const position = {
		x: midX + (Math.cos(angle) * radius),
		y: midY + (Math.sin(angle) * radius)
	};

	const velocity = 1 + (Math.random() * 0.25);
	const detail = 6;
	const spacing = 8;

	const trail = new Trail(position, angle, detail, spacing, velocity);

	trails.push(trail);
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
		addTrail(radius, angle);

		frame = 1;
	}

	trails.forEach((trail, index) => {
		trail.update(phase, index);
		trail.draw(ctx);
	});

	trails = trails.filter(t => !t.isOutside(width, height));

	angle += 0.5;
	frame += 1;
	phase += phaseSpeed;

	requestAnimationFrame(loop);
};

addTrail(radius, angle);

loop();

canvas.addEventListener('click', reset);
