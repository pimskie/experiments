/* globals Vector: false, Stats: false, */

const canvas = document.querySelector('canvas');
const ctx = canvas.getContext('2d');

const canvasWidth = window.innerWidth;
const canvasHeight = window.innerHeight;

const midX = canvasWidth >> 1;
const midY = canvasHeight >> 1;

canvas.width = canvasWidth;
canvas.height = canvasHeight;

const PI2 = Math.PI * 2;
const imageData = ctx.createImageData(canvasWidth, canvasHeight);

const stats = new Stats();
stats.showPanel(0);
document.querySelector('.js-stats').appendChild(stats.domElement);

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
		this.velocity.addSelf(this.acceleration);
		this.position.addSelf(this.velocity);
		this.acceleration.multiplySelf(0);
	}
}

const pixelIndex = (x, y, imageData) => (~~x + ~~y * imageData.width) * 4;

const mouse = new Planet({ mass: 50 });
mouse.isDown = false;
mouse.isActive = false;

const attractors = [
	new Planet({ position: new Vector(midX, midY), mass: 30, color: 'rgba(255, 255, 255, 1)' }),
];

const planets = [];
const r = Math.min(midX, midY) - 50;

for (let i = 0; i < 10000; i++) {
	const angle = Math.random() * PI2;

	const position = new Vector(
		midX + (Math.cos(angle) * r),
		midY + (Math.sin(angle) * r)
	);

	const velocity = new Vector(
		Math.random() * 4 - 2,
		Math.random() * 4 - 2
	);

	const mass = 2 + (Math.random() * 10);

	planets.push(new Planet({
		position,
		velocity,
		mass,
	}));
}

const drawCircle = (planet) => {
	ctx.beginPath();
	ctx.strokeStyle = planet.color;
	ctx.fillStyle = '#000';
	ctx.lineWidth = 2;
	ctx.arc(planet.position.x, planet.position.y, 10, 0, PI2);
	ctx.fill();
	ctx.stroke();
	ctx.closePath();
};

const falloff = 300;
let tick = 0;

const loop = () => {
	stats.begin();

	if (mouse.isActive) {
		mouse.attract(planets, 0.4);
	}

	planets.forEach((planet) => {
		const pos = planet.position;
		let index = pixelIndex(pos.x, pos.y, imageData);

		const distance = Math.sqrt((mouse.position.x - pos.x) * (mouse.position.x - pos.x) + (mouse.position.y - pos.y) * (mouse.position.y - pos.y));
		const length = Math.min(falloff, distance / falloff);

		const data = imageData.data;
		data[index] = 0;
		data[index + 1] = 0;
		data[index + 2] = 0;
		data[index + 3] = 0;

		planet.applyDrag(0.1, 1, 0.05);
		planet.update();

		const [r, g, b, a] = [255, ~~(50 * length), ~~(255 * Math.cos(tick)), 255];

		if (pos.x > 0 && pos.x < canvasWidth && pos.y > 0 && pos.y < canvasHeight) {
			index = pixelIndex(pos.x, pos.y, imageData);
			data[index] = r;
			data[index + 1] = g;
			data[index + 2] = b;
			data[index + 3] = a;
		}

	});

	tick += 0.01;
	ctx.putImageData(imageData, 0, 0);

	attractors.forEach((attractor) => {
		attractor.attract(planets, 0.4, attractor.isRepeller && attractor.isRepeller === true);
		drawCircle(attractor);
	});

	stats.end();

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


canvas.addEventListener('mouseenter', () => {
	mouse.isActive = true;
});

canvas.addEventListener('mouseout', () => {
	mouse.isActive = false;
});


document.body.addEventListener('mouseup', (e) => {
	const createRepeller = e.ctrlKey;

	const mousePos = new Vector(e.clientX, e.clientY);
	const clickedAttractor = attractors.filter(a => mousePos.subtract(a.position).length < a.radius);

	if (clickedAttractor.length) {
		attractors.splice(attractors.indexOf(clickedAttractor.pop()), 1);
	} else if (attractors.length < 10) {
		const planet = new Planet({
			position: new Vector(e.clientX, e.clientY),
			mass: 15,
			color: createRepeller ? 'rgba(200, 20, 0, 1)' : 'rgba(255, 255, 255, 1)',
		});

		planet.isRepeller = createRepeller;
		attractors.push(planet);
	}
});
