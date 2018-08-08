const c = document.querySelector('.js-canvas');
const ctx = c.getContext('2d');

const W = 500;
const H = 500;
const TAU = Math.PI * 2;
const HYPO = Math.hypot(W, H);

const NUM_PARTICLES = 2000;

const particles = [];
const mouse = new Vector(999, 999);

c.width = W;
c.height = H;

for (let i = 0; i < NUM_PARTICLES; i++) {
	const x = Math.random() * W;
	const y = Math.random() * H;

	const p = {
		pos: new Vector(x, y),
		force: new Vector(),
		acc:  new Vector(1, 0),
		vel: new Vector(0, 0),
	};

	particles.push(p);
}

const distanceBetween = (vec1, vec2) => Math.hypot(vec2.x - vec1.x, vec2.y - vec1.y);
const angleBetween = (vec1, vec2) => Math.atan2(vec2.y - vec1.y, vec2.x - vec1.x);
const clamp = (value, min, max) => Math.max(min, Math.min(value, max));

const clear = () => {
	ctx.fillStyle = 'rgba(255, 255, 255, 1)';
	ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
};

const update = (particle) => {
	const { pos, acc, vel } = particle;

	const falloff = 50;

	const distance = distanceBetween(mouse, particle.pos);
	const force = 1 - clamp(distance / falloff, 0, 1);
	const angle = angleBetween(mouse, particle.pos);

	const strength = 0.75;

	particle.force.x = Math.cos(angle) * force * strength;
	particle.force.y = Math.sin(angle) * force * strength;

	particle.acc.addSelf(particle.force);
	particle.vel.addSelf(particle.acc);
	particle.pos.addSelf(particle.vel);

	particle.acc.multiplySelf(0);
	particle.vel.limit(1);

	particle.distance = clamp(1 - (distance / (falloff * 3)), 0, 1);

	const padding = 0;

	if (pos.x > W - padding) {
		pos.x = padding;
	} else if (pos.x < padding) {
		pos.x = W - padding;
	}

	if (pos.y > H - padding) {
		pos.y = padding;
	} else if (pos.y < padding) {
		pos.y = H - padding;
	}

};

const draw = (particle) => {
	const { distance } = particle;

	ctx.beginPath();
	ctx.fillStyle = `rgba(${distance * 255}, 0, 0, 1)`;

	ctx.arc(particle.pos.x, particle.pos.y, 1, 0, TAU, false);
	ctx.fill();
	ctx.closePath();
};


const loop = () => {
	clear();

	particles.forEach((p) => {
		update(p);
		draw(p);
	});

	requestAnimationFrame(loop);
};


loop();

c.addEventListener('mousemove', (e) => {
	mouse.x = e.clientX;
	mouse.y = e.clientY;
});
