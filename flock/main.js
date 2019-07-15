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

		ctx.save();
		ctx.translate(this.position.x, this.position.y);
		ctx.rotate(angle);

		ctx.beginPath();
		ctx.moveTo(Math.cos(-spread - Math.PI) * armLength, Math.sin(-spread - Math.PI) * armLength);
		ctx.lineTo(0, 0);
		ctx.lineTo(Math.cos(spread - Math.PI) * armLength, Math.sin(spread - Math.PI) * armLength);

		ctx.closePath();
		ctx.stroke();
		ctx.restore();
	}

	// cohesion: steer to move towards the average position (center of mass) of local flockmates
	getCohesion(boids) {
		const centerOfMass = boids.reduce((com, boid) => {
			if (boid !== this) {
				com.addSelf(boid.position);
			}
			return com;
		}, new Vector());

		centerOfMass.divideSelf(boids.length - 1);
		centerOfMass.subtractSelf(this.position);
		centerOfMass.multiplySelf(0.0001);

		return centerOfMass;
	}

	// separation: steer to avoid crowding local flockmates
	getSeparation(boids) {
		// let perceptionRadius = 50;
		// let steering = new Vector();
		// let total = 0;

		// for (let other of boids) {
		// 	let d = distanceBetween(this.position, other.position);

		// 	if (other != this && d < perceptionRadius) {
		// 		let diff = this.position.subtract(other.position);

		// 		diff.divideSelf(d * d);

		// 		steering.add(diff);
		// 		total++;
		// 	}
		// }
		// if (total > 0) {
		// 	steering.divideSelf(total);
		// 	steering.normalize();
		// 	steering.multiplySelf(4);
		// 	// steering.subtractSelf(this.velocity);
		// 	steering.limit(2);
		// }
		// return steering;

		const separation = boids.reduce((sep, boid) => {
			if (boid === this) {
				return sep;
			}

			const distance = distanceBetween(this.position, boid.position);

			if (distance < 40) {
				sep.subtractSelf(boid.position.subtract(this.position));
			}

			return sep;
		}, new Vector());

		separation.multiplySelf(0.01);

		return separation;
	}

	getAllignment() {
		const velocity = boids.reduce((vel, boid) => {
			if (boid !== this) {
				vel.addSelf(boid.velocity);
			}
			return vel;
		}, new Vector());

		velocity.divideSelf(boids.length - 1);
		velocity.multiplySelf(0.01);

		return velocity;
	}

	checkBounds(stage) {
		const { width, height } = stage;
		const { x, y } = this.position;

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
		this.radius = Math.min(this.width, this.height) * 0.5;

		this.canvas.width = this.width;
		this.canvas.height = this.height;
	}

	getRandomPosition() {
		return new Vector(this.width * Math.random(), this.height * Math.random());
	}
}


const stage = new Stage(document.querySelector('.js-canvas'), window.innerWidth, window.innerHeight);
const boids = new Array(100).fill().map((_, i) => {
	const a = Math.random() * TAU;
	const l = 0.5 + Math.random() * 0.5;
	const velocity = new Vector();

	velocity.length = l;
	velocity.angle = a;

	return new Boid({
		position: stage.getRandomPosition(),
		mass: 1,
		velocity,
	});
});


const loop = () => {
	stage.clear();

	boids.forEach((boid, i) => {
		if (i === 0) {
			//
		}
		boid.applyForce(boid.getSeparation(boids));
		boid.applyForce(boid.getAllignment(boids));
		boid.applyForce(boid.getCohesion(boids));

		boid.update(stage);
		boid.draw(stage.context);
	});

	requestAnimationFrame(loop);
};

loop();

window.addEventListener('resize', () => {
	stage.setSize(window.innerWidth, window.innerHeight);
});
