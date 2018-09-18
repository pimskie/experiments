const TAU = Math.PI * 2;

import Instrument from './Instrument.js';

class Wheel extends Instrument {
	constructor({ position = { x: 0, y : 0 }, r, angle = 0, speed = 0.04, paint = false, half = false, yoyo = false } = options) {
		super();

		if (!r) {
			throw Error('Wheel: need a radius (r)');
		}

		this.position = position;

		this.r = r;
		this.speed = speed;
		this.paint = paint;

		if (yoyo && half) {
			console.warn('Only enable either yoyo or half, chosen for yoyo');
			half = false;
		}

		this.yoyo = yoyo;
		this.half = half;

		this.angle = angle;
		this.anchorAngle = 0;

		this.instruments = [];
		this.phase = angle;

		this.from = {
			x: this.position.x + (Math.cos(this.angle) * this.r),
			y: this.position.y + (Math.sin(this.angle) * this.r),
		};

		this.to = {
			x: this.from.x,
			y: this.from.y,
		};
	}

	update(parent) {
		this.position.x = parent ? parent.to.x : this.position.x;
		this.position.y = parent ? parent.to.y : this.position.y;

		this.from.x = this.to.x;
		this.from.y = this.to.y;

		this.to.x = this.position.x + (Math.cos(this.angle) * this.r);
		this.to.y = this.position.y + (Math.sin(this.angle) * this.r);

		if (this.half) {
			this.angle = Math.sin(this.phase) * (Math.PI / 2);
		} else if (this.yoyo) {
			this.angle = Math.sin(this.phase) * (Math.PI);
		} else {
			this.angle += this.speed;
		}

		this.iteration++;
		this.phase += this.speed;

		this.angleOut = this.angle;

		this.instruments.forEach(arm => arm.update(this));
	}

	drawSelf(ctx) {
		const drawAngleFrom = this.half ? this.anchorAngle - (Math.PI / 2) : 0;
		const drawAngleTo = this.half ? this.anchorAngle + (Math.PI / 2) : Math.PI * 2;

		ctx.beginPath();
		ctx.strokeStyle = 'rgba(0, 0, 0, 1)';
		ctx.lineWidth = 3;
		ctx.arc(this.position.x, this.position.y, this.r, drawAngleFrom, drawAngleTo, false);
		ctx.stroke();
		ctx.closePath();

		ctx.beginPath();
		ctx.lineWidth = 1;
		ctx.arc(this.position.x, this.position.y, 4, 0, TAU, false);
		ctx.fill();
		ctx.closePath();

		ctx.beginPath();
		ctx.arc(this.to.x, this.to.y, 4, 0, TAU, false);
		ctx.fill();
		ctx.closePath();

		ctx.beginPath();
		ctx.strokeStyle = 'rgba(230, 230, 230, 1)';
		ctx.moveTo(this.position.x, this.position.y);
		ctx.lineTo(this.to.x, this.to.y);
		ctx.stroke();
		ctx.closePath();
	}
}

export default Wheel;
