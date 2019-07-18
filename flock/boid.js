import Vector from '//rawgit.com/pimskie/vector/master/vector.js';

const simplex = new SimplexNoise();
const TAU = Math.PI * 2;

const distanceBetween = (v1, v2) => {
	// Approximation by using octagons approach
	var x = v2.x - v1.x;
	var y = v2.y - v1.y;
	return 1.426776695 * Math.min(0.7071067812 * (Math.abs(x) + Math.abs(y)), Math.max(Math.abs(x), Math.abs(y)));
};

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

	draw(ctx, hue) {
		const armLength = 5;
		const spread = Math.PI * 0.1;
		const { angle } = this.velocity;
		// const hue = ((angle * 0.5) % TAU) * (180 / Math.PI);
		const fill = `hsl(${hue}, 100%, 50%)`;

		ctx.save();
		ctx.translate(this.position.x, this.position.y);
		ctx.rotate(angle);

		ctx.fillStyle = fill;
		ctx.beginPath();
		ctx.moveTo(Math.cos(-spread - Math.PI) * armLength, Math.sin(-spread - Math.PI) * armLength);
		ctx.lineTo(0, 0);
		ctx.lineTo(Math.cos(spread - Math.PI) * armLength, Math.sin(spread - Math.PI) * armLength);

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

			if (!this.regionCells.includes(boid.cellIndex)) {
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
			separation.divideSelf(separationCount).multiplySelf(2);
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

	flee(predator) {
		const fleeDistance = 300;

		const difference = this.position.subtract(predator);
		const distance = distanceBetween(this.position, predator);

		const flee = new Vector();

		// separation
		if (distance <= fleeDistance) {
			difference.normalize();

			flee.addSelf(difference);
			flee.multiplySelf(0.05);
		}

		return flee;
	}

	goto(destination) {
		return destination
			.clone()
			.subtract(this.position)
			.multiply(0.0001);
	}

	getNoiseVector(time) {
		const { x, y } = this.position;
		const scale = 0.01;

		const noise = simplex.noise3D(x * scale, y * scale, time);
		const angle = TAU * noise;

		const vector = new Vector(Math.cos(angle), Math.sin(angle));

		return vector;
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
