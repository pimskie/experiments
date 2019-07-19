import Vector from '//rawgit.com/pimskie/vector/master/vector.js';

const TAU = Math.PI * 2;

const distanceBetween = (v1, v2) => {
	// Approximation by using octagons approach
	var x = v2.x - v1.x;
	var y = v2.y - v1.y;
	return 1.426776695 * Math.min(0.7071067812 * (Math.abs(x) + Math.abs(y)), Math.max(Math.abs(x), Math.abs(y)));
};

class Boid {
	constructor({ position, velocity, mass, maxVelocity = 1.5 }) {
		this.position = position;
		this.velocity = velocity;
		this.maxVelocity = maxVelocity;
		this.mass = mass;

		this.acceleration = new Vector();

		this.cellIndex = 0;
		this.regionCells = [];

		this.hue = 0;
	}

	applyForce(force) {
		// force = mass * acceleration
		// acceleration = force / mass
		this.acceleration.addSelf(force.divideSelf(this.mass));
	}

	update(hueTarget, stage) {
		this.hue += (hueTarget - this.hue) * 0.05;

		this.velocity.addSelf(this.acceleration);
		this.velocity.limit(this.maxVelocity);

		this.position.addSelf(this.velocity);

		this.acceleration.multiplySelf(0);

		this.checkBounds(stage);
	}

	draw(ctx, radius = 1.5) {
		const fill = `hsl(${this.hue}, 100%, 60%)`;

		ctx.save();
		ctx.translate(this.position.x, this.position.y);

		ctx.fillStyle = fill;
		ctx.beginPath();
		ctx.arc(0, 0, radius, 0, TAU, false);
		ctx.fill();
		ctx.closePath();
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

			// if (!this.regionCells.includes(boid.cellIndex)) {
			// 	return;
			// }

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
			alignment.multiplySelf(0.2);
		}

		if (cohesionCount > 0) {
			cohesion.divideSelf(cohesionCount);
			cohesion.subtractSelf(this.position);
			cohesion.length = 0.01;
		}

		return { separation, alignment, cohesion };
	}

	flee(predator, perception = 100) {
		const difference = this.position.subtract(predator.position);
		const distance = difference.length;
		const force = distance / perception;

		const flee = new Vector();

		// separation
		if (distance <= perception) {
			difference.normalize().multiplySelf(force);

			flee.addSelf(difference);
		}

		return flee;
	}

	goto(destination) {
		return destination
			.clone()
			.subtract(this.position)
			.multiply(0.0001);
	}

	getNearest(boids) {
		const sorted = boids.map((b) => {
			const distance = distanceBetween(this.position, b.position);
			return { position: b.position, distance };
		}).sort((a, b) => a.distance - b.distance);

		return sorted[0];
	}

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

export default Boid;
