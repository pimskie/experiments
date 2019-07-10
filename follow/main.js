import Vector from '//rawgit.com/pimskie/vector/master/vector.js';
import { wrappBBox, distanceBetween } from '//rawgit.com/pimskie/utils/master/utils.js';

const TAU = Math.PI * 2;
const simplex = new SimplexNoise();

const getAngleDifference = (current, target) => {
	let angle = target - current;
	angle = (angle + Math.PI) % TAU - Math.PI;

	return angle;
}

const moveTowards = (current, target, turnSpeed) => {
	if (Math.abs(target - current) <= turnSpeed) {
		return target;
	}

	return current + Math.sign(target - current) * turnSpeed;
}

const moveTowardsAngle = (currentAngle, targetAngle, turnSpeed) => {
	const deltaAngle = getAngleDifference(currentAngle, targetAngle);

	if (-turnSpeed < deltaAngle && deltaAngle < turnSpeed) {
		return targetAngle;
	}

	return moveTowards(currentAngle, currentAngle + deltaAngle, turnSpeed);
}

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

		// this.painting = painting;

		this.velocity = new Vector();
		this.velocity.length = 0.5 + (Math.random());
		this.velocity.angle = Math.random() * TAU;

		this.turnSpeed = 0.1 + ((Math.random() * 0.9)) * 0.1;
	}

	update(stageWidth, stageHeight, targets) {
		wrappBBox(this.position, stageWidth, stageHeight);

		this.target = Mover.getClosest(this.position, targets);

		const targetAngle = Math.atan2(this.target.position.y - this.position.y, this.target.position.x - this.position.x);

		this.velocity.angle = moveTowardsAngle(this.velocity.angle, targetAngle, this.turnSpeed);
		this.position.addSelf(this.velocity);
	}

	draw(context) {
		// this.painting.drawSelf(context, this.position, '#ff0000');
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
		// this.painting = painting;

		this.velocity = new Vector();
		this.velocity.length = 0.5 + (Math.random());
		this.velocity.angle = Math.random() * TAU;

		this.turnSpeed = 0.1 + ((Math.random() * 0.9)) * 0.1;
	}

	update(stageWidth, stageHeight) {
		wrappBBox(this.position, stageWidth, stageHeight);

		this.position.addSelf(this.velocity);
	}

	draw(context) {
		// this.painting.drawSelf(context, this.position, '#000');
	}
}

const stage = new Stage(
	document.querySelector('canvas'),
	window.innerWidth,
	window.innerHeight
);

const numMovers = 30;

const getClosest = (position, others) => {
	let [closest] = others;

	others.forEach((other) => {
		if (distanceBetween(position, other.position) < distanceBetween(position, closest.position)) {
			closest = other;
		}
	});

	return closest;
};

const getVelocity = () => {
	const velocity = new Vector();
	velocity.length = 0.5 + (Math.random());
	velocity.angle = Math.random() * TAU;

	return velocity;
};

function move() {
	wrappBBox(this.position, this.stage.width, this.stage.height);

	this.position.addSelf(this.velocity);
};

function draw() {
	const { stage: { context }, position, color } = this;


	context.save();
	context.translate(position.x, position.y);

	context.beginPath();
	context.fillStyle = color;
	context.arc(0, 0, 5, 0, TAU);
	context.fill();
	context.closePath();

	context.restore();
}

const createTarget = () => {
	return {
		position: stage.getRandomPosition(),
		velocity: getVelocity(),
		color: '#ff0000',
		stage,

		update() {
			const rand = Math.round(Math.random() * 20);

			if (rand === 20) {
				const change = (Math.random() > 0.5 ? -Math.PI / 2 : Math.PI / 2) * Math.random();
				this.velocity.angle += change;
			}
		},

		draw,
		move,
	};
};

const createPredator = () => {
	return {
		position: stage.getRandomPosition(),
		velocity: getVelocity(),
		turnSpeed: 0.07,
		color: 'green',

		update(targets) {
			const target = getClosest(this.position, targets);
			const targetAngle = Math.atan2(target.position.y - this.position.y, target.position.x - this.position.x);

			this.velocity.angle = moveTowardsAngle(this.velocity.angle, targetAngle, this.turnSpeed);
			this.position.addSelf(this.velocity);
		},

		stage,
		draw,
		move,
	};
};
const targets = new Array(numMovers).fill().map(() => createTarget());
const predators = new Array(numMovers).fill().map(() => createPredator());

const loop = () => {
	stage.clear();

	targets.forEach((target) => {
		target.update();
		target.move();
		target.draw()
	});

	predators.forEach((predator) => {
		predator.update(targets);
		predator.move();
		predator.draw()
	});

	requestAnimationFrame(loop);
};

loop();

window.addEventListener('resize', () => {
	stage.setSize(window.innerWidth, window.innerHeight);
});
