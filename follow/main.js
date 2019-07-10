import Vector from '//rawgit.com/pimskie/vector/master/vector.js';
import { wrappBBox, distanceBetween } from '//rawgit.com/pimskie/utils/master/utils.js';

const TAU = Math.PI * 2;
const simplex = new SimplexNoise();

const randomArrayValue = arr => arr[Math.floor(Math.random() * arr.length)];

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

const stage = new Stage(document.querySelector('.js-canvas'), window.innerWidth, window.innerHeight);
const stageTrail = new Stage(document.querySelector('.js-canvas-trail'), window.innerWidth, window.innerHeight);

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

	this.positionPrevious = this.position.clone();
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

const drawTrail = (from, to, color = '#ff0000') => {
	const { context } = stageTrail;

	context.save();

	context.beginPath();
	context.globalAlpha = 0.25;
	context.strokeStyle = color;
	context.moveTo(from.x, from.y);
	context.lineTo(to.x, to.y);
	context.stroke();
	context.closePath();

	context.restore();

};

const createTarget = () => {
	return {
		position: stage.getRandomPosition(),
		velocity: getVelocity(),
		color: randomArrayValue(['#fa87ba', '#fc4c83', '#d11f61', '#8d2c4a']),
		stage,

		update(index) {
			const scale = 0.01;
			const z = performance.now() * 0.0001;
			const noiseValue = simplex.noise3D((this.position.x + index) * scale,( this.position.y + index) * scale, z);
			// const noiseValue = simplex.noise3D(this.position.x * scale, this.position.y * scale, performance.now() * 0.0001);

			this.velocity.angle = noiseValue * TAU;
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

	targets.forEach((target, index) => {
		target.update(index);
		target.move();
		target.draw()

		drawTrail(target.positionPrevious, target.position, target.color);
	});

	predators.forEach((predator) => {
		predator.update(targets);
		predator.move();
		predator.draw()

		drawTrail(predator.positionPrevious, predator.position, '#000');
	});

	requestAnimationFrame(loop);
};

loop();

window.addEventListener('resize', () => {
	stage.setSize(window.innerWidth, window.innerHeight);
});
