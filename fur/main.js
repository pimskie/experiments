const ctx = document.querySelector('canvas').getContext('2d');
const size = 500;
const cols = 10;
const rows = cols;
const squareSize = Math.round(size / cols);

ctx.canvas.width = size;
ctx.canvas.height = size;

let simplex;
const noiseScale = 0.3;

const clear = () => ctx.clearRect(0, 0, size, size);

const drawHairs = (squareX, squareY, noise) => {
	const count = 100;

	for (let i = 0; i < count; i++) {
		const margin = squareSize * 0.5;

		const localX = (squareX - margin) + ((squareSize + margin) * Math.random());
		const localY = (squareY - margin) + ((squareSize + margin) * Math.random());
		const localNoise = simplex.noise2D(localX * noiseScale, localY * noiseScale);

		const length = (squareSize / 2) + (localNoise * (squareSize / 2));
		const angle = Math.PI * 2 * (noise + (localNoise * 0.1));

		ctx.save();
		ctx.beginPath();
		ctx.moveTo(localX, localY);
		ctx.lineTo(localX + (Math.cos(angle) * length), localY + (Math.sin(angle) * length));
		ctx.stroke();
		ctx.closePath();
		ctx.restore();
	}
};

const generate = () => {
	clear();

	simplex = new SimplexNoise();

	new Array(cols * rows).fill().map((_, i) => {
		const col = (i % cols);
		const row = Math.floor(i / cols);

		const x = col * squareSize;
		const y = row * squareSize;

		const noise = simplex.noise2D(col * noiseScale, row * noiseScale);
		const color = `rgba(0, 0, 0, ${noise})`;

		// ctx.fillStyle = color;
		// ctx.beginPath();
		// ctx.rect(x, y, squareSize, squareSize);
		// ctx.closePath();
		// ctx.fill();

		drawHairs(x, y, noise);
	});

};


document.body.addEventListener('click', generate);
generate();
