const simplex = new SimplexNoise(Math.random());

const ctx = document.querySelector('.js-canvas').getContext('2d');
const ctxTrails = document.querySelector('.js-canvas-trails').getContext('2d');

const setSize = () => {
	const w = window.innerWidth;
	const h = window.innerHeight;

	console.log(h)

	ctx.canvas.width = w;
	ctx.canvas.height = h;

	ctxTrails.canvas.width = w;
	ctxTrails.canvas.height = h;
};

const drawCircle = (ctx, { position, radius, fill }, effect = false) => {
	if (effect) {
	}

	ctx.beginPath();
	ctx.fillStyle = fill;
	ctx.arc(position.x, position.y, radius, 0, Math.PI * 2);
	ctx.fill();
	ctx.closePath();
};

const drawTrail = (ctx, from, to) => {
	ctx.beginPath();
	ctx.moveTo(from.x, from.y);
	ctx.lineTo(to.x, to.y);
	ctx.stroke();
	ctx.closePath();
};

const clear = (ctx) => {
	ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
};

const getParticle = (cx, cy, circleRadius) => {
	const angle = Math.random() * Math.PI * 2;
	const length = Math.random() * circleRadius;
	const speed = 0.5 + Math.random();

	const x = cx + (Math.cos(angle) * length);
	const y = cy + (Math.sin(angle) * length);
	const position = { x, y };
	const positionPrevious = { x, y };
	const radius = 3;
	const fill = 'rgb(255,255,0)';
	const isNearing = Math.random() > 0.5; // is that a word?
	const radiusIncrease = (isNearing ? 0.01 : -0.01) * (0.5 + (0.5 * Math.random()));

	return { position, positionPrevious, angle, radius, fill, radiusIncrease, speed };
};

const drawParticle = (particle, width, height) => {
	const { position, positionPrevious, radiusIncrease, speed } = particle;
	const noiseScale = 0.05;
	const noise = simplex.noise2D(position.x * noiseScale, position.y * noiseScale) * 0.02;
	particle.angle += noise;

	positionPrevious.x = position.x;
	positionPrevious.y = position.y;

	particle.position.x += Math.cos(particle.angle) * speed;
	particle.position.y += Math.sin(particle.angle) * speed;

	particle.radius += radiusIncrease;

	if (particle.radius <= 0 || position.x < 0 || position.x > width || position.y < 0 || position.y > height) {
		Object.assign(particle, getParticle(width * 0.5, height * 0.5, circle.radius));

		return;
	}

	drawCircle(ctx, particle, true);
	drawTrail(ctxTrails, positionPrevious, position);
};

const setup = () => {
	setSize();
	const { width, height } = ctx.canvas;

	const cx = width * 0.5;
	const cy = height * 0.5
	const circleRadius = 100;

	const circle = { position: { x: cx, y: cy }, radius: circleRadius, fill: '#e6a33d' };
	const particles = new Array(150).fill().map((_, i) => getParticle(cx, cy, circleRadius));

	loop(circle, particles);
};

const loop = (circle, particles) => {
	clear(ctx);
	drawCircle(ctx, circle);

	const { canvas: { width, height } } = ctx;

	particles.forEach((particle, i) => {
		drawParticle(particle, width. height)
	});


	requestAnimationFrame(() => loop(circle, particles));
};

// window.addEventListener('resize', setup);

setup();
