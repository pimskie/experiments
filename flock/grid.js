import { wrappBBox } from 'https://rawgit.com/pimskie/utils/master/utils.js?d=44';

class Grid {
	constructor({ width, height, cols, rows }) {
		this.width = width;
		this.height = height;

		this.cols = cols;
		this.rows = rows;

		this.spacingX = this.width / this.cols;
		this.spacingY = this.height / this.rows;

		console.log(this.cols * this.rows)
	}

	draw(ctx) {
		ctx.strokeStyle = '#484848';

		for (let x = 0; x < this.width; x += this.spacingX) {
			this.drawLine(ctx, { x, y: 0 }, { x, y: this.height });
		}

		for (let y = 0; y < this.height; y += this.spacingY) {
			this.drawLine(ctx, { x: 0, y }, { x: this.width, y });
		}
	}

	drawLine(ctx, from, to) {
		ctx.beginPath();
		ctx.moveTo(from.x, from.y);
		ctx.lineTo(to.x, to.y);
		ctx.stroke();
		ctx.closePath();
	}

	getCellIndex({ x = 0, y = 0 }) {
		const col = Math.ceil(x / this.spacingX);
		const row = Math.ceil(y / this.spacingY);

		const index = (Math.max(0, row - 1) * this.cols) + col;

		return index;
	}

	getRegionCells(position) {
		const { x, y } = position;
		const { spacingX: sx, spacingY: sy, width, height } = this;

		const above = wrappBBox({ x, y: y - sy }, width, height);
		const right = wrappBBox({ x: x + sx, y }, width, height);
		const under = wrappBBox({ x, y: y + sy }, width, height);
		const left = wrappBBox({ x: x - sx, y }, width, height);

		return [
			this.getCellIndex(position),
			this.getCellIndex(above),
			this.getCellIndex(right),
			this.getCellIndex(under),
			this.getCellIndex(left),
		];
	}
}

export default Grid;
