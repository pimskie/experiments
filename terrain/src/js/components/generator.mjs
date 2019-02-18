// https://www.npmjs.com/package/simplex-noise
import SimplexNoise from 'simplex-noise';

const norm = (val, min, max) => (val - min) / (max - min);
const simplex = new SimplexNoise(Math.random());

class Generator {
	constructor(el) {
		this.el = el;

		const canvas = this.el.querySelector('[data-ref=canvas]');
		const { offsetWidth: width, offsetHeight: height } = canvas;

		this.ctx = canvas.getContext('2d');
		this.cellSize = 1;

		this.cols = Math.ceil(width / this.cellSize);
        this.rows = Math.ceil(height / this.cellSize);

		this.phase = 0;
	}

	update(isFlying = true) {
		const numLoops = this.rows * this.cols;
		const scale = 0.05;

		let x = 0;
		let y = 0;

		const values = [];

		for (let i = 0; i < numLoops; i++) {
			const noiseX = x * scale;
			const noiseY = y * scale;

			let noiseValue;

			noiseValue = simplex.noise2D(noiseX, noiseY - this.phase);

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
			this.phase += 0.02;
		}

		return values;
	}
}

export default Generator;
