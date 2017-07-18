/* globals Vector: false, */

const canvas = document.createElement('canvas');
const ctx = canvas.getContext('2d');
canvas.classList.add('canvas');

const canvasWidth = 500;
const canvasHeight = 500;
const midX = canvasWidth >> 1;
const midY = canvasHeight >> 1;

const PI2 = Math.PI * 2;

let isMouseDown = false;


canvas.width = canvasWidth;
canvas.height = canvasHeight;

class Planet {
	constructor({ position = new Vector(), acceleration = new Vector(), mass = 1, velocity = new Vector(), color = '#000' } = {}) {
		this.position = position;
		this.acceleration = acceleration;
		this.velocity = velocity;
		this.mass = mass;
		this.radius = this.mass;
		this.color = color;

	}

	checkCollision(width, height, planets = []) {
		if (this.position.x < 0 || this.position.x > width) {
			this.velocity.x *= -1;
			this.velocity.multiplySelf(0.8);
		}

		if (this.position.y < 0 || this.position.y > height) {
			this.velocity.y *= -1;
			this.velocity.multiplySelf(0.8);
		}

		planets
			.filter(planet => planet !== this)
			.forEach((planet) => {
				const radii = this.radius + planet.radius;
				const dist = this.position.subtract(planet.position).length;

				if (dist <= radii) {
					const angle = Math.atan2(planet.position.y - this.position.y, planet.position.x - this.position.x);
					planet.velocity.angle = angle;
				}
			});
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

	attractOther(planets = []) {
		this.attract(this, planets);
	}

	gravitateTo(planet) {
		this.attract(planet, this);
	}

	/**
	 * http://natureofcode.com/book/chapter-2-forces/, chapter 2.9
	 * http://natureofcode.com/book/imgs/chapter02/ch02_06.png
	 *
	 * F = ((G * m1 * m2) / r^2) * r
	 * G = constant, 0.4
	 * m1, m2, masses of planets
	 * r: unit vector (normalized) pointing from p1 to p2
	 * r^2: distance squared
	 * @param {Array} planets
	 */
	attract(movers, G = 0.4, isRepelling = false) {
		movers = Array.isArray(movers) ? movers : [movers];

		movers.forEach((mover) => {
			const r = this.position.subtract(mover.position);
			let distance = r.length;
			distance = Math.max(5, Math.min(distance, 25));

			const mod = isRepelling ? -1 : 1;
			const strength = mod * (G * this.mass * mover.mass) / (distance * distance);

			r.normalize();
			r.multiplySelf(strength);

			mover.applyForce(r);
		});
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

const maxVel = 1;
const planets = [
	new Planet({ position: new Vector(midX, midY), mass: 30 }),
];

for (let i = 0; i < 100; i++) {
	// planets.push(new Planet({
	// 	position: new Vector(Math.random() * canvasWidth, Math.random() * canvasHeight),
	// 	velocity: new Vector((Math.random() * (maxVel - -maxVel + 1)) - maxVel, (Math.random() * (maxVel - -maxVel + 1)) - maxVel),
	// 	mass: 2 + (Math.random() * 10),
	// }));

	planets.push(new Planet({
		position: new Vector(100, canvasHeight - 100),
		velocity: new Vector(2, 2),
		mass: 2 + (Math.random() * 10),
	}));
}

const [planetLarge] = planets;

const mouse = new Planet({ mass: 10 });
mouse.falloff = 50;

canvas.addEventListener('mousemove', (e) => {
	mouse.position.x = e.clientX;
	mouse.position.y = e.clientY;
});

canvas.addEventListener('mousedown', () => isMouseDown = true);
document.body.addEventListener('mouseup', () => isMouseDown = false);


const clear = () => {
	ctx.fillStyle = 'rgba(255, 255, 255, 1)';
	ctx.fillRect(0, 0, canvasWidth, canvasHeight);
};

const loop = () => {
	clear();

	if (isMouseDown) {
		ctx.beginPath();
		ctx.strokeStyle = '#ccc';
		ctx.arc(mouse.position.x, mouse.position.y, mouse.falloff, 0, PI2);
		ctx.stroke();
		ctx.closePath();

		mouse.attract(planets.filter(p => p !== planetLarge), 0.3, true);
	}

	planetLarge.attract(planets, 0.4);

	planets.forEach((planet) => {
		// planet.attract(planets.filter(p => p !== planet && p !== planetLarge), 0.1, isMouseDown);
		planet.checkCollision(canvasWidth, canvasHeight);
		planet.update();
		// planet.applyDrag(0.05, planet.mass);

		ctx.beginPath();
		ctx.fillStyle = planet.color;
		ctx.arc(planet.position.x, planet.position.y, planet.radius, 0, PI2);
		ctx.fill();
		ctx.closePath();
	});

	requestAnimationFrame(loop);
};

document.body.appendChild(canvas);

loop();
