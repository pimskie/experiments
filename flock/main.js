import Vector from '//rawgit.com/pimskie/vector/master/vector.js';
import { wrappBBox, distanceBetween, clamp } from '//rawgit.com/pimskie/utils/master/utils.js';

const TAU = Math.PI * 2;
const simplex = new SimplexNoise();

const randomArrayValue = arr => arr[Math.floor(Math.random() * arr.length)];

class Boid {
	constructor({ position, velocity, mass }) {
		this.position = position;
		this.velocity = velocity;
		this.mass = mass;

		this.acceleration = new Vector();
	}

	applyForce(force) {
		// force = mass * acceleration
		// acceleration = force / mass
		this.acceleration.addSelf(force.divideSelf(this.mass));
	}

	update(stage) {
		this.velocity.addSelf(this.acceleration);
		this.velocity.limit(2);

		this.position.addSelf(this.velocity);

		this.acceleration.multiplySelf(0);

		this.checkBounds(stage);
	}

	draw(ctx) {
		const armLength = 20;
		const spread = Math.PI * 0.1;
		const { angle } = this.velocity;
		const lineWidth = this.mass * 0.5;

		ctx.save();
		ctx.translate(this.position.x, this.position.y);
		ctx.rotate(angle);

		ctx.beginPath();
		ctx.lineWidth = lineWidth;
		ctx.moveTo(Math.cos(-spread - Math.PI) * armLength, Math.sin(-spread - Math.PI) * armLength);
		ctx.lineTo(0, 0);
		ctx.lineTo(Math.cos(spread - Math.PI) * armLength, Math.sin(spread - Math.PI) * armLength);

		ctx.closePath();
		ctx.stroke();
		ctx.restore();
	}

	// cohesion: steer to move towards the average position (center of mass) of local flockmates
	getCohesion(others) {
		const centerOfMass = others.reduce((com, boid) => {
			com.addSelf(boid.position.clone());

			return com;
		}, new Vector());

		if (others.length) {
			centerOfMass.subtractSelf(this.position);
			centerOfMass.divideSelf(Math.max(others.length - 1, 1));
			centerOfMass.multiplySelf(0.00001);
		}

		return centerOfMass;
	}

	// separation: steer to avoid crowding local flockmates
	// This vector is normalized, and then scaled up proportionally to how close the boid is
	// http://harry.me/blog/2011/02/17/neat-algorithms-flocking/
	getSeparation(neighbours) {
		const separation = new Vector();

		neighbours.forEach((neighbour) => {
			const distance = distanceBetween(this.position, neighbour.position);

			const diff = this.position.subtract(neighbour.position);
			diff.normalize();
			diff.divideSelf(Math.max(distance, 1));

			separation.addSelf(diff);
		});

		separation.divideSelf(Math.max(neighbours.length, 1));

		return separation;
	}

	getAllignment(others) {
		const velocity = others.reduce((vel, boid) => {
			vel.addSelf(boid.velocity);

			return vel;
		}, new Vector());

		velocity.divideSelf(Math.max(1, others.length - 1));
		velocity.multiplySelf(0.02);

		return velocity;
	}

	checkBounds(stage) {
		const { width, height } = stage;
		const { x, y } = this.position;

		// if (x < 0 || x > width) {
		// 	this.velocity.x *= -1
		// }

		// if (y < 0 || y > height) {
		// 	this.velocity.y *= -1
		// }

		if (this.position.x > width) {
			this.position.x = 0;
		}

		if (this.position.x < 0) {
			this.position.x = width;
		}

		if (this.position.y > height) {
			this.position.y = 0;
		}

		if (this.position.y < 0) {
			this.position.y = height;
		}
	}
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

		this.centerX = this.width * 0.5;
		this.centerY = this.height * 0.5;

		this.radius = Math.min(this.width, this.height) * 0.5;

		this.canvas.width = this.width;
		this.canvas.height = this.height;
	}

	getRandomPosition() {
		return new Vector(this.width * Math.random(), this.height * Math.random());
	}

	getCenter() {
		return new Vector(this.centerX, this.centerY);
	}
}


const stage = new Stage(document.querySelector('.js-canvas'), window.innerWidth, window.innerHeight);

const count = 100;
const boids = new Array(count).fill().map((_, i) => {
	const position = stage.getCenter(); // stage.getRandomPosition();
	const mass = 1; //  + Math.random() * 5;

	const a = Math.random() * TAU;
	const l = 0.5 + Math.random() * 0.5;
	const velocity = new Vector();

	velocity.length = l;
	velocity.angle = a;

	return new Boid({ position, mass, velocity });
});


const loop = () => {
	stage.clear();

	boids.forEach((boid, i) => {
		const neighbours = boids.filter(b => b !== boid && distanceBetween(b.position, boid.position) <= 50);

		const separation = boid.getSeparation(neighbours);
		const alignment = boid.getAllignment(neighbours);
		const cohesion = boid.getCohesion(neighbours);

		boid.applyForce(separation);
		boid.applyForce(alignment);
		boid.applyForce(cohesion);

		boid.update(stage);
		boid.draw(stage.context);
	});

	requestAnimationFrame(loop);
};

loop();

window.addEventListener('resize', () => {
	stage.setSize(window.innerWidth, window.innerHeight);
});
