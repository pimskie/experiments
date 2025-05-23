

import * as Utils from '../utils.js';
import Instrument from './Instrument.js';

const TAU = Math.PI * 2;

class Arm extends Instrument {
	constructor({ position = { x: 0, y : 0 }, length, trombone = 0, speed = 0.04, paint = false, angle = null, anchor = null } = options) {
		super();

		if (!length) {
			throw Error('Arm: need a length');
		}

		if ((angle !== null && anchor !== null) || (angle === null && anchor === null)) {
			throw Error('Arm: either angle or anchor should be specified');
		}

		this.position = position;

		this.paint = paint;
		this.length = length;
		this.anchor = anchor;
		this.phase = 0;
		this._angle = angle;

		this.speed = speed;

		this.tromboneR = this.length * trombone;

		this.instruments = [];

		this.from = {
			x: this.position.x,
			y: this.position.y,
		};

		this.to = {
			x: this.position.x + (Math.cos(this.ownAngle) * this.length),
			y: this.position.y + (Math.sin(this.ownAngle) * this.length),
		};
	}

	get ownAngle() {
		const angle = this._angle !== null
			? this._angle
			: Utils.angleBetween(this.position, this.anchor);

		return angle;
	}

	update(parent) {
		this.position.x = parent ? parent.to.x : this.from.x;
		this.position.y = parent ? parent.to.y : this.from.y;

		this.from.x = this.to.x;
		this.from.y = this.to.y;

		const r = this.length - this.tromboneR + (Math.sin(this.phase) * this.tromboneR);

		this.angle = parent.angleOut || this.ownAngle;

		this.to.x = this.position.x + (Math.cos(this.angle) * r);
		this.to.y = this.position.y + (Math.sin(this.angle) * r);

		if (!this.from.x) {
			this.from.x = this.to.x;
			this.from.y = this.to.y;
		}

		this.instruments.forEach(wheel => wheel.update(this));

		this.phase += this.speed * 2;

		this.angleOut = this.angle;
	}

	drawSelf(ctx) {
		this.drawAnchor(ctx);

		const { position, to } = this;
		const lineTo = {
			x: position.x + Math.cos(this.angle) * this.length,
			y: position.y + Math.sin(this.angle) * this.length,
		};

		ctx.beginPath();
		ctx.strokeStyle = 'rgba(100, 100, 100, 1)';
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
