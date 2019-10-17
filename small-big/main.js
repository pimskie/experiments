const simplex = new SimplexNoise(Math.random());
const clamp = (value, min, max) => Math.max(min, Math.min(value, max));

const ctx = document.querySelector('.js-canvas').getContext('2d');
const { canvas } = ctx;

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const reset = () => {
	draw(ctx, { x: ctx.canvas.width * 0.25, y: ctx.canvas.height * 0.5 });
};

const drawCircle = (ctx, position, radius, color) => {
	ctx.fillStyle = color;
	ctx.strokeStyle = color;

	ctx.beginPath();
	ctx.arc(position.x, position.y, radius, 0, Math.PI * 2);
	ctx.stroke();
	ctx.fill();
	ctx.closePath();
};

const clear = (ctx) => {
	ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
};

const draw = (ctx, position) => {
	clear(ctx);

	const { canvas: { width, height } } = ctx;
	const cy = height * 0.5;

	const radius1 = Math.min(position.x * 0.5, width * 0.5);
	const radius2 = (width - (radius1 * 2)) * 0.5;

	drawCircle(ctx, { x: radius1, y: cy }, radius1, '#000');
	drawCircle(ctx, { x: width - radius2, y: cy }, radius2, 'red');
};

const onPointerMove = (e) => {
	const x = e.clientX - e.target.offsetLeft;
	const y = e.clientY - e.target.offsetTop;

	draw(ctx, { x, y });
};

canvas.addEventListener('pointermove', onPointerMove);

window.addEventListener('resize', () => {
	canvas.width = window.innerWidth;
	canvas.height = window.innerHeight;

	reset();
});

reset();
