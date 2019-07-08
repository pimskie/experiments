import Vector from '//rawgit.com/pimskie/vector/master/vector.js';
import { wrappBBox, angleBetween } from '//rawgit.com/pimskie/utils/master/utils.js';

const TAU = Math.PI * 2;
const simplex = new SimplexNoise();

const degrees = r => r * (180 / Math.PI);

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
}

class Mover {
	constructor(position) {
		this.position = position;

		this.velocity = new Vector();
		this.velocity.length = 1;
		this.velocity.angle = Math.random() * TAU;

		this.target = new Vector(Math.random() * window.innerWidth, Math.random() * window.innerHeight);
	}
	getAngle() {
		const turnSpeed = 0.05;

		const target = angleBetween(this.position, this.target);
		const current = this.velocity.angle;
		let difference = current - target;

		if (difference % Math.PI >= Math.PI) {
			difference -= difference % Math.PI;
		}

		if (Math.abs(target - current) <= turnSpeed) {
			console.log('on target');

			return target;
		}

		console.log(difference)

		return current - Math.sign(difference) * turnSpeed;
	}

	update(stageWidth, stageHeight) {
		this.velocity.angle = this.getAngle();

		this.position.addSelf(this.velocity);
	}

	draw(context) {
		context.save();
		context.translate(this.position.x, this.position.y);

		context.beginPath();
		context.fillStyle = '#000';
		context.arc(0, 0, 5, 0, TAU);
		context.fill();
		context.closePath();

		context.restore();

		context.save();
		context.translate(this.target.x, this.target.y);

		context.beginPath();
		context.fillStyle = '#ff0000';
		context.arc(0, 0, 5, 0, TAU);
		context.fill();
		context.closePath();

		context.restore();
	}
}

const stage = new Stage(
	document.querySelector('canvas'),
	window.innerWidth,
	window.innerHeight
);

const movers = new Array(1)
	.fill()
	.map(() => new Mover(new Vector(stage.width * 0.5, stage.height * 0.5)));

const loop = () => {
	stage.clear();

	movers.forEach((mover) => {
		mover.update(stage.width, stage.height);
		mover.draw(stage.context);
	});

	requestAnimationFrame(loop);
};

loop();

window.addEventListener('resize', () => {
	stage.setSize(window.innerWidth, window.innerHeight);
});
