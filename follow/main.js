import Vector from '//rawgit.com/pimskie/vector/master/vector.js';
import { wrappBBox, distanceBetween } from '//rawgit.com/pimskie/utils/master/utils.js';

const TAU = Math.PI * 2;
const simplex = new SimplexNoise();

const painting = {
	drawSelf(context, position, color = '#000') {
		context.save();
		context.translate(position.x, position.y);

		context.beginPath();
		context.fillStyle = color;
		context.arc(0, 0, 5, 0, TAU);
		context.fill();
		context.closePath();

		context.restore();
	}
};


class Stage {
	constructor(canvas, width, height) {
		this.canvas = canvas;
		this.context = this.canvas.getContext('2d');

		this.setSize(width, height);
	}

	clear() {
		this.context.clearRect(0, 0, this.width, this.height);
	}

	setSize(width, height) {
		this.width = width;
		this.height = height;
		this.radius = Math.min(this.width, this.height) * 0.5;

		this.canvas.width = this.width;
		this.canvas.height = this.height;
	}

	getRandomPosition() {
		return new Vector(this.width * Math.random(), this.height * Math.random());
	}
}

class Mover {
	constructor(position, target) {
		this.position = position;
		this.target = target;

		this.painting = painting;

		this.velocity = new Vector();
		this.velocity.length = 0.5 + (Math.random());
		this.velocity.angle = Math.random() * TAU;

		this.turnSpeed = 0.1 + ((Math.random() * 0.9)) * 0.1;
	}

	getAngleDifference(current, target) {
		let angle = target - current;
		angle = (angle + Math.PI) % TAU - Math.PI;

		return angle;
	}

	moveTowardsAngle(targetPosition) {
		const target = Math.atan2(targetPosition.y - this.position.y, targetPosition.x - this.position.x);
		const current = this.velocity.angle;

		const deltaAngle = this.getAngleDifference(current, target);

		if (-this.turnSpeed < deltaAngle && deltaAngle < this.turnSpeed) {
			return target;
		}

		return this.moveTowards(current, current + deltaAngle, this.turnSpeed);
	}

	moveTowards(current, target, turnSpeed) {
		if (Math.abs(target - current) <= turnSpeed) {
			return target;
		}

		return current + Math.sign(target - current) * turnSpeed;
	}

	update(stageWidth, stageHeight, targets) {
		wrappBBox(this.position, stageWidth, stageHeight);

		this.target = Mover.getClosest(this.position, targets);
		this.velocity.angle = this.moveTowardsAngle(this.target.position);

		this.position.addSelf(this.velocity);
	}

	draw(context) {
		this.painting.drawSelf(context, this.position, '#ff0000');
	}

	static getClosest(position, others) {
		let [closest] = others;

		others.forEach((other) => {
			if (distanceBetween(position, other.position) < distanceBetween(position, closest.position)) {
				closest = other;
			}
		});

		return closest;
	}
}

class Target {
	constructor(position) {
		this.position = position;
		this.painting = painting;
	}

	update(stageWidth, stageHeight) {
		wrappBBox(this.position, stageWidth, stageHeight);
	}

	draw(context) {
		this.painting.drawSelf(context, this.position, '#000');
	}
}

const stage = new Stage(
	document.querySelector('canvas'),
	window.innerWidth,
	window.innerHeight
);


const numMovers = 30;
const movers = new Array(numMovers).fill().map(() => new Mover(stage.getRandomPosition()));
const targets = new Array(numMovers).fill().map(() => new Target(stage.getRandomPosition()));

const loop = () => {
	stage.clear();

	movers.forEach((mover) => {
		mover.update(stage.width, stage.height, targets);
		mover.draw(stage.context);
	});

	targets.forEach((target) => {
		target.update(stage.width, stage.height);
		target.draw(stage.context);
	});

	requestAnimationFrame(loop);
};

loop();

window.addEventListener('resize', () => {
	stage.setSize(window.innerWidth, window.innerHeight);
});
