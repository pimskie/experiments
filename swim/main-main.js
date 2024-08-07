const simplex = new SimplexNoise();

const clamp = (value, min, max) => Math.max(min, Math.min(value, max));

const getDistanceBetween = (vec1, vec2) => Math.hypot(vec2.x - vec1.x, vec2.y - vec1.y);
const getAngleDifference = (x, y) => Math.atan2(Math.sin(x - y), Math.cos(x - y));
const getAngleBetween = (vec1, vec2) => Math.atan2(vec2.y - vec1.y, vec2.x - vec1.x);

const canvas = document.querySelector('.js-canvas');
const ctx = canvas.getContext('2d');

const PI = Math.PI;
const TAU = PI * 2;

const width = window.innerWidth;
const height = window.innerHeight;

const midX = width >> 1;
const midY = height >> 1;
const hypot = Math.hypot(midX, midY);

canvas.width = width;
canvas.height = height;

let phase = 0;
const phaseSpeed = 0.005;

const pointer = { x: 0, y: 0 };
const position = { x: midX, y: midY };

const numStickers = 100;
const numPoints = 100;
const radius = 100;


const draw = (ctx) => {
	for (let q = 0; q < numStickers; q++) {
		const stickerRadius = 200 + (q * 50);

		ctx.save();
		ctx.translate(position.x, position.y);

		ctx.beginPath();
		ctx.strokeStyle = 'black';

		for (let i = 0; i < numPoints; i++) {
			const angle = TAU / numPoints * i;
			const originalX = Math.cos(angle) * radius;
			const originalY = Math.sin(angle) * radius;

			const distance = getDistanceBetween(pointer, { x: originalX, y: originalY });
			const forceDistance = 1 - clamp(distance / 500, 0, 1);
			const forceX = clamp((pointer.x - originalX) / midX, -1, 1) * forceDistance;
			const forceY = clamp((pointer.y - originalY) / midY, -1, 1) * forceDistance;

			const ampX = forceX * stickerRadius;
			const ampY = forceY * stickerRadius;

			const newX = originalX - ampX;
			const newY = originalY - ampY;

			const m = i === 0 ? 'moveTo' : 'lineTo';

			ctx[m](newX, newY);
		}

		ctx.closePath();
		ctx.stroke();
		ctx.restore();
	}
};

const loop = () => {
	ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

	draw(ctx);

	phase += phaseSpeed;

	requestAnimationFrame(loop);
};

canvas.addEventListener('pointermove', (e) => {
	const target = (e.touches && e.touches.length) ? e.touches[0] : e;

	pointer.x = target.clientX - midX;
	pointer.y = target.clientY - midY;
});
loop();

