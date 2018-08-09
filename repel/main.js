const qs = sel => document.querySelector(sel);

const c = qs('.js-canvas');
const ctx = c.getContext('2d');

const cDraw = qs('.js-canvas-draw');
const ctxDraw = cDraw.getContext('2d');

const W = 400;
const H = W;
const TAU = Math.PI * 2;
const HYPO = Math.hypot(W, H);
const R = HYPO / 2;
const MID = new Vector(W / 2, H / 2);

const NUM_PARTICLES = 1000;

noise.seed(Math.random());

const particles = [];
const mouse = new Vector(999, 999);
const imageData = ctx.getImageData(0, 0, W, H);
let falloff = 50;

c.width = cDraw.width = W;
c.height = cDraw.height = H;

for (let i = 0; i < NUM_PARTICLES; i++) {
	const x = Math.random() * W;
	const y = Math.random() * H;

	const p = {
		explodeAngle: 0,
		explodeForce: 0,
		pos: new Vector(x, y),
		acc: new Vector(0, 0),
		vel: new Vector(0, 0),
		life: 0,
		age: 0,
		aging: Math.random() * 0.05,
	};

	particles.push(p);
}

const distanceBetween = (vec1, vec2) => Math.hypot(vec2.x - vec1.x, vec2.y - vec1.y);
const angleBetween = (vec1, vec2) => Math.atan2(vec2.y - vec1.y, vec2.x - vec1.x);
const clamp = (value, min, max) => Math.max(min, Math.min(value, max));

const clearStage = () => {
	ctx.fillStyle = 'rgba(255, 255, 255, 1)';
	ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
};

const update = (particle) => {
	const { pos, acc, vel, trail, life } = particle;

	const noiseScale = 0.005;
	const strength = 1;

	const distanceFromMouse = distanceBetween(mouse, pos);
	const forceStrength = 1 - clamp(distanceFromMouse / falloff, 0, 1);
	const angle = angleBetween(mouse, pos);

	const explodeForce = new Vector(
		Math.cos(particle.explodeAngle) * particle.explodeForce,
		Math.sin(particle.explodeAngle) * particle.explodeForce
	);

	const force = new Vector(
		Math.cos(angle) * forceStrength * strength,
		Math.sin(angle) * forceStrength * strength
	);

	acc.addSelf(force);
	acc.addSelf(explodeForce);

	vel.addSelf(acc);
	pos.addSelf(vel);
	vel.limit(1);
	vel.multiplySelf(0.98);

	const noiseValue = noise.perlin3(pos.x * noiseScale, pos.y * noiseScale, phase);

	acc.length = 0.01;
	acc.angle = TAU * noiseValue;
	vel.addSelf(acc);
	pos.addSelf(vel);

	particle.explodeForce *= 0.9;

	const distance = clamp(1 - (distanceFromMouse / (falloff * 3)), 0, 1);
	particle.color = `rgba(${255 * distance}, 0, 0, ${life})`;

	particle.life = Math.sin(particle.age);

	particle.age += particle.aging;

	if (pos.x > W) {
		pos.x = 0;
	} else if (pos.x < 0) {
		pos.x = W;
	}

	if (pos.y > H) {
		pos.y = 0;
	} else if (pos.y < 0) {
		pos.y = H;
	}

	// ded
	if (particle.life > 0 && particle.life < 0.01) {
		particle.aging = Math.random() * 0.05;
		particle.life = 0;
		pos.x = Math.random() * W;
		pos.y = Math.random() * H;
	}
};

const draw = (particle, ctx) => {
	const { color, pos } = particle;

	ctx.beginPath();
	ctx.fillStyle = color;
	ctx.arc(pos.x, pos.y, 1, 0, TAU, false);
	ctx.fill();
	ctx.closePath();
};

let phase = 0;
let isExploding = false;

const loop = () => {
	ctxDraw.globalCompositeOperation = qs('.js-operation-before').value;
	ctxDraw.fillStyle = `rgba(255, 255, 255, ${qs('.js-opacity').value})`;
	ctxDraw.fillRect(0, 0, ctxDraw.canvas.width, ctxDraw.canvas.height);

	particles.forEach((p) => {
		if (isExploding) {
			p.explodeAngle = angleBetween(mouse, p.pos);
			p.explodeForce = (HYPO - distanceBetween(p.pos, mouse)) * 0.001;
		}

		update(p);
		draw(p, ctxDraw);
	});

	ctxDraw.globalCompositeOperation = qs('.js-operation-after').value;

	phase += 0.01;
	isExploding = false;


	requestAnimationFrame(loop);
};


loop();

cDraw.addEventListener('mousemove', (e) => {
	mouse.x = e.clientX;
	mouse.y = e.clientY;
});

cDraw.addEventListener('mousedown', () => {
	isExploding = true;
});
