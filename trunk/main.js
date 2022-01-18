const map = (value, start1, stop1, start2, stop2) => ((value - start1) / (stop1 - start1)) * (stop2 - start2) + start2;

const ctx = document.querySelector('.js-canvas').getContext('2d');
const { canvas } = ctx;
const simplex = new SimplexNoise(performance.now());
const TAU = Math.PI * 2;

const W = 500;
const H = W;

canvas.width = W;
canvas.height = H;

const mid = {
	x: W >> 1,
	y: H >> 1,
};

const numCircles = 30;
const numSegments = 250;

const radiusMax = W * 0.45;
const radiusMin = 15;

const clear = () => ctx.clearRect(0, 0, W, H);

const drawCircle = (radius, percent) => {
	ctx.save();
	ctx.translate(mid.x, mid.y);
	ctx.beginPath();

	for (let i = 0; i < numSegments; i++) {
		const scale = 0.02;
		const angle = (TAU / numSegments) * i;
		const x = Math.cos(angle) * radius;
		const y = Math.sin(angle) * radius;

		const noise = simplex.noise3D((x * scale), (y * scale), Date.now() * 0.0005) * (10 * (0.1 + percent));

		const deformedX = Math.cos(angle) * (radius + noise);
		const deformedY = Math.sin(angle) * (radius + noise);

		if (i === 0) {
			ctx.moveTo(deformedX, deformedY);
		} else {
			ctx.lineTo(deformedX, deformedY);
		}
	}

	ctx.closePath();
	ctx.stroke();
	ctx.restore();
};

const drawAllCircles = () => {
	const radiusStep = (radiusMax - radiusMin) / (numCircles - 1);
	const phase = performance.now() * 0.0001;

	for (let i = 0; i < numCircles; i++) {
		const circlePhase = i / numCircles;
		const circlePhase2 = circlePhase + phase;

		const radiusPhase = Math.abs(Math.sin(circlePhase2));

		const radius = radiusMin + (radiusPhase * (radiusMax - radiusMin));

		drawCircle(radius, i / (numCircles - 1));
	}
};

const loop = () => {
	clear();

	drawAllCircles();

	// requestAnimationFrame(loop);
};

loop();
