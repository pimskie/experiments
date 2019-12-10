const simplex = new SimplexNoise();

const canvas = document.querySelector('.js-canvas');
const ctx = canvas.getContext('2d');

const TAU = Math.PI * 2;

const width = 500;
const height = 500;

const midX = width >> 1;
const midY = height >> 1;

canvas.width = width;
canvas.height = height;

let frame = 0;
let angle = 0;
let phase = 0;
const phaseSpeed = 0.005;

const numCircles = ~~midX;
const radiusMin = 10;
const radiusMax = midX * 0.9;
const radiusStep = (radiusMax - radiusMin) / numCircles;

const angleMin = TAU * 0.2;
const angleMax = TAU;
const angleStep = (angleMax - angleMin) / numCircles;

const circles = new Array(numCircles).fill().map((_, i) => {
	const percent = (i + 1) / numCircles;
	const lightness = 50 - (25 * percent);
	const alpha = 1 - (0.5 - percent);
	const width = 4 - (3.5 * percent);

	const radius = radiusMin + (radiusStep * (i + 1));

	const angle = (Math.pow(i * 0.1, percent));
	const length = Math.PI * percent;
	const lengthInitial = length;

	const animProperty = 'angle';

	return { radius, angle, length, lengthInitial, percent, lightness, alpha, width, animProperty };
});

const draw = ({ radius, angle, length, lightness, alpha, width }) => {
	ctx.save();
	ctx.translate(midX, midY);
	ctx.rotate(0);

	ctx.lineWidth = width;
	ctx.strokeStyle = `hsla(0, 100%, ${lightness}%, ${alpha})`;

	ctx.beginPath();
	ctx.arc(0, 0, radius, angle, length, false);
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

		circle[circle.animProperty] += 0.05;

		if (circle.animProperty === 'angle' && circle.angle >= circle.length) {
			circle.animProperty = 'length';
			circle.length = circle.angle;
			circle.to = circle.angle + circle.lengthInitial;
		}

		if (circle.animProperty === 'length' && circle.length >= circle.to) {
			circle.animProperty = 'angle';
		}
	});

	angle += 0.01;
	frame += 1;
	phase += phaseSpeed;

	requestAnimationFrame(loop);
};

loop();

