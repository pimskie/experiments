const container = document.querySelector('.js-canvas-container');

const canvasInput = document.createElement('canvas');
const ctxInput = canvasInput.getContext('2d');

const canvasOutput = document.createElement('canvas');
const ctxOutput = canvasOutput.getContext('2d');

const TAU = Math.PI * 2;
const W = 550;
const H = 550;

const MID_X = W * 0.5;
const MID_Y = H * 0.5;

let particles = [];

let rafId = null;
let phase = 0;

canvasInput.width = canvasOutput.width = W;
canvasInput.height = canvasOutput.height = H;

const init = (options) => {
	const { numTrails, iterations, chaos } = options;

	cancelAnimationFrame(rafId);

	clear(ctxInput);
	clear(ctxOutput);

	noise.seed(Math.random());

	options.noiseScale = chaos * 0.01;

	console.log(options.noiseScale)
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
	const noiseValue = noise.perlin2((pos.x + spread) * noiseScale, (pos.y + spread) * noiseScale);

	const angle = noiseValue * TAU;

	pos.x += Math.cos(angle);
	pos.y += Math.sin(angle);
};

const drawParticle = (ctx, { pos } = particle) => {
	const h = 0;
	const s = 100;
	const l = 0;

	const r = 0.75;

	ctx.beginPath();
	ctx.fillStyle = `hsla(${h}, ${s}%, ${l}%, 0.2)`;
	ctx.arc(pos.x - r, pos.y - r, r, 0, TAU, false);
	ctx.fill();
	ctx.closePath();
};

const drawDuplicates = ({ numSlices } = {}) => {
	const angleInc = TAU / numSlices;

	for (let i = 0; i < numSlices; i++) {
		const scale = i % 2 === 0 ? 1 : -1;

		ctxOutput.save();
		ctxOutput.translate(MID_X, MID_Y);
		ctxOutput.scale(1, scale);
		ctxOutput.rotate((i * angleInc) + (phase * 0.1));
		ctxOutput.drawImage(ctxInput.canvas, -W / 2, -H / 2);
		ctxOutput.restore();
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

			particle.index += particles.length / 2;
			particle.iterations -= 1;
		}
	});

	particles = particles.filter(p => p.iterations > 0);

};

const clear = (ctx) => {
	ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
};

const loop = () => {
	const { pause } = options;

	if (pause) {
		rafId = requestAnimationFrame(loop);

		return;
	}

	clear(ctxOutput);

	for (let i = 0; i < 5; i++) {
		iterate();
	};

	drawDuplicates(options);

	phase += 0.01;
	rafId = requestAnimationFrame(loop);
}


container.appendChild(canvasOutput);

const reset = () => {
	init(options);
};

const chaos = 0.3;

const options = {
	numSlices: 10,

	numTrails: 5,
	iterations: 10,
	trailSpread: 3,

	chaos,

	pause: false,
	reset,
};

const gui = new dat.GUI();
gui.add(options, 'numSlices').step(2).min(2).max(40).onFinishChange(reset);
gui.add(options, 'numTrails').step(1).min(1).max(20).onFinishChange(reset);
gui.add(options, 'iterations').step(1).min(1).max(20).onFinishChange(reset);
gui.add(options, 'trailSpread').step(1).min(1).max(10).onFinishChange(reset);
gui.add(options, 'chaos').step(0.01).min(0.1).max(1.5).onFinishChange(reset);
gui.add(options, 'pause');
gui.add(options, 'reset');
gui.close();

reset();

