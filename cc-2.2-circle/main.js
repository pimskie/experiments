const W = 500;
const H = 500;
const R = W * 0.45;
const TAU = Math.PI * 2;

const ctx = document.querySelector('canvas').getContext('2d');

ctx.canvas.width = W;
ctx.canvas.height = H;
noise.seed();

let frame = 0;

const draw = (scale = 1) => {
	const detail = 100;
	const angleStep = TAU / detail;

	ctx.save();
	ctx.translate(W * 0.5, H * 0.5);
	ctx.beginPath();


	for (let i = 0; i < detail; i++) {
		const angle = i * angleStep;

		const x = Math.cos(angle) * R;
		const y = Math.sin(angle) * R;

		const noiseValue = noise.perlin3(x * 0.003, y * 0.003, frame * 0.02);

		const x2 = Math.cos(angle) * ((R + (noiseValue * 100)) * scale);
		const y2 = Math.sin(angle) * ((R + (noiseValue * 100)) * scale);

		ctx.lineTo(x2, y2);
	}

	ctx.closePath();
	ctx.stroke();
	ctx.restore();
};

const loop = () => {
	ctx.clearRect(0, 0, W, H);

	draw();
	draw(0.5);
	draw(0.25);

	frame++;

	requestAnimationFrame(loop);
};


loop();
