const TAU = Math.PI * 2;

class Wheel {
	constructor({ position, r, angle = 0, speed = 0.04, yoyo = false, paintCtx = null } = options) {
		this.position = position;

		this.r = r;
		this.speed = speed;
		this.angle = angle;
		this.yoyo = yoyo;

		this.arms = [];
		this.iteration = 0;
		this.iterationsFullRound = Math.ceil(TAU / this.speed);

		this.from = {
			x: this.position.x + (Math.cos(this.angle) * this.r),
			y: this.position.y + (Math.sin(this.angle) * this.r),
		};

		this.to = {
			x: this.from.x,
			y: this.from.y,
		};
	}

	addArms(arms) {
		this.arms = this.arms.concat(arms);

		return this;
	}

	update(parentPosition = this.position) {
		this.position.x = parentPosition.x;
		this.position.y = parentPosition.y;

		this.from.x = this.to.x;
		this.from.y = this.to.y;

		this.to.x = this.position.x + (Math.cos(this.angle) * this.r);
		this.to.y = this.position.y + (Math.sin(this.angle) * this.r);

		this.angle += this.speed;

		this.iteration++;

		if (this.yoyo && this.iteration > 0 && (this.iteration % this.iterationsFullRound === 0)) {
			this.iteration = 0;
			this.speed *= -1;
		}

		this.arms.forEach(arm => arm.update(this.to));
	}

	draw(ctx, ctxTrail) {
		this.drawSelf(ctx);
		this.drawTrail(ctxTrail);

		this.arms.forEach(arm => arm.draw(ctx, ctxTrail));
	}

	drawSelf(ctx) {
		ctx.beginPath();
		ctx.strokeStyle = 'rgba(0, 0, 0, 1)';
		ctx.arc(this.position.x, this.position.y, this.r, 0, TAU, false);
		ctx.stroke();
		ctx.closePath();

		ctx.beginPath();
		ctx.arc(this.to.x, this.to.y, 4, 0, TAU, false);
		ctx.fill();
		ctx.closePath();
	}

	drawTrail(ctxTrail) {
		if (this.arms.length) {
			return;
		}

		ctxTrail.strokeStyle = 'rgba(100, 100, 100, 1)';
		ctxTrail.lineWidth = 0.5;
		ctxTrail.beginPath();
		ctxTrail.moveTo(this.from.x, this.from.y);
		ctxTrail.lineTo(this.to.x, this.to.y);
		ctxTrail.closePath();
		ctxTrail.stroke();
	}
}

export default Wheel;
