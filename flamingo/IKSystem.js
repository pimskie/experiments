

// https://www.youtube.com/watch?v=sEKNoWyKUA0 - Coding Math: Episode 45 - Kinematics Part III
// https://www.youtube.com/watch?v=7t54saw9I8k - Coding Math: Episode 46 - Kinematics Part IV

class Arm {
	constructor(start, angle, length, parent = null) {
		this.start = start;
		this.angle = angle;
		this.length = length;
		this.parent = parent;

		this._end = new Vector();
	}

	get end() {
		const x = this.start.x + Math.cos(this.angle) * this.length;
		const y = this.start.y + Math.sin(this.angle) * this.length;

		this._end.x = x;
		this._end.y = y;

		return this._end;
	}

	drag(target) {
		const dir = target.subtract(this.start);

		this.angle = dir.angle;
		this.start.x = target.x - Math.cos(this.angle) * this.length;
		this.start.y = target.y - Math.sin(this.angle) * this.length;

		if (this.parent) {
			this.parent.drag(this.start);
		}
	}

	draw(ctx) {
		const { start, end } = this;

		ctx.beginPath();
		ctx.moveTo(start.x, start.y);
		ctx.lineTo(end.x, end.y);
		ctx.stroke();
		ctx.closePath();
	}
}


class IKSystem {
	constructor(anchorVector = new Vector()) {
		this.anchor = anchorVector;
		this.arms = [];
	}

	get lastArm() {
		return this.arms[this.arms.length - 1];
	}

	addArm(start, angle, length) {
		const parent = this.lastArm || null;

		start = parent ? parent.end : start;

		this.arms.push(new Arm(start, angle, length, parent));
	}

	update(target) {
		if (!this.arms.length) {
			return;
		}

		this.lastArm.drag(target);

		this.arms.forEach((arm) => {
			if (arm.parent) {
				arm.start = arm.parent.end.clone();
			} else {
				arm.start.x = this.anchor.x;
				arm.start.y = this.anchor.y;
			}
		});
	}

	draw(ctx) {
		this.arms.forEach(arm => arm.draw(ctx));
	}
}

export default IKSystem;
export { Arm };
