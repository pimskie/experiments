import * as Utils from 'https://rawgit.com/pimskie/utils/master/utils.js';

const colors = new Map()
	.set('odd', 'red')
	.set('even', 'green');

const ctx = Utils.qs('canvas').getContext('2d');
const TAU = Math.PI * 2;

const W = 700;
const H = 700;

const COLS = 50;
const ROWS = COLS;

const SPACING = W / COLS;

ctx.canvas.width = W;
ctx.canvas.height = H;

const clear = () => {
	ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
};

const drawDot = (x, y, color, radius = 5) => {
	ctx.save();
	ctx.translate(x, y);
	ctx.fillStyle = color;
	ctx.beginPath();
	ctx.arc(-radius / 2, -radius / 2, radius, 0, Math.PI * 2);
	ctx.closePath();
	ctx.fill();
	ctx.restore();
};

const drawLine = (from, to, color) => {
	ctx.save();
	ctx.strokeStyle = color;
	ctx.beginPath();
	ctx.moveTo(from.x, from.y);
	ctx.lineTo(to.x, to.y);
	ctx.closePath();
	ctx.stroke();
	ctx.restore();
};


const createGrid = () => {
	const horizontals = new Array(COLS).fill().map((_, i) => {
			const side = Math.random() > 0.5 ? 'odd' : 'even';
			const color = colors.get(side);
			const position = i * SPACING;

			return { side, color, position };
	});

	const verticals = new Array(ROWS).fill().map((_, i) => {
		const side = Math.random() > 0.5 ? 'odd' : 'even';
		const color = colors.get(side);
		const position = i * SPACING;

		return { side, color,position };
	});

	return { horizontals, verticals };
};

const draw = () => {
	clear();

	const { horizontals, verticals } = createGrid();

	horizontals.forEach(({ position: x, side }, index) => {
		const offsetIndexY = side === 'even' ? 0 : 1;
		const color = colors.get(side);

		for (let i = offsetIndexY; i < verticals.length; i += 2) {
			const { position: y } = verticals[i];
			const from = { x, y };
			const to = { x, y: y + SPACING };

			drawLine(from, to, '#000');
		}
	});

	verticals.forEach(({ position: y, side }, index) => {
		const offsetIndexX = side === 'even' ? 0 : 1;
		const color = colors.get(side);

		for (let i = offsetIndexX; i < horizontals.length; i += 2) {
			const { position: x } = horizontals[i];
			const from = { x, y };
			const to = { x: x + SPACING, y };

			drawLine(from, to, '#000');
		}
	});

};

draw();
setInterval(draw, 1000)
