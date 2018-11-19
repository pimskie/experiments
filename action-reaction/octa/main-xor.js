import * as Utils from 'https://rawgit.com/pimskie/utils/master/utils.js';

const ctx = Utils.qs('.js-canvas').getContext('2d');
const ctxGhost = Utils.qs('.js-canvas-ghost').getContext('2d');

const W = 500;
const H = 500;

const MID_X = W * 0.5;
const MID_Y = H * 0.5;

const PIPI = Math.PI * 2;

ctx.canvas.width = W;
ctx.canvas.height = H;

const draw = (ctx, points) => {
	ctx.fillStyle = '#000';

	ctx.save();
	ctx.translate(MID_X, MID_Y);

	ctx.beginPath();
	ctx.moveTo(points[0].x, points[0].y)

	for (let i = 1; i < points.length; i++) {
		ctx.lineTo(points[i].x, points[i].y)
	}

	ctx.fill();
	ctx.closePath();

	ctx.restore();
};

const NUM_EDGES = 6;
const NUM_SHAPES = 30;

let scale = 1;
const points = new Array(NUM_EDGES).fill().map((_, i) => {
	const x = Math.cos(i * (PIPI / NUM_EDGES)) * MID_X;
	const y = Math.sin(i * (PIPI / NUM_EDGES)) * MID_X;

	return { x, y };
});

draw(ctxGhost, points, 0, scale);

ctx.globalCompositeOperation = 'xor';

for (let i = 0; i < NUM_SHAPES; i++) {
	const rotation = i * 40 * (Math.PI / 180);

	ctx.save();
	ctx.translate(MID_X, MID_Y);
	ctx.rotate(rotation);
	ctx.scale(scale, scale);

	ctx.drawImage(ctxGhost.canvas, -MID_X, -MID_Y);

	scale *= 0.88;

	ctx.restore();
}
