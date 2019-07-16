import Vector from '//rawgit.com/pimskie/vector/master/vector.js';

const distanceBetween = (v1, v2) => {
	// Approximation by using octagons approach
	var x = v2.x - v1.x;
	var y = v2.y - v1.y;
	return 1.426776695 * Math.min(0.7071067812 * (Math.abs(x) + Math.abs(y)), Math.max(Math.abs(x), Math.abs(y)));
};

const TAU = Math.PI * 2;

const stats = new Stats();
stats.showPanel(0); // 0: fps, 1: ms, 2: mb, 3+: custom

document.body.appendChild(stats.dom);

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
		this.velocity.limit(1.5);

		this.position.addSelf(this.velocity);

		this.acceleration.multiplySelf(0);

		this.checkBounds(stage);
	}

	draw(ctx) {
		const armLength = 5;
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

	getForces(boids, separationPerception, alignmentPerception, cohesionPerception) {
		let separationCount = 0;
		const separation = new Vector();

		let alignmentCount = 0;
		const alignment = new Vector();

		let cohesionCount = 0;
		const cohesion = new Vector();


		boids.forEach((boid) => {
			if (boid === this) {
				return;
			}

			const difference = this.position.subtract(boid.position);
			const distance = distanceBetween(this.position, boid.position);

			// separation
			if (distance <= separationPerception) {
				difference.normalize();
				difference.divideSelf(Math.max(distance, 1));

				separation.addSelf(difference);

				separationCount++;
			}

			// alignment
			if (distance <= alignmentPerception) {
				alignment.addSelf(boid.velocity);

				alignmentCount++;
			}

			// cohesion
			if (distance <= cohesionPerception) {
				cohesion.addSelf(boid.position);

				cohesionCount++;
			}
		});

		if (separationCount > 0) {
			separation.divideSelf(separationCount);
		}

		if (alignmentCount > 0) {
			alignment.divideSelf(alignmentCount);
			alignment.multiplySelf(0.02);
		}

		if (cohesionCount > 0) {
			cohesion.divideSelf(cohesionCount);
			cohesion.subtractSelf(this.position);
			cohesion.length = 0.001;
		}

		return { separation, alignment, cohesion };
	}

	// separation: steer to avoid crowding local flockmates
	// This vector is normalized, and then scaled up proportionally to how close the boid is
	// http://harry.me/blog/2011/02/17/neat-algorithms-flocking/

	checkBounds(stage) {
		const { width, height } = stage;

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

const numBoids = 600;
const boids = new Array(numBoids).fill().map((_, i) => {
	const position = stage.getCenter();
	const mass = 1;

	const a = Math.random() * TAU;
	const l = 0.5 + Math.random() * 0.5;
	const velocity = new Vector();

	velocity.length = l;
	velocity.angle = a;

	return new Boid({ position, mass, velocity });
});

const loop = () => {
	stats.begin();

	stage.clear();

	boids.forEach((boid, i) => {
		const { separation, alignment, cohesion } = boid.getForces(boids, 15, 100, 50);

		boid.applyForce(separation);
		boid.applyForce(alignment);
		boid.applyForce(cohesion  );

		boid.update(stage);
		boid.draw(stage.context);
	});

	stats.end();

	requestAnimationFrame(loop);
};

loop();

window.addEventListener('resize', () => {
	stage.setSize(window.innerWidth, window.innerHeight);
});
