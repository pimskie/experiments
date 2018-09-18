

import * as Utils from '../utils.js';
import Instrument from './Instrument.js';

const TAU = Math.PI * 2;

class Arm extends Instrument {
	constructor({ position = { x, y }, length, trombone = 0, speed = 0.04, paint = false, angle = null, anchor = null } = options) {
		super();

		if (!length) {
			throw Error('Arm: need a length');
		}

		if ((angle !== null && anchor !== null) || (angle === null && anchor === null)) {
			throw Error('Arm: either angle or anchor should be specified');
		}

		this.position = position;
		this.speed = speed;

		this.paint = paint;
		this.length = length;
		this.anchor = anchor;
		this.phase = 0;
		this._angle = angle;

		this.tromboneR = this.length * trombone * 0.5;

		this.instruments = [];

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

		this.instruments.forEach(wheel => wheel.update(this.to));

		this.phase += this.speed * 2;
	}

	drawSelf(ctx) {
		this.drawAnchor(ctx);

		const { position, to } = this;
		const lineTo = {
			x: position.x + Math.cos(this.angle) * this.length,
			y: position.y + Math.sin(this.angle) * this.length,
		};

		ctx.beginPath();
		ctx.strokeStyle = 'rgba(200, 200, 200, 1)';
		ctx.lineWidth = 1;
		ctx.moveTo(position.x, position.y);
		ctx.lineTo(lineTo.x, lineTo.y);
		ctx.stroke();
		ctx.closePath();

		ctx.beginPath();
		ctx.fillStyle = 'rgba(0, 0, 0, 1)';
		ctx.lineWidth = 1;
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
}

export default Arm;
