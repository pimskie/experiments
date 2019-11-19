const simplex = new SimplexNoise();

const canvas = document.querySelector('.js-canvas');
const ctx = canvas.getContext('2d');

const width = window.innerWidth;
const height = window.innerHeight;

canvas.width = width;
canvas.height = height;

let phase = 0;
const phaseSpeed = 0.001;

const detail = 100;
const amp = 30;
const padding = 0;
const spacing = 4;
let lineY = padding;

const connect = (ctx, points, alpha, width) => {
	ctx.save();

	ctx.beginPath();
	ctx.strokeStyle = `rgba(255, 255, 255, ${alpha})`;
	ctx.lineWidth = width;

	points.forEach(({ x, y }, i) => {
		const m = i === 0 ? 'moveTo' : 'lineTo';

		ctx[m](x, y);
	});

	ctx.stroke();
	ctx.closePath();
	ctx.restore();
};

const reset = () => {
	ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

	lineY = padding;
};

const loop = () => {
	const percent = lineY / height;
	const alpha = 0.1 + (0.9 * percent);
	const lineWidth = 0.5 + (3 * percent);

	if (lineY < height + amp) {
		const points = new Array(detail).fill().map((_, i) => {
			const x = (width / detail) * i;
			const y = lineY + (simplex.noise3D(x * 0.005, lineY * 0.005, phase) * amp);

			return { x, y };
		});

		connect(ctx, points, alpha, lineWidth);
		lineY += spacing;
	}

	phase += phaseSpeed;

	requestAnimationFrame(loop);
};

loop();

canvas.addEventListener('click', reset);
