class Spring {
	constructor(x, y, k, damp) {
		this.x = x;
		this.y = y;

		this.k = k;
		this.damp = damp;

		this.velX = 0;
		this.velY = 0;

		this.length = 0;

		this.width = 1;
	}

	update(destX, destY, pivotX, pivotY) {
		this.velX += -this.k * (this.x - destX);
		this.velX *= this.damp;

		this.velY += -this.k * (this.y - destY);
		this.velY *= this.damp;

		let newX = this.x + this.velX;
		let newY = this.y + this.velY;

		this.x = newX;
		this.y = newY;
	}
}
