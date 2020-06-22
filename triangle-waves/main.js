const ctxShape = document.createElement('canvas').getContext('2d');
const ctx = document.querySelector('canvas').getContext('2d');

// document.body.appendChild(ctxShape.canvas);
const size = 500;
const speed = 2;

const cols = 5;
const rows = cols * 2;

const tileWidth = size / cols;
const tileHeight = tileWidth * 0.5;
const shapeSize = tileWidth;
const shapeDistance = tileHeight + 40;

ctx.canvas.width = size;
ctx.canvas.height = size;

ctxShape.canvas.width = tileWidth;
ctxShape.canvas.height = tileHeight;

const settings = {
	line: '#000',
	fill: '#fff',
};

const clear = () => {
	ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
	ctxShape.clearRect(0, 0, ctxShape.canvas.width, ctxShape.canvas.height);
};

let position = 0;
const lineWidth = 10;

const drawTile = () => {
	drawShape(position);
	drawShape(position + shapeDistance);
};

const drawShape = (position) => {
	ctxShape.lineWidth = lineWidth;
	ctxShape.strokeStyle = settings.line;
	ctxShape.fillStyle = settings.fill;

	ctxShape.save();
	ctxShape.translate(tileWidth * 0.5, position);
	ctxShape.rotate(45 * (Math.PI / 180));

	ctxShape.beginPath();

	ctxShape.rect(0, 0, shapeSize * 1.5, shapeSize * 1.5);
	ctxShape.closePath();
	ctxShape.fill();
	ctxShape.stroke();

	ctxShape.restore();
};

const loop = () => {
	clear();

	drawTile();

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

	if (position < -shapeDistance ) {
		position = 0;
	}

	requestAnimationFrame(loop);
};

loop();

gsap.to(settings, {
	line: '#fff',
	fill: '#000',
	yoyo: true,
	repeat: -1,
	duration: 3
});
