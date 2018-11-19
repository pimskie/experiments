import * as Utils from 'https://rawgit.com/pimskie/utils/master/utils.js';

const ctx = Utils.qs('.js-canvas').getContext('2d');
const ctxGhost = Utils.qs('.js-canvas-ghost').getContext('2d');

const W = Utils.clamp(window.innerWidth - 150, 200, 500);
const H = W;

const MID_X = W * 0.5;
const MID_Y = H * 0.5;

const PI = Math.PI;
const PIPI = PI * 2;

ctx.canvas.width = ctxGhost.canvas.width = W;
ctx.canvas.height = ctxGhost.canvas.height = H;

const MAGIC_SCALE_NUMBER = 0.85;
const NUM_EDGES = 8;
const NUM_SHAPES = 30;

const points = new Array(NUM_EDGES).fill().map((_, i) => {
	const angle = i * (PIPI / NUM_EDGES);

	return {
		x: Math.cos(angle) * MID_X,
		y: Math.sin(angle) * MID_Y,
	};
});

const shapes = new Array(NUM_SHAPES).fill().map((_, i) => {
	return {
		rotation: (i / NUM_SHAPES) * PIPI,
		scale: Math.pow(MAGIC_SCALE_NUMBER, i),
	};
});

const draw = (ctx, points, rotation = 0, scale = 1) => {
	ctx.fillStyle = '#000';

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

const duplicateCanvas = (ctxFrom, ctxTo, scale = 1, rotation = 0) => {
	ctxTo.save();
	ctxTo.translate(MID_X, MID_Y);

	ctxTo.rotate(rotation);
	ctxTo.scale(scale, scale);

	ctxTo.drawImage(ctxFrom.canvas, -MID_X, -MID_Y);
	ctxTo.restore();
};

const loop = () => {
	ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

	shapes.forEach((shape, i) => {
		const { scale, rotation } = shape;

		duplicateCanvas(ctxGhost, ctx, scale, rotation);

		shape.scale *= 1.01;
		// shape.rotation += i % 2 === 0 ? 0.005 : -0.005;

		if (shape.scale >= 2) {
			shape.scale = Math.pow(MAGIC_SCALE_NUMBER, shapes.length);
		}
	});

	requestAnimationFrame(loop);
};

// draw shape on hidden canvas
// using `xor` to make inner of shape transparent
// https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/globalCompositeOperation
ctxGhost.globalCompositeOperation = 'xor';

draw(ctxGhost, points, 0, 1);
draw(ctxGhost, points, 40 * Math.PI / 180, 0.9);



loop();
