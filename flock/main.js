import Vector from '//rawgit.com/pimskie/vector/master/vector.js';

const distanceBetween = (p1, p2) => {
	// Approximation by using octagons approach
	var x = p2.x - p1.x;
	var y = p2.y - p1.y;
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
		this.velocity.limit(1);

		this.position.addSelf(this.velocity);

		this.acceleration.multiplySelf(0);

		this.checkBounds(stage);
	}

	draw(ctx) {
		const armLength = 10;
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
	getCohesion(boids, perception) {
		const sum = new Vector();
		let numNeighbours = 0;

		boids.forEach((neighbour) => {
			const distance = distanceBetween(this.position, neighbour.position);

			if (neighbour === this || distance > perception) {
				return;
			}

			sum.addSelf(neighbour.position.clone());

			numNeighbours += 1;
		});

		if (numNeighbours > 0) {
			sum.divideSelf(numNeighbours);
			sum.subtractSelf(this.position);
			sum.length = 0.001;
		}

		return sum;
	}

	// separation: steer to avoid crowding local flockmates
	// This vector is normalized, and then scaled up proportionally to how close the boid is
	// http://harry.me/blog/2011/02/17/neat-algorithms-flocking/
	getSeparation(boids, perception) {
		const separation = new Vector();

		let numNeighbours = 0;

		boids.forEach((neighbour) => {
			const distance = distanceBetween(this.position, neighbour.position);

			if (neighbour === this || distance > perception) {
				return;
			}

			const diff = this.position.subtract(neighbour.position);
			diff.normalize();
			diff.divideSelf(Math.max(distance, 1));

			separation.addSelf(diff);

			numNeighbours += 1;
		});

		separation.divideSelf(Math.max(numNeighbours, 1));

		return separation;
	}

	getAllignment(boids, perception) {
		const velocity = new Vector();
		let numNeighbours = 0;

		boids.forEach((neighbour) => {
			const distance = distanceBetween(this.position, neighbour.position);

			if (neighbour === this || distance > perception) {
				return;
			}

			velocity.addSelf(neighbour.velocity);

			numNeighbours += 1;
		});

		velocity.divideSelf(Math.max(1, numNeighbours));
		velocity.multiplySelf(0.02);

		return velocity;
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
	const position = stage.getCenter();
	const mass = 1;

	const a = Math.random() * TAU;
	const l = 0.5 + Math.random() * 0.5;
	const velocity = new Vector();

	velocity.length = l;
	velocity.angle = a;

	return new Boid({ position, mass, velocity });
});


const separationProximity = 10;
const alignmentProximity = 50;
const cohesionProximity = 50;

const loop = () => {
	stats.begin();

	stage.clear();

	boids.forEach((boid, i) => {
		const separation = boid.getSeparation(boids, separationProximity);
		const alignment = boid.getAllignment(boids, alignmentProximity);
		const cohesion = boid.getCohesion(boids, cohesionProximity);

		boid.applyForce(separation);
		boid.applyForce(alignment);
		boid.applyForce(cohesion);

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
