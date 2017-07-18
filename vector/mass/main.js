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

		this.velocity = new Vector();
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
	new Planet({ position: new Vector(Math.random() * canvasWidth, 0), mass: Math.random() * 10 }),
	new Planet({ position: new Vector(Math.random() * canvasWidth, 0), mass: Math.random() * 10 }),
	new Planet({ position: new Vector(Math.random() * canvasWidth, 0), mass: Math.random() * 10 }),
];


const clear = () => {
	ctx.globalCompositeOperation = 'destination-out';
	ctx.fillStyle = 'hsla(0, 0%, 0%, 0.5)';
	ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
	ctx.globalCompositeOperation = 'lighter';
};

const wind = new Vector(0.03, 0);
const gravity = new Vector(0, 0.5);

const loop = () => {
	clear();

	// let planet = planets[0];

	planets.forEach((planet) => {
		planet.applyForce(wind);

		// http://natureofcode.com/book/chapter-2-forces/, Chapter 2.6
		planet.applyForce(gravity.multiply(planet.mass));
		planet.update();

		ctx.beginPath();
		ctx.arc(planet.position.x, planet.position.y, planet.mass * 2, 0, PI2);
		ctx.fill();
		ctx.closePath();

		if (planet.position.y > canvasHeight) {
			planet.velocity.y *= -1;
			planet.position.y = canvasHeight;
			planet.velocity.multiplySelf(FRICTION);
		}

		if (planet.position.x < 0 || planet.position.x > canvasWidth) {
			planet.velocity.x *= -1;
			planet.position.x = planet.position.x < 0 ? 0 : canvasWidth;
			planet.velocity.multiplySelf(FRICTION);
		}
	});

	requestAnimationFrame(loop);
};

document.body.appendChild(canvas);

loop();
