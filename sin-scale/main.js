noise.seed(Math.random());

const ctx = document.querySelector('canvas').getContext('2d');

const TAU = Math.PI * 2;
const R = 250;

ctx.canvas.width = 500;
ctx.canvas.height = 500;

const NUM_SHAPES = 30;
const ANGLE_STEP = TAU / NUM_SHAPES;

const shapes = new Array(NUM_SHAPES).fill().map((_, i) => {
	const scaleX = i / NUM_SHAPES;
	const scaleY = 1;
	const rotation = i * ANGLE_STEP;
	const top = {};
	const bottom = {};

	return { scaleX, scaleY, top, bottom, rotation};
});

let phase = 0;
const drawShape = (ctx, shape, phase, index) => {
	const { rotation } = shape;

	const numPoints = 75;
	const pointAngleStep = TAU / numPoints;
	const noiseIndex1 = index * 0.01;

	ctx.fillStyle = `hsla(0, 70%, 50%, 0.09)`;
	ctx.strokeStyle = `hsla(0, 70%, 50%, 0.1)`;
	ctx.beginPath();

	for (let i = 0; i < numPoints; i++) {
		const noiseIndex2 = i * 0.1;
		const noiseIndex3 = phase + noiseIndex1 + noiseIndex2;
		const noiseValue = noise.perlin3(noiseIndex3, noiseIndex3, noiseIndex3) * 50;

		const angle = (i * pointAngleStep);
		const r = R + noiseValue;

		const x = Math.cos(rotation + angle) * r;
		const y = Math.sin(rotation + angle) * r;

		if (i === 0) {
			ctx.moveTo(x, y);
		} else {
			ctx.lineTo(x, y);
		}
	}

	ctx.closePath();
	ctx.stroke();
	ctx.fill();
};

const loop = () => {
	ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

	shapes.forEach((shape, i) => {
		const shapeScaleX = 0.5 + (noise.perlin3(i * 0.1, i * 0.1, phase) * 0.5);
		const shapeScaleY = 0.5 + (noise.perlin3(phase, i * 0.1, i * 0.1) * 0.5);

		ctx.save();
		ctx.translate(250, 250);
		ctx.rotate(shape.rotation + phase);
		ctx.scale(shapeScaleX, shapeScaleY);

		drawShape(ctx, shape, phase, i);

		ctx.restore();
	});


	phase += 0.005;

	requestAnimationFrame(loop);
};

loop();
