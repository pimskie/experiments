import { wrappBBox } from 'https://rawgit.com/pimskie/utils/master/utils.js?d=44';

class Grid {
	constructor({ width, height, space }) {
		this.space = space;

		this.setSize(width, height);
	}

	setSize(width, height) {
		this.width = width;
		this.height = height;

		this.cols = Math.ceil(this.width / this.space);
		this.rows = Math.ceil(this.height / this.space);
		this.numCells = this.cols * this.rows;
	}

	draw(ctx) {
		ctx.strokeStyle = '#484848';
		ctx.lineWidth = 0.5;

		for (let x = 0; x < this.width; x += this.space) {
			this.drawLine(ctx, { x, y: 0 }, { x, y: this.height });
		}

		for (let y = 0; y < this.height; y += this.space) {
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
		const col = Math.ceil(x / this.space);
		const row = Math.ceil(y / this.space);

		const index = (Math.max(0, row - 1) * this.cols) + col;

		return index;
	}

	getRegionCells(position) {
		const { x, y } = position;
		const { space } = this;

		const above = { x, y: y - space };
		const right = { x: x + space, y };
		const under = { x, y: y + space };
		const left = { x: x - space, y };

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
