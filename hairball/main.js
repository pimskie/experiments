import { createNoise3D } from 'https://unpkg.com/simplex-noise@4.0.1/dist/esm/simplex-noise.js';

const DIMENSION = 400;
const MID = DIMENSION * 0.5;
const R = MID * 0.95;
const NOISE_SCALE = 0.001;
const TAU = Math.PI * 2;

const ab = (vec1, vec2) => Math.atan2(vec2.y - vec1.y, vec2.x - vec1.x);
const rand = (min, max) => Math.random() * (max - min) + min;
const ctx = document.querySelector('#canvas').getContext('2d');

const noise3D = createNoise3D();

ctx.canvas.width = ctx.canvas.height = DIMENSION;

const hairs = Array.from({ length: 5000 }, (_, i) => ({ x: rand(-R, R), y: rand(-R, R) }));

const loop = () => {
	ctx.clearRect(0, 0, DIMENSION, DIMENSION);

	for (let i = 0; i < hairs.length; i++) {
		const { x, y } = hairs[i];

		const angle = noise3D((x * NOISE_SCALE), y * NOISE_SCALE, performance.now() * 0.0001) * TAU;
		const lengthStatic = 50;

		const angleBetween = ab({ x, y }, {
			x: x + (Math.cos(angle) * lengthStatic),
			y: y + (Math.sin(angle) * lengthStatic),
		});

		const length = angleBetween * 10;

		const endX = x + (Math.cos(angle) * length);
		const endY = y + (Math.sin(angle) * length);

		ctx.save();
		ctx.translate(MID, MID);
		ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
		ctx.beginPath();
		ctx.moveTo(x, y);
		ctx.lineTo(endX, endY);

		ctx.closePath();
		ctx.stroke();
		ctx.restore();
	}

	requestAnimationFrame(loop);
};


loop();
