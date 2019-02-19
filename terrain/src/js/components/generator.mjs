// https://www.npmjs.com/package/simplex-noise
import SimplexNoise from 'simplex-noise';

const norm = (val, min, max) => (val - min) / (max - min);
const simplex = new SimplexNoise(Math.random());

const SIZE = 100;

class Generator {
	constructor(el) {
		this.el = el;

		const canvas = this.el.querySelector('[data-ref=canvas]');

		const width = SIZE;
		const height = SIZE;

		canvas.width = width;
		canvas.height = height;

		this.ctx = canvas.getContext('2d');
		this.cellSize = 1;

		this.cols = Math.ceil(width / this.cellSize);
		this.rows = Math.ceil(height / this.cellSize);

		this.phase = 0;
		this.phaseX = 0;
		this.phaseY = 0;

		this.speed = 0.05;
	}

	update(isFlying = true, angle = 0) {
		const numLoops = this.rows * this.cols;
		const scale = 0.05;

		let x = 0;
		let y = 0;

		const values = [];

		for (let i = 0; i < numLoops; i++) {
			const noiseX = x * scale;
			const noiseY = y * scale;

			const noiseValue = simplex.noise2D(noiseX - this.phaseX, noiseY - this.phaseY);

			const color = 255 * (norm(noiseValue, -1, 1));

			this.ctx.fillStyle = `rgb(${color}, ${color}, ${color})`;
			this.ctx.beginPath();
			this.ctx.rect(x, y, this.cellSize, this.cellSize);
			this.ctx.fill();
			this.ctx.closePath();

			x += this.cellSize;

			if (i > 0 && i % this.cols === 0) {
				y += this.cellSize;
				x = 0;
			}

			values.push(noiseValue);
		}

		if (isFlying) {
			this.phase += this.speed;

			this.phaseX += Math.cos(angle) * this.speed;
			this.phaseY += Math.sin(angle) * this.speed;
		}

		return values;
	}
}

export default Generator;
export { SIZE };
