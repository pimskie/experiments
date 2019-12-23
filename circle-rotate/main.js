const canvas = document.querySelector('.js-canvas');
const ctx = canvas.getContext('2d');

const PI = Math.PI;
const TAU = PI * 2;

const width = window.innerWidth;
const height = window.innerHeight;

const midX = width >> 1;
const midY = height >> 1;

canvas.width = width;
canvas.height = height;

let phase = 0;
const numCircles = 20;
const radius = 200;
const radiusHalf = radius * 0.5;

const loop = () => {
	ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

	const mod = 2 + Math.cos(phase);

	for (let i = 0; i < numCircles; i++) {
		const angle = (PI / numCircles) * i;

		ctx.save();
		ctx.translate(midX, midY);
		ctx.rotate(angle);
		ctx.strokeStyle = 'rgba(0, 0, 0, 0.3)';

		const circleCos = Math.abs(Math.cos((i / numCircles / mod) * PI + phase));
		const radiusX = radius
		const radiusY = radiusHalf * circleCos;

		ctx.beginPath();
		ctx.ellipse(0, 0, radiusX, radiusY, 0, 0, TAU, false);
		ctx.closePath();
		ctx.stroke();

		ctx.restore();
	}


	phase += 0.01;

	requestAnimationFrame(loop);
};

loop();
