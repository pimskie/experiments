const canvas = document.querySelector('.js-canvas');
const ctx = canvas.getContext('2d');

const TAU = Math.PI * 2;

const width = 500;
const height = 500;

const midX = width >> 1;
const midY = height >> 1;

canvas.width = width;
canvas.height = height;

const numCircles = ~~midX;
const radiusMin = 10;
const radiusMax = midX * 0.9;
const radiusStep = (radiusMax - radiusMin) / numCircles;

const angleMin = TAU * 0.2;
const angleMax = TAU;
const angleStep = (angleMax - angleMin) / numCircles;

const circles = new Array(numCircles).fill().map((_, index) => {
	const percent = (index + 1) / numCircles;

	const lightness = 25;
	const alpha = 1 - percent;
	const width = 4 - (3.5 * percent);
	const radius = radiusMin + (radiusStep * (index + 1));

	const angle = (TAU * percent) + (percent * 300);
	const length = Math.PI * percent;

	return { index, radius, angle, length, percent, lightness, alpha, width };
});

const draw = ({ radius, angle, length, lightness, alpha, width }) => {
	ctx.save();
	ctx.translate(midX, midY);
	ctx.rotate(angle);

	ctx.lineWidth = width;
	ctx.strokeStyle = `hsla(0, 0%, ${lightness}%, ${alpha})`;

	ctx.beginPath();
	ctx.arc(0, 0, radius, 0, length);
	ctx.stroke();
	ctx.closePath();
	ctx.restore();
};

const clear = () => {
	ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
};

const loop = () => {
	clear();

	circles.forEach((circle, i) => {
		draw(circle);

		circle.angle += (circle.percent) * 0.09;
	});

	requestAnimationFrame(loop);
};

loop();

