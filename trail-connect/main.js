const qs = (sel) => document.querySelector(sel);

const canvas = qs('canvas');
const ctx = canvas.getContext('2d');
const PI = Math.PI;
const PI2 = PI * 2;

// all set in `setStage`
const width = window.innerWidth;
const height = window.innerHeight;
const midX = width >> 1;
const midY = height >> 1;

const maxPoints = 100;
const points = [];

const pointer = {
	x: midX,
	y: midY,
};

canvas.width = width;
canvas.height = height;

const distanceBetween = (v1, v2) => Math.sqrt((v1.x - v2.x) * (v1.x - v2.x) + (v1.y - v2.y) * (v1.y - v2.y));
const angleBetween = (v1, v2) => Math.atan2(v2.y - v1.y, v2.x - v1.x);

const clear = () => {
	// ctx.globalCompositeOperation = 'destination-out';
	ctx.fillStyle = 'hsla(0, 0%, 100%, 0.01)';
	ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
	// ctx.globalCompositeOperation = 'lighter';
};

const loop = () => {
	// clear();

	requestAnimationFrame(loop);
};

const onPointerMove = (e) => {
	const target = (e.touches && e.touches.length) ? e.touches[0] : e;
	const { clientX: x, clientY: y } = target;
	const newPointer = { x, y };
	const velocity = distanceBetween(newPointer, pointer);
	const angle = angleBetween(newPointer, pointer);

	pointer.x = newPointer.x;
	pointer.y = newPointer.y;

	points.push({
		x,
		y,
		velocity,
		angle,
	});

	if (points.length > 1) {
		const from = points[points.length - 2];
		const to = points[points.length - 1];
		const r = 2;

		ctx.beginPath();
		ctx.arc(from.x, from.y, r * 2, 0, PI2, false);
		ctx.fill();
		ctx.closePath();

		ctx.beginPath();
		ctx.moveTo(from.x, from.y);
		ctx.lineTo(to.x, to.y);
		ctx.stroke();
		ctx.closePath();

		if (points.length > maxPoints) {
			points.splice(0, maxPoints - points.length);
		}
	}
};

canvas.addEventListener('mousemove', onPointerMove);
canvas.addEventListener('touchmove', onPointerMove);

loop();
