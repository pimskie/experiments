const ctxShape = document.createElement('canvas').getContext('2d');
const ctx = document.querySelector('canvas').getContext('2d');

const size = 500;
const speed = 2;


const cols = 5;
const rows = cols * 2;

const tileWidth = size / cols;
const tileHeight = tileWidth * 0.5;

ctx.canvas.width = size;
ctx.canvas.height = size;

ctxShape.canvas.width = tileWidth;
ctxShape.canvas.height = tileHeight;

const clear = () => {
	ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
	ctxShape.clearRect(0, 0, ctxShape.canvas.width, ctxShape.canvas.height);
};

let position = 0;
const lineWidth = tileWidth * 0.2;

const drawShape = () => {
	drawArrow(position);
	drawArrow(position + tileHeight * 1.5);
};

const drawArrow = (position) => {
	const spacing = lineWidth * 0.75;

	ctxShape.lineWidth = lineWidth;

	ctxShape.save();
	ctxShape.translate(0, position + spacing);

	ctxShape.beginPath();

	// bottom left
	ctxShape.moveTo(-spacing, tileHeight + spacing);

	// tip
	ctxShape.lineTo(tileHeight, 0);

	// bottom right
	ctxShape.lineTo(tileWidth + spacing, tileHeight + spacing);
	ctxShape.stroke();
	ctxShape.closePath();

	ctxShape.restore();
};

const loop = () => {
	clear();

	drawShape();

	for (let i = 0; i < rows; i += 1) {

		const y = i * tileHeight;
		const isFlipped = i % 2 !== 0;
		const translateY = isFlipped ? y + tileHeight : y;
		const scaleY = isFlipped ? -1 : 1;

		for (let q = 0; q < cols; q += 1) {
			const x = q * tileWidth;

			ctx.save();
			ctx.translate(x, translateY);
			ctx.scale(1, scaleY);

			ctx.drawImage(ctxShape.canvas, 0, 0);
			ctx.restore();
		}
	}

	position -= speed;

	if (position < -tileHeight * 1.5) {
		position = 0;
	}

	requestAnimationFrame(loop);
};

loop();
