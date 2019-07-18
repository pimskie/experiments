class Grid {
	constructor({ width, height, cols, rows }) {
		this.width = width;
		this.height = height;

		this.cols = cols;
		this.rows = rows;

		this.spacingX = this.width / this.cols;
		this.spacingY = this.height / this.rows;
	}

	draw(ctx) {
		ctx.strokeStyle = '#aaa';

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
}

export default Grid;
