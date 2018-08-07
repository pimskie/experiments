const c = document.querySelector('.js-canvas');
const ctx = c.getContext('2d');

const W = 500;
const H = 500;
const NUM_PARTICLES = 1500;

const particles = [];
const mouse = new Vector(999, 999);

c.width = W;
c.height = H;

for (let i = 0; i < NUM_PARTICLES; i++) {
	const x = Math.random() * W;
	const y = Math.random() * H;

	const acc = new Vector();

	acc.length = 2 + Math.random();
	acc.angle = 0;

	const p = {
		color: 'black',
		force: 0,
		pos: new Vector(x, y),
		acc,
	};

	particles.push(p);
}

const distanceBetween = (vec1, vec2) => {
	const x = vec2.x - vec1.x;
	const y = vec2.y - vec1.y;

	return Math.hypot(x, y);
};

const angleBetween = (vec1, vec2) => {
	const x = vec2.x - vec1.x;
	const y = vec2.y - vec1.y;

	return Math.atan2(y, x);
};

const clamp = (value, min, max) => Math.max(min, Math.min(value, max));

const clear = () => {
	ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
};

const update = (particle) => {
	const falloff = 100;

	const { pos, acc } = particle;

	pos.addSelf(acc);

	const distance =  distanceBetween(pos, mouse);
	const angle = angleBetween(pos, mouse);
	const force = (falloff - clamp(distance, 0, falloff)) / falloff;

	particle.color = distance < falloff ? 'red' : 'black';
	particle.force = force;
	particle.acc.angle = -angle * force;

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
};

const draw = (particle) => {
	ctx.beginPath();
	ctx.fillStyle = particle.color;

	ctx.arc(particle.pos.x, particle.pos.y, 2, 0, Math.PI * 2, false);
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
