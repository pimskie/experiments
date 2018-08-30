noise.seed(Math.random());

const container = document.querySelector('.js-canvas-container');

const canvasInput = document.createElement('canvas');
const ctxInput = canvasInput.getContext('2d');
canvasInput.classList.add('slice');

const canvasKaleido = document.createElement('canvas');
const ctxKaleido = canvasKaleido.getContext('2d');

const TAU = Math.PI * 2;
const NUM_SLICES = 20;

const W = 400;
const H = 400;

const MID_X = W * 0.5;
const MID_Y = H * 0.5;

const NOISE_SCALE = 0.01;
const PARTICLE_DISPLACEMENT = 2;

const NUM_PARTICLES = 5;
const particles = [];

for (let index = 0; index < NUM_PARTICLES; index++) {
	const pos = new Vector(MID_X, MID_Y);

	particles.push({ pos, index });
}

let isPlaying = false;
let rafId = null;
let phase = 0;

[canvasKaleido, canvasInput].forEach((c) => {
	c.width = W;
	c.height = H;
});

const updateParticle = (particle) => {
	const { pos, index } = particle;

	const spread = index * PARTICLE_DISPLACEMENT;
	const noiseValue = noise.simplex2((pos.x + spread) * NOISE_SCALE, (pos.y + spread) * NOISE_SCALE);

	const angle = noiseValue * TAU;
	const acc = new Vector(Math.cos(angle), Math.sin(angle));

	pos.addSelf(acc);
};

const drawParticle = (pos, ctx) => {
	const noiseValue = noise.perlin2(pos.x * NOISE_SCALE, pos.y * NOISE_SCALE) * 0.1;
	const h = 100 * noiseValue;
	const r = 0.5;

	ctx.beginPath();
	ctx.fillStyle = `hsla(${h}, 100%, 50%, 0.2)`;
	ctx.arc(pos.x - r, pos.y - r, r, 0, TAU, false);
	ctx.fill();
	ctx.closePath();
};

const clear = (ctx, alpha = 1) => {
	ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
	ctx.beginPath();
	ctx.fillRect(0, 0, W, H);
	ctx.fill();
	ctx.closePath();
};

const drawDuplicates = () => {
	const angleInc = TAU / NUM_SLICES;

	for (let i = 0; i < NUM_SLICES; i++) {
		const scale = i % 2 === 0 ? 1 : -1;

		ctxKaleido.save();
		ctxKaleido.translate(MID_X, MID_Y);
		ctxKaleido.scale(1, scale);
		ctxKaleido.rotate((i * angleInc) + (phase * 0.1));
		ctxKaleido.drawImage(ctxInput.canvas, -W / 2, -H / 2);
		ctxKaleido.restore();
	}
}

const iterate = () => {
	particles.forEach((particle) => {
		const { pos } = particle;

		updateParticle(particle);
		drawParticle(pos, ctxInput);

		if (pos.x >= W || pos.x <= 0 || pos.Y >= H || pos.y <= 0) {
			pos.x = MID_X;
			pos.y = MID_Y;

			particle.index += particles.length / 2;
		}
	});

};

const loop = () => {
	clear(ctxKaleido);

	if (isPlaying) {
		for (let i = 0; i < 1; i++) {
			iterate();
		};
	}

	drawDuplicates();

	phase += 0.01;

	rafId = requestAnimationFrame(loop);
}

const toggle = () => {
	isPlaying = !isPlaying;
};

document.body.appendChild(canvasInput);
document.body.appendChild(canvasKaleido);

document.body.addEventListener('click', toggle);

toggle();
loop();
