// https://medium.com/@hemalatha.psna/implementation-of-poisson-disc-sampling-in-javascript-17665e406ce1
//  Robert Bridson, called Fast Poisson Disk Sampling in Arbitrary Dimensions
// https://www.cs.ubc.ca/~rbridson/docs/bridson-siggraph07-poissondisk.pdf
// Photo by <a href="https://unsplash.com/@pradologue?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText">Prado</a> on <a href="https://unsplash.com/photos/S89gVhM67lU?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText">Unsplash</a>
// https://unsplash.com/photos/S89gVhM67lU
// https://unsplash.com/photos/a-colorful-parrot-sitting-on-top-of-a-tree-branch-ArQXu1jXdpE

// https://pimskie.dev/public/assets/turban1-resized.jpg
const randomArrayValue = arr => arr[Math.floor(Math.random() * arr.length)];
const randomBetween = (min, max) => Math.random() * (max - min) + min;
const distanceBetween = (vec1, vec2) => Math.hypot(vec2.x - vec1.x, vec2.y - vec1.y);
const getPixelIndex = ({ x, y }, imageWidth) => (~~x + ~~y * imageWidth) * 4;

const PI2 = Math.PI * 2;

const ctx = document.querySelector('#canvas').getContext('2d');
class Poisson {
	constructor() {
		this.r = 5;
		this.k  = 30;
		this.cellSize = Math.floor(this.r / Math.sqrt(2));

		this.grid = [];
		this.activeList = [];

		this.width = 0;
		this.height = 0;

		this.cols = 0;
		this.rows = 0;
	}

	init(width, height) {
		this.width = width;
		this.height = height;

		this.cols = Math.ceil(width / this.cellSize) + 1;
		this.rows = Math.ceil(height / this.cellSize) + 1;

		this.grid = new Array(this.cols).fill(-1).map(() => new Array(this.rows).fill(-1));
	}

	isPointFarEnough = (point) => {
		const { col, row } = this.getGridPosition(point);

		const xmin = Math.max(col - 1, 0);
		const xmax = Math.min(col + 1, this.cols - 1);
		const ymin = Math.max(row - 1, 0);
		const ymax = Math.min(row + 1, this.rows - 1);

		for (let x = xmin; x <= xmax; x++ ) {
			for (let y = ymin; y <= ymax; y++ ) {
				const cell = this.grid[x][y];

				if (cell !== -1) {
					const distance = distanceBetween(cell, point);

					if (distance < this.r) {
						return false;
					}
				}
			}
		}

		return true;
	};

	isPointValid(point) {
		if (point.x < 0 || point.x > this.width || point.y < 0 || point.y > this.height) {
			return false;
		}

		if (!this.isPointFarEnough(point)) {
			return false;
		}

		return true;
	}

	getGridPosition = (point) => ({
		col: Math.floor(point.x / this.cellSize),
		row: Math.floor(point.y / this.cellSize),
	});

	addPointToGrid(point) {
		const { col, row } = this.getGridPosition(point);

		try {
			this.grid[col][row] = point;
		} catch(e) {
				// console.log('error', col, this.cols)
		}

		this.activeList.push(point);
	};

	tryAdd() {
		const point = randomArrayValue(this.activeList);

		let hasPoint = false;

		for (let i = 0; i < this.k; i++) {
			const angle = Math.random() * PI2;
			const length = randomBetween(this.r, this.r * 2);

			const point2 = {
				x: point.x + (Math.cos(angle) * length),
				y: point.y + (Math.sin(angle) * length),
			};

			if (this.isPointValid(point2)) {
				this.addPointToGrid(point2);

				return point2;
			}
		}

		if (!hasPoint) {
			this.activeList = this.activeList.filter(p => p !== point);

			return false;
		}
	}
}

class Visual {
	constructor(ctx) {
		this.ctx = ctx;

		this.width = 0
		this.height = 0;
		this.imageData = [];
	}

	async init(imageUrl) {
		const image = await Visual.loadImage(imageUrl);

		this.width = image.width;
		this.height = image.height;

		// resize
		this.ctx.canvas.width = this.width;
		this.ctx.canvas.height= this.height;

		// paint image, get image data and clear canvas again
		this.ctx.drawImage(image, 0, 0);
		this.imageData = this.ctx.getImageData(0, 0, this.width, this.height).data;

		this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
	}

	getPixelIndex({ x, y }) {
		return  (~~x + ~~y * this.width) * 4;
	};

	drawPoint(position) {
		const radius = 2;
		const pixelIndex = this.getPixelIndex(position);

		const rgb = [
				this.imageData[pixelIndex],
				this.imageData[pixelIndex + 1],
				this.imageData[pixelIndex + 2],
			];

		this.ctx.save();
		this.ctx.beginPath();
		this.ctx.fillStyle = `rgb(${rgb.join(', ')})`;
		this.ctx.arc((position.x), (position.y), radius, 0, PI2);

		this.ctx.closePath();
		this.ctx.fill();
		this.ctx.restore();
	}

	static loadImage(imageUrl) {
		const img = new Image();

		img.crossOrigin = '';

		return new Promise(function(resolve, reject) {
			img.addEventListener('load', () => {
				resolve(img);
			});

			img.src = imageUrl;
		});
	}
}

const start = async () => {
	let rafId = null;

	const visual = new Visual(ctx);
	await visual.init('https://pimskie.dev/public/assets/turban1-resized.jpg');

	const poisson = new Poisson();
	poisson.init(visual.width, visual.height)

	const pointInit = {
		x: visual.width >> 1,
		y: visual.height >> 1,
	};

	poisson.addPointToGrid(pointInit);
	visual.drawPoint(pointInit);

	const loop = () => {
		const pointB = poisson.tryAdd();

		if (pointB) {
			visual.drawPoint(pointB);
		}

		rafId = requestAnimationFrame(loop);
	};

	loop();
};

start();
