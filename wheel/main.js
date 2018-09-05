import * as Utils from 'https://rawgit.com/pimskie/utils/master/utils.js';

const ctx = Utils.qs('.js-canvas').getContext('2d');
const ctxTrail = Utils.qs('.js-canvas-trail').getContext('2d');

const TAU = Math.PI * 2;

const W = 500; // window.innerWidth;
const H = 500; // window.innerHeight;

const MID_X = W * 0.5;
const MID_Y = H * 0.5;

ctx.canvas.width = W;
ctx.canvas.height = H;

class Wheel {
	constructor(position, r = 50, angle = 0, speed = 0.04) {
		this.position = position;
		this.r = r;
		this.speed = speed;
		this.angle = angle;

		this.arms = [];

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

		this.angle = angle;
		this.anchor = anchor;

		this.wheels = [];

		// TODO: refactor
		this.previous = {};
	}

	get to() {
		const angle = this.angle !== null
			? this.angle
			: Utils.angleBetween(this.from, this.anchor);

		return {
			x: this.from.x + (Math.cos(angle) * this.length),
			y: this.from.y + (Math.sin(angle) * this.length),
		};
	}

	addWheels(wheels) {
		this.wheels = this.wheels.concat(wheels);

		return this;
	}

	update(parentPosition = this.from) {
		this.from = parentPosition;

		// TODO: rename
		this.previous.x = this.to.x;
		this.previous.y = this.to.y;

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

		console.log(this.previous.x, this.to.x);

		ctxTrail.strokeStyle = 'rgba(255, 100, 0, 1)';
		ctxTrail.lineWidth = 2;
		ctxTrail.beginPath();
		ctxTrail.moveTo(this.previous.x, this.previous.y);
		ctxTrail.lineTo(this.to.x, this.to.y);
		ctxTrail.stroke();
		ctxTrail.closePath();
	}
}

// const wheel = new Wheel({ x: MID_X, y: MID_Y }, 50, -Math.PI / 2);
// const armR = new Arm(wheel.anchor, 150, null, { x: MID_X + 50, y: MID_Y - 75 });

// wheel.addArms(armR);
// armR.addWheel(new Wheel({}, 50, 0));

const wheel = new Wheel({ x: MID_X - 100, y: MID_Y }, 50, -Math.PI / 2)
	.addArms([
		new Arm({}, 150, null, { x: MID_X + 50, y: MID_Y - 75 })
			.addWheels([
				new Wheel({}, 50, 0)
					.addArms([
						new Arm({}, 125, 0)
					])
			])
	]);

const loop = () => {
	ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

	ctxTrail.fillStyle = 'rgba(255, 255, 255, 0.01)';
	ctxTrail.fillRect(0, 0, ctxTrail.canvas.width, ctxTrail.canvas.height);

	wheel.update();
	wheel.draw(ctx, ctxTrail);

	requestAnimationFrame(loop);
};

loop();
