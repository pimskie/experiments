const container = document.querySelector('.js-canvas-container');

const canvasInput = document.createElement('canvas');
const ctxInput = canvasInput.getContext('2d');

const canvasKaleido = document.createElement('canvas');
const ctxKaleido = canvasKaleido.getContext('2d');

const TAU = Math.PI * 2;
const W = 400;
const H = 400;

const MID_X = W * 0.5;
const MID_Y = H * 0.5;

let particles = [];

let isPlaying = false;
let rafId = null;
let phase = 0;

[canvasKaleido, canvasInput].forEach((c) => {
	c.width = W;
	c.height = H;
});

const init = ({ numTrails, iterations } = options) => {
	cancelAnimationFrame(rafId);

	clear(ctxInput);
	clear(ctxKaleido);

	noise.seed(Math.random());

	particles = [];

	for (let index = 0; index < numTrails; index++) {
		const pos = { x: MID_X, y: MID_Y };

		particles.push({ pos, iterations, index });
	}

	rafId = requestAnimationFrame(loop);
};

const updateParticle = (particle, { trailSpread, noiseScale } = {}) => {
	const { pos, index } = particle;

	const spread = index * trailSpread;
	const noiseValue = noise.simplex2((pos.x + spread) * noiseScale, (pos.y + spread) * noiseScale);

	const angle = noiseValue * TAU;

	pos.x += Math.cos(angle);
	pos.y += Math.sin(angle);
};

const drawParticle = (ctx, { pos } = particle, { noiseScale } = options) => {
	const noiseValue = noise.perlin2(pos.x * noiseScale, pos.y * noiseScale) * 0.5;
	const h = 100 * noiseValue;
	const r = 0.5;

	ctx.beginPath();
	ctx.fillStyle = `hsla(${h}, 100%, 0%, 0.5)`;
	ctx.arc(pos.x - r, pos.y - r, r, 0, TAU, false);
	ctx.fill();
	ctx.closePath();
};

const clear = (ctx) => {
	ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
};

const drawDuplicates = ({ numSlices } = {}) => {
	const angleInc = TAU / numSlices;

	for (let i = 0; i < numSlices; i++) {
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

		updateParticle(particle, options);
		drawParticle(ctxInput, particle, options);

		if (pos.x >= W || pos.x <= 0 || pos.Y >= H || pos.y <= 0) {
			pos.x = MID_X;
			pos.y = MID_Y;

			// half of the trails overlap
			particle.index += particles.length / 2;

			particle.iterations -= 1;
		}
	});

	particles = particles.filter(p => p.iterations > 0);

};

const loop = () => {
	const { generate } = options;
	clear(ctxKaleido);

	if (generate) {
		for (let i = 0; i < 3; i++) {
			iterate();
		};
	}

	drawDuplicates(options);

	phase += 0.01;
	rafId = requestAnimationFrame(loop);
}


container.appendChild(canvasKaleido);

const reset = () => {
	init(options);
};

const options = {
	numSlices: 10,

	numTrails: 5,
	trailSpread: 2,
	iterations: 5,

	noiseScale: 0.01,
	generate: true,
	reset,
};

reset();

const gui = new dat.GUI();
gui.add(options, 'numSlices').step(2).min(2).max(40).onFinishChange(reset);
gui.add(options, 'numTrails').step(1).min(1).max(20).onFinishChange(reset);
gui.add(options, 'iterations').step(1).min(1).max(20).onFinishChange(reset);
gui.add(options, 'trailSpread').step(1).min(1).max(10).onFinishChange(reset);
gui.add(options, 'reset');
