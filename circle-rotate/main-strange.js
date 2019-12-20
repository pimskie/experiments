const canvas = document.querySelector('.js-canvas');
const ctx = canvas.getContext('2d');

const TAU = Math.PI * 2;

const width = window.innerWidth;
const height = window.innerHeight;

const midX = width >> 1;
const midY = height >> 1;

canvas.width = width;
canvas.height = height;

let phase = 0;
const numCircles = 100;
const radius = 200;

const loop = () => {
	ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

	for (let i = 0; i < numCircles; i++) {
		const angle = (TAU / numCircles * i); // + phase;

		ctx.save();
		ctx.translate(midX, midY);
		ctx.rotate(angle);

		// const radiusX = radius * 0.25;
		const radiusX = (radius * 0.25) + (Math.cos(Math.PI * (phase) * (i / numCircles) + phase) * (radius * 0.25));
		const radiusY = radius;

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
