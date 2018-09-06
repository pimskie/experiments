

import * as Utils from './utils.js';

const TAU = Math.PI * 2;

class Arm {
	constructor({ position = { x, y }, length, trombone = 0, speed = 0.04, angle = null, anchor = null } = options) {
		if (!length) {
			throw Error('Arm: need a length');
		}

		if ((angle !== null && anchor !== null) || (angle === null && anchor === null)) {
			throw Error('Arm: either angle or anchor should be specified');
		}

		this.position = position;
		this.speed = speed;
		this.phase = 0;

		this.length = length;
		this.anchor = anchor;
		this._angle = angle;

		this.tromboneR = this.length * trombone * 0.5;

		this.wheels = [];

		this.from = {
			x: this.position.x,
			y: this.position.y,
		};

		this.to = {
			x: this.position.x + (Math.cos(this.angle) * this.length),
			y: this.position.y + (Math.sin(this.angle) * this.length),
		};
	}

	get angle() {
		const angle = this._angle !== null
			? this._angle
			: Utils.angleBetween(this.position, this.anchor);

		return angle;
	}

	addWheels(wheels) {
		this.wheels = this.wheels.concat(wheels);

		return this;
	}

	update(parentPosition = this.from) {
		this.position.x = parentPosition.x;
		this.position.y = parentPosition.y;

		this.from.x = this.to.x;
		this.from.y = this.to.y;

		const r = this.length - this.tromboneR + (Math.sin(this.phase) * this.tromboneR);

		this.to.x = this.position.x + (Math.cos(this.angle) * r);
		this.to.y = this.position.y + (Math.sin(this.angle) * r);

		if (!this.from.x) {
			this.from.x = this.to.x;
			this.from.y = this.to.y;
		}

		this.wheels.forEach(wheel => wheel.update(this.to));

		this.phase += this.speed;
	}

	draw(ctx, ctxTrail) {
		this.drawSelf(ctx);
		this.drawTrail(ctxTrail);

		this.wheels.forEach(wheel => wheel.draw(ctx, ctxTrail));
	}

	drawSelf(ctx) {
		this.drawAnchor(ctx);

		const { position, to } = this;
		const lineTo = {
			x: position.x + Math.cos(this.angle) * this.length,
			y: position.y + Math.sin(this.angle) * this.length,
		};

		ctx.beginPath();
		ctx.strokeStyle = 'rgba(230, 230, 230, 1)';
		ctx.moveTo(position.x, position.y);
		ctx.lineTo(lineTo.x, lineTo.y);
		ctx.stroke();
		ctx.closePath();

		ctx.beginPath();
		ctx.fillStyle = 'rgba(0, 0, 0, 1)';
		ctx.arc(to.x, to.y, 5, 0, TAU, false);
		ctx.fill();
		ctx.closePath();
	}

	drawAnchor(ctx) {
		if (!this.anchor) {
			return;
		}

		ctx.beginPath();
		ctx.strokeStyle = 'rgba(0, 0, 0, 1)';
		ctx.arc(this.anchor.x, this.anchor.y, 4, 0, TAU, false);
		ctx.stroke();
		ctx.closePath();
	}

	drawTrail(ctxTrail) {
		if (this.wheels.length) {
			return;
		}

		ctxTrail.strokeStyle = 'rgba(100, 100, 100, 1)';
		ctxTrail.lineWidth = 1;
		ctxTrail.beginPath();
		ctxTrail.moveTo(this.from.x, this.from.y);
		ctxTrail.lineTo(this.to.x, this.to.y);
		ctxTrail.stroke();
		ctxTrail.closePath();
	}
}

export default Arm;
