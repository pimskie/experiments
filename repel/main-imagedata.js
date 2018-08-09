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

const NUM_PARTICLES = 10000;

const simplex = new SimplexNoise();
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
		force: new Vector(),
		acc:  new Vector(0, 0),
		vel: new Vector(0, 0),
	};

	particles.push(p);
}

const pixelIndex = (x, y, imageData) => (~~x + ~~y * imageData.width) * 4;
const distanceBetween = (vec1, vec2) => Math.hypot(vec2.x - vec1.x, vec2.y - vec1.y);
const angleBetween = (vec1, vec2) => Math.atan2(vec2.y - vec1.y, vec2.x - vec1.x);
const clamp = (value, min, max) => Math.max(min, Math.min(value, max));

const clearStage = () => {
	ctx.fillStyle = 'rgba(255, 255, 255, 1)';
	ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
};

const clear = (particle) => {
	const { pos } = particle;
	const index = pixelIndex(pos.x, pos.y, imageData);

	imageData.data[index + 3] = 0;
};

const update = (particle, index) => {
	const { pos, acc, vel, force } = particle;

	const noiseScale = 0.005;
	const strength = 1;

	const distance = distanceBetween(mouse, pos);
	const forceStrength = 1 - clamp(distance / falloff, 0, 1);
	const angle = angleBetween(mouse, pos);

	const explodeForce = new Vector(
		Math.cos(particle.explodeAngle) * particle.explodeForce,
		Math.sin(particle.explodeAngle) * particle.explodeForce
	)

	force.x = Math.cos(angle) * forceStrength * strength;
	force.y = Math.sin(angle) * forceStrength * strength;

	acc.addSelf(force);
	acc.addSelf(explodeForce);

	vel.addSelf(acc);
	pos.addSelf(vel);
	vel.limit(1);
	vel.multiplySelf(0.9);

	const noiseValue = noise.perlin3(pos.x * noiseScale, pos.y * noiseScale, phase);

	acc.length = 0.01;
	acc.angle = TAU * noiseValue;
	vel.addSelf(acc);
	pos.addSelf(vel);

	particle.explodeForce *= 0.9;

	particle.distance = clamp(1 - (distance / (falloff * 3)), 0, 1);

	if (pos.x < 0 || pos.x > W || pos.y < 0 || pos.y > H) {
		pos.x = Math.random() * W;
		pos.y = Math.random() * H;

	}
};

const draw = (particle) => {
	const { distance, pos } = particle;

	const index = pixelIndex(pos.x, pos.y, imageData);

	imageData.data[index] = distance * 255;
	imageData.data[index + 1] = 0;
	imageData.data[index + 2] = 0;
	imageData.data[index + 3] = 100 + (distance * 155);
};

let phase = 0;
let isExploding = false;

const loop = () => {
	particles.forEach((p, i) => {
		clear(p);

		if (isExploding) {
			p.explodeAngle = angleBetween(mouse, p.pos);
			p.explodeForce = (HYPO - distanceBetween(p.pos, mouse)) * 0.001;
		}
		update(p, i);
		draw(p);
	});


	ctx.putImageData(imageData, 0, 0);

	ctxDraw.globalCompositeOperation = qs('.js-operation-before').value;
	ctxDraw.fillStyle = `rgba(255, 255, 255, ${qs('.js-opacity').value})`;
	ctxDraw.fillRect(0, 0, ctxDraw.canvas.width, ctxDraw.canvas.height);
	ctxDraw.globalCompositeOperation = qs('.js-operation-after').value;

	ctxDraw.drawImage(c, 0, 0);

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
