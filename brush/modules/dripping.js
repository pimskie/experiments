class Dripping {
	constructor(position, size, color, velocity) {
		this.from = {
			x: position.x,
			y: position.y,
		};

		this.color = color;
		this.size = size;
		this.velocity = velocity;

		this.isDead = false;
	}

	draw(ctx) {
		const toX = this.from.x;
		const toY = this.from.y + this.velocity;

		ctx.beginPath();
		ctx.fillStyle = this.color;
		ctx.lineWidth = this.size;
		ctx.lineCap = 'round';

		ctx.moveTo(this.from.x, this.from.y);
		ctx.lineTo(toX, toY);
		ctx.stroke();
		ctx.closePath();

		this.from.x = toX;
		this.from.y = toY;

		this.velocity *= 0.99;

		if (this.velocity < 0.1) {
			this.isDead = true;
		}
	}
}

export default Dripping;
