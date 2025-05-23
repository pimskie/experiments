/* globals Vector: false, */

const canvas = document.createElement('canvas');
const ctx = canvas.getContext('2d');
canvas.classList.add('canvas');

const canvasWidth = 700;
const canvasHeight = 300;
const midX = canvasWidth >> 1;
const midY = canvasHeight >> 1;

const PI2 = Math.PI * 2;
const FRICTION = 0.8;

canvas.width = canvasWidth;
canvas.height = canvasHeight;

class Planet {
	constructor({ position = new Vector(), acceleration = new Vector(), mass = 1 } = {}) {
		this.position = position;
		this.acceleration = acceleration;
		this.mass = mass;
		this.radius = this.mass;

		this.velocity = new Vector();
	}

	/**
	 * http://natureofcode.com/book/chapter-2-forces/, Chapter 2.7
	 * friction: -1 * u * N * v;
	 * friction: opposite direction of normalized velocity
	 *
	 * @param {Number} u coefficient of friction, constant
	 * @param {N} N: normal force, for now constant 1
	 */
	applyFriction(u = 0.08, N = 1) {
		const friction = this.velocity
			.clone()
			.normalize()
			.multiplySelf(-1)
			.multiplySelf(u)
			.multiplySelf(N);

		this.applyForce(friction);
	}

	/**
	 * http://natureofcode.com/book/chapter-2-forces/, Chapter 2.6
	 * the applied acceleration is calculated: as acceleration = force / mass
	 * applied gravity is the same for objects with different masses, therefore
	 * gravity = gravity * mass
	 *
	 * @param {Vector} gravity
	 */
	applyGravity(gravity) {
		this.applyForce(gravity.multiply(this.mass));
	}

	/**
	 * http://natureofcode.com/book/chapter-2-forces/, Chapter 2.8
	 * Fd = -0.5 * (p * v^2) * A * Cd * u
	 *
	 * @param {Number} p density of liquid, constant. default 1
	 * @param {Number} A frontal area of object pushing through the liquid, default 1
	 * @param {Number} Cd coefficient of drag, constant. default 0.1
	 */
	applyDrag(p = 1, A = 1, Cd = 0.1) {
		// force drag = -0.5 * (p * (v * v)) * A * cD * u
		// force drag = -0.5 * (p * (speed * speed)) * A * cD * u
		// force drag = -0.5 * (p * (speed * speed)) * A * cD * normalized velocity
		const speed = this.velocity.length;
		const magnitude = (p * speed * speed) * A * Cd;

		const drag = this.velocity
			.clone()
			.normalize()
			.multiplySelf(-0.5)
			.multiplySelf(magnitude);

		this.applyForce(drag);
	}

	/**
	 * http://natureofcode.com/book/chapter-2-forces/, chapter 2.9
	 * http://natureofcode.com/book/imgs/chapter02/ch02_06.png
	 *
	 * F = ((G * m1 * m2) / r^2) * r
	 * G = constant, 0.4
	 * m1, m2, masses of planets
	 * r: unit vector pointing from p1 to p2
	 * r^2: distance squared
	 * @param {planet} planet
	 */
	attract(planet) {
		const G = 0.4;

		const force = this.position.subtract(planet.position);
		let distance = force.length;
		distance = Math.max(5, Math.min(distance, 25));

		const strength = (G * this.mass * planet.mass) / (distance * distance);

		force.normalize();
		force.multiplySelf(strength);

		planet.applyForce(force);
	}

	/**
	 * Apply force
	 * @param {Vector} force
	 */
	applyForce(force) {
		// force = mass * acceleration
		// acceleration = force / mass
		this.acceleration.addSelf(force.divide(this.mass));
	}

	update() {
		this.velocity.addSelf(this.acceleration);
		this.position.addSelf(this.velocity);

		this.acceleration.multiplySelf(0);
	}
}

const planets = [
	new Planet({ position: new Vector(midX - 20, midY - 20), mass: 20 }),
	new Planet({ position: new Vector(midX + 50, midY + 50), mass: 5 }),
];


const clear = () => {
	ctx.globalCompositeOperation = 'destination-out';
	ctx.fillStyle = 'hsla(0, 0%, 0%, 0.5)';
	ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
	ctx.globalCompositeOperation = 'lighter';
};

const loop = () => {
	clear();

	const [planetLarge, planetSmall] = planets;
	planetLarge.attract(planetSmall);

	planets.forEach((planet) => {
		planet.update();

		ctx.beginPath();
		ctx.arc(planet.position.x, planet.position.y, planet.radius, 0, PI2);
		ctx.fill();
		ctx.closePath();

		if (planet.position.y > canvasHeight) {
			planet.velocity.y *= -1;
			planet.position.y = canvasHeight;
		}

		if (planet.position.x < 0 || planet.position.x > canvasWidth) {
			planet.velocity.x *= -1;
			planet.position.x = planet.position.x < 0 ? 0 : canvasWidth;
		}
	});

	requestAnimationFrame(loop);
};

document.body.appendChild(canvas);

loop();
