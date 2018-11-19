import * as Utils from 'https://rawgit.com/pimskie/utils/master/utils.js';

const ctx = Utils.qs('.js-canvas').getContext('2d');
const ctxGhost = Utils.qs('.js-canvas-ghost').getContext('2d');

const W = Utils.clamp(window.innerWidth - 150, 200, 500);
const H = W;

const MID_X = W * 0.5;
const MID_Y = H * 0.5;

const PIPI = Math.PI * 2;

const MAGIC_SCALE_NUMBER = 0.76;

ctx.canvas.width = W;
ctx.canvas.height = H;
ctxGhost.canvas.width = W;
ctxGhost.canvas.height = H;

const NUM_EDGES = 6;
const NUM_SHAPES = 100;

const points = new Array(NUM_EDGES).fill().map((_, i) => {
	const x = Math.cos(i * (PIPI / NUM_EDGES)) * MID_X;
	const y = Math.sin(i * (PIPI / NUM_EDGES)) * MID_X;

	return { x, y };
});

const shapes = new Array(NUM_SHAPES).fill().map((_, i) => {
	const shapeScale = Math.pow(MAGIC_SCALE_NUMBER, i);
	const rotation = i * 45 * (180 / Math.PI);

	const shape = {
		points,
		rotation,
		scale: shapeScale,
		scaleOrig: shapeScale,
	};

	return shape;
});

const draw = (ctx, points, iteration = 0, scale = 1) => {
	const color = iteration % 2 === 0 ? '#000' : '#fff';
	const rotation = (iteration + 1) * 90 * (Math.PI / 180);

	ctx.fillStyle = color;

	ctx.save();
	ctx.translate(MID_X, MID_Y);
	ctx.scale(scale, scale);
	ctx.rotate(rotation);

	ctx.beginPath();
	ctx.moveTo(points[0].x, points[0].y)

	for (let i = 1; i < points.length; i++) {
		ctx.lineTo(points[i].x, points[i].y)
	}

	ctx.fill();
	ctx.closePath();

	ctx.restore();
};

const clear = (ctx) => {
	ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
};

// using `xor` to make inner transparent
draw(ctxGhost, points, 0, 1);
draw(ctxGhost, points, 1, 0.86);

const duplicate = (scale, rotation) => {
	ctx.save();
	ctx.translate(MID_X, MID_Y);

	ctx.scale(scale, scale);

	ctx.rotate(rotation);
	ctx.drawImage(ctxGhost.canvas, -MID_X, -MID_Y);

	ctx.restore();
};

const loop = () => {
	clear(ctx);

	for (let i = 0; i < shapes.length; i++) {
		const shape = shapes[i];

		shape.scale *= 1.01;

		duplicate(shape.scale, shape.rotation);

		if (shape.scale>= 2) {
			shape.scale = Math.pow(MAGIC_SCALE_NUMBER, shapes.length);
		}
	}

	requestAnimationFrame(loop);
};

loop();
