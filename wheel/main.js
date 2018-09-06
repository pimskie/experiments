import * as Utils from 'https://rawgit.com/pimskie/utils/master/utils.js';

const ctx = Utils.qs('.js-canvas').getContext('2d');
const ctxTrail = Utils.qs('.js-canvas-trail').getContext('2d');

const TAU = Math.PI * 2;

const W = window.innerWidth;
const H = window.innerHeight;

const MID_X = W * 0.5;
const MID_Y = H * 0.5;

ctx.canvas.width = ctxTrail.canvas.width = W;
ctx.canvas.height = ctxTrail.canvas.height = H;

class Wheel {
	constructor(position, r = 50, angle = 0, speed = 0.04, yoyo = false) {
		this.position = position;
		this.r = r;
		this.speed = speed;
		this.angle = angle;
		this.yoyo = yoyo;

		this.arms = [];
		this.iteration = 0;
		this.iterationsFullRound = Math.ceil(TAU / this.speed);

		this.anchor = {
			previousX: this.position.x + (Math.cos(this.angle) * this.r),
			previousY: this.position.y + (Math.sin(this.angle) * this.r),

			x: this.position.x + (Math.cos(this.angle) * this.r),
			y: this.position.y + (Math.sin(this.angle) * this.r),
		};
	}

	addArms(arms) {
		this.arms = this.arms.concat(arms);

		return this;
	}

	update(parentPosition = this.position) {
		this.position.x = parentPosition.x;
		this.position.y = parentPosition.y;

		this.angle += this.speed;

		this.anchor.previousX = this.anchor.x;
		this.anchor.previousY = this.anchor.y;

		this.anchor.x = this.position.x + (Math.cos(this.angle) * this.r);
		this.anchor.y = this.position.y + (Math.sin(this.angle) * this.r);

		this.iteration++;

		if (this.yoyo && this.iteration > 0 && (this.iteration % this.iterationsFullRound === 0)) {
			this.speed *= -1;
		}

		this.arms.forEach(arm => arm.update(this.anchor));
	}

	draw(ctx, ctxTrail) {
		this.drawSelf(ctx);
		this.drawTrail(ctxTrail);

		this.arms.forEach(arm => arm.draw(ctx));
	}

	drawSelf(ctx) {
		ctx.beginPath();
		ctx.strokeStyle = 'rgba(0, 0, 0, 1)';
		ctx.arc(this.position.x, this.position.y, this.r, 0, TAU, false);
		ctx.stroke();
		ctx.closePath();

		ctx.beginPath();
		ctx.arc(this.anchor.x, this.anchor.y, 4, 0, TAU, false);
		ctx.fill();
		ctx.closePath();
	}

	drawTrail() {
		if (this.arms.length) {
			return;
		}

		ctxTrail.strokeStyle = 'rgba(255, 100, 0, 1)';
		ctxTrail.lineWidth = 2;
		ctxTrail.beginPath();
		ctxTrail.moveTo(this.anchor.previousX, this.anchor.previousY);
		ctxTrail.lineTo(this.anchor.x, this.anchor.y);
		ctxTrail.stroke();
		ctxTrail.closePath();
	}
}

class Arm {
	constructor(from, length, angle = null, anchor = null) {
		this.from = from;
		this.length = length;

		if ((angle !== null && anchor !== null) || (angle === null && anchor === null)) {
			throw Error('Arm: either angle or anchor should be specified');
		}

		this._angle = angle;
		this.anchor = anchor;

		this.wheels = [];

		this.to = {};
		this.previous = {};
	}

	get angle() {
		const angle = this._angle !== null
			? this._angle
			: Utils.angleBetween(this.from, this.anchor);

		return angle;
	}

	addWheels(wheels) {
		this.wheels = this.wheels.concat(wheels);

		return this;
	}

	update(parentPosition = this.from) {
		this.from = parentPosition;

		this.previous.x = this.to.x;
		this.previous.y = this.to.y;

		this.to.x = this.from.x + (Math.cos(this.angle) * this.length);
		this.to.y = this.from.y + (Math.sin(this.angle) * this.length);

		this.wheels.forEach(wheel => wheel.update(this.to));
	}

	draw(ctx) {
		this.drawSelf(ctx);
		this.drawAnchor(ctx);
		this.drawTrail();

		this.wheels.forEach(wheel => wheel.draw(ctx));
	}

	drawSelf(ctx) {
		const { from, to } = this;

		ctx.beginPath();
		ctx.strokeStyle = 'rgba(0, 0, 0, 1)';
		ctx.moveTo(from.x, from.y);
		ctx.lineTo(to.x, to.y);
		ctx.stroke();
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

	drawTrail() {
		if (this.wheels.length) {
			return;
		}

		ctxTrail.strokeStyle = 'rgba(255, 100, 0, 1)';
		ctxTrail.lineWidth = 2;
		ctxTrail.beginPath();
		ctxTrail.moveTo(this.previous.x, this.previous.y);
		ctxTrail.lineTo(this.to.x, this.to.y);
		ctxTrail.stroke();
		ctxTrail.closePath();
	}
}

const wheel = new Wheel({ x: MID_X - 100, y: MID_Y }, 50, -Math.PI / 2)
	.addArms([
		new Arm({}, 150, null, { x: MID_X + 50, y: MID_Y - 75 })
			.addWheels([
				new Wheel({}, 50, -Math.PI/ 2, 0.04, false)
					.addArms([
						new Arm({}, 125, 0).addWheels([
							new Wheel({}, 100, 0, 0.04, true)
						]),
					])
			]),
	]);

const loop = () => {
	ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

	ctxTrail.fillStyle = 'rgba(255, 255, 255, 0.01)';
	// ctxTrail.fillRect(0, 0, ctxTrail.canvas.width, ctxTrail.canvas.height);

	wheel.update();
	wheel.draw(ctx, ctxTrail);

	requestAnimationFrame(loop);
};

loop();
