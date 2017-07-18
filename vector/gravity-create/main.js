/* globals Vector: false, */

const canvas = document.querySelector('canvas');
const ctx = canvas.getContext('2d');

let canvasWidth;
let canvasHeight;
let midX;
let midY;
const PI2 = Math.PI * 2;
const DEGREES = 180 / Math.PI;

canvas.width = canvasWidth;
canvas.height = canvasHeight;

const setupCanvas = () => {
	canvasWidth = window.innerWidth;
	canvasHeight = window.innerHeight;

	midX = canvasWidth >> 1;
	midY = canvasHeight >> 1;

	canvas.width = canvasWidth;
	canvas.height = canvasHeight;
};
setupCanvas();

class Planet {
	constructor({ position = new Vector(), acceleration = new Vector(), mass = 1, velocity = new Vector(), color = '#000' } = {}) {
		this.position = position;
		this.acceleration = acceleration;
		this.velocity = velocity;
		this.mass = mass;
		this.radius = this.mass;
		this.color = color;

		this.positionHistory = [];
	}

	checkCollision(width, height, planets = []) {
		if (width && (this.position.x < 0 || this.position.x > width)) {
			this.velocity.x *= -1;
			this.velocity.multiplySelf(0.8);
		}

		if (height && (this.position.y < 0 || this.position.y > height)) {
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
		this.positionHistory.unshift(this.position.clone());
		this.positionHistory = this.positionHistory.slice(0, 25);

		this.velocity.addSelf(this.acceleration);
		this.position.addSelf(this.velocity);
		this.acceleration.multiplySelf(0);
	}
}

const mouse = new Planet({ mass: 50 });
mouse.isDown = false;

const attractors = [
	new Planet({ position: new Vector(midX, midY), mass: 20, color: '#fff' }),
];

const planets = [];

for (let i = 0; i < 800; i++) {
	const angle = Math.random() * PI2;
	const r = 50 + Math.random() * (Math.min(midX, midY) - 50);
	const position = new Vector(
		midX + (Math.cos(angle) * r),
		midY + (Math.sin(angle) * r)
	);

	const velocity = new Vector(
		Math.random() * 2 - 1,
		Math.random() * 2 - 1
	);

	const mass = 1 + (Math.random() * 2);

	planets.push(new Planet({
		position,
		// velocity,
		mass,
	}));
}

const draw = (planet) => {
	ctx.beginPath();
	ctx.fillStyle = planet.color;
	ctx.arc(planet.position.x, planet.position.y, planet.radius, 0, PI2);
	ctx.fill();
	ctx.closePath();
};

const clear = () => {
	ctx.fillStyle = 'rgba(0, 0, 0, 1)';
	ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);

	// ctx.globalCompositeOperation = 'destination-out';
	// ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
	// ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
	// ctx.globalCompositeOperation = 'lighten';
};

const maxDistance = Math.min(canvasWidth, canvasHeight);

const loop = () => {
	clear();

	mouse.attract(planets, 0.6, mouse.isDown);

	planets.forEach((planet) => {
		const distance = Math.sqrt((mouse.position.x - planet.position.x) * (mouse.position.x - planet.position.x) + (mouse.position.y - planet.position.y) * (mouse.position.y - planet.position.y));
		const length = distance / maxDistance;
		const light =  50 + (50 - (50 * length));

		// const angle = Math.atan2(mouse.position.y - planet.position.y, mouse.position.x - planet.position.x) * DEGREES;
		const hue = 200; // angle;


		planet.color = `hsla(${hue}, 100%, ${light}%, 1)`;

		// planet.checkCollision(null, null, planets);
		// planet.applyDrag(0.1, 1, 0.01);
		planet.velocity.length = Math.min(planet.velocity.length, 5);
		planet.update();

		draw(planet);
	});


	attractors.forEach((attractor) => {
		attractor.attract(planets, 0.4, attractor.isRepeller && attractor.isRepeller === true);

		ctx.beginPath();
		ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
		ctx.fillStyle = attractor.isRepeller ? 'red' : '#232323';
		ctx.lineWidth = 1;
		ctx.arc(attractor.position.x, attractor.position.y, attractor.radius, 0, PI2);
		ctx.fill();
		ctx.closePath();
	});

	requestAnimationFrame(loop);
};


loop();

canvas.addEventListener('mousemove', (e) => {
	mouse.position.x = e.clientX;
	mouse.position.y = e.clientY;
});

canvas.addEventListener('mousedown', () => {
	mouse.isDown = true;
});

document.body.addEventListener('mouseup', (e) => {
	mouse.isDown = false;

	const createRepeller = e.ctrlKey;

	const mousePos = new Vector(e.clientX, e.clientY);
	const clickedAttractor = attractors.filter(a => mousePos.subtract(a.position).length < a.radius);

	if (clickedAttractor.length) {
		attractors.splice(attractors.indexOf(clickedAttractor.pop()), 1);
	} else if (attractors.length < 10) {
		const planet = new Planet({
			position: new Vector(e.clientX, e.clientY),
			mass: 15,
			color: createRepeller ? 'rgb(100, 0, 0)' : '#fff',
		});

		planet.isRepeller = createRepeller;
		attractors.push(planet);
	}
});


window.addEventListener('resize', () => {
	setupCanvas();
	attractors[0].position = new Vector(midX, midY);
});
