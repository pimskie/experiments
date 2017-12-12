/* globals noise: false */

noise.seed(Math.random());

const c = document.querySelector('.js-canvas');
const ctx = c.getContext('2d');

const PI2 = Math.PI * 2;
const width = 500;
const height = 500;
const mid = 250;

const pointer = {
	x: mid,
	y: mid,
};

c.width = width;
c.height = height;

class Pulse {
	constructor(pos, hue, phase = 0.1) {
		this.pos = pos;
		this.hue = 90 + (Math.random() * 50);

		this.alpha = 0;
		this.phase = phase;
		this.speed = Math.random() * 0.05;
		this.radius = 1;
	}

	update() {
		this.pos.x += Math.cos(this.phase) * 0.025;
		this.pos.y += Math.sin(this.phase) * 0.025;

		this.radius = Math.abs(Math.sin(this.phase) * 2);
		this.alpha = 0.1 + Math.abs(noise.perlin2(this.phase, this.phase) * 0.25);

		this.phase += this.speed;
	}

	draw(ctx) {
		ctx.beginPath();
		ctx.fillStyle = `hsla(${this.hue}, 100%, 50%, ${this.alpha})`;
		ctx.arc(this.pos.x, this.pos.y, this.radius, 0, Math.PI * 2, false);

		ctx.fill();
		ctx.closePath();
	}
}

class Particle {
	constructor(pos, angle, hue, index) {
		this.pos = pos;
		this.angle = angle;
		this.hue = hue;
		this.lightness = 30;

		this.phase = (index + 1) * 0.1;

		this.length = 0.5;

		this.vel = { x: 0, y: 0 };
	}

	update() {
		this.vel.x = Math.cos(this.angle) * this.length;
		this.vel.y = Math.sin(this.angle) * this.length;

		this.vel.x += noise.perlin3(this.pos.x * 0.005, this.pos.y * 0.005, this.phase);
		this.vel.y += noise.perlin3(this.pos.x * 0.005, this.pos.y * 0.005, this.phase);

		this.pos.x += this.vel.x;
		this.pos.y += this.vel.y;

		this.lightness += 0.25;

		this.phase += 0.001;
	}

	draw(ctx) {
		ctx.beginPath();
		ctx.fillStyle = `hsla(${this.hue}, 100%, ${this.lightness}%, 1)`;
		ctx.arc(this.pos.x, this.pos.y, 0.5, 0, PI2, false);

		ctx.fill();
		ctx.closePath();
	}
}

const angleBetween = (pos1, pos2) => Math.atan2(pos2.y - pos1.y, pos2.x - pos1.x);

const calculate = (t, mod1 = 8, mod2 = 24, mod3 = 500) => {
	const radius = 75;

	let x = (Math.sin(t) + 1) * Math.cos(t) * ((9 / 10) * Math.cos(mod1 * t) + 1) * ((1 / 10) * Math.cos(mod2 * t) + 1) * ((1 / 10) * Math.cos(mod3 * t) + (9 / 10));
	let y = Math.sin(t) * (Math.sin(t) + 1) * ((9 / 10) * Math.cos(mod1 * t) + 1) * ((1 / 10) * Math.cos(mod2 * t) + 1) * ((1 / 10) * Math.cos(mod3 * t) + (9 / 10));

	// custom allignment
	x *= radius;
	y *= -radius;

	x += mid;
	y += 400;

	return { x, y };
};

const clearStage = () => {
	ctx.globalCompositeOperation = 'destination-out';
	ctx.fillStyle = 'rgba(0, 0, 0, 0.04)';
	ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
	ctx.globalCompositeOperation = 'lighter';
};


const createPath = (numPoints) => {
	const dest = [];

	for (let i = 0; i < numPoints; i += 0.01) {
		dest.push(calculate(i));
	}

	return dest;
};

const createPulses = (path) => {
	return path.map((point, index) => {
		return new Pulse(point, 100, path.length / (index + 1));
	});
};


const path = createPath(PI2);
const pulses = createPulses(path);
const particles = [];

const loop = () => {
	clearStage();

	const randomPulse = pulses[Math.floor(Math.random() * pulses.length)];
	const angle = angleBetween(pointer, randomPulse.pos);

	const particle = new Particle(
		{ x: randomPulse.pos.x, y: randomPulse.pos.y },
		angle,
		randomPulse.hue,
		particles.length,
	);

	particles.push(particle);

	particles.forEach((p) => {
		p.update();
		p.draw(ctx);
	});

	ctx.beginPath();
	ctx.fillStyle = '#000';
	ctx.moveTo(path[0].x, path[1].y);

	for (let i = 0; i < path.length; i++) {
		ctx.lineTo(path[i].x, path[i].y);
	}

	ctx.lineTo(path[0].x, path[1].y);

	ctx.fill();
	ctx.closePath();

	pulses.forEach((p) => {
		p.update();
		p.draw(ctx);
	});


	requestAnimationFrame(loop);
};


const onPointerMove = (e) => {
	const event = (e.touches && e.touches.length) ? e.touches[0] : e;
	let {
		clientX: x,
		clientY: y,
		target: { offsetLeft, offsetTop },
	} = event;

	pointer.x = 245; // x - offsetLeft;
	pointer.y = 410; // y - offsetTop;
};

c.addEventListener('mousemove', onPointerMove);
c.addEventListener('touchmove', onPointerMove);

loop();
