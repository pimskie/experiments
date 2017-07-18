// http://natureofcode.com/book/chapter-2-forces/#intro_section4
// http://www.arachnoid.com/orbital_dynamics/index.html
// http://www.dummies.com/how-to/content/how-to-calculate-a-satellites-speed-around-the-ear.html
// http://codingmath.com/

var Particle  = (function() {
	function Particle(x, y, direction, speed, mass, maxX, maxY) {
		// position
		this.x = x;
		this.y = y;

		this.maxX = maxX;
		this.maxY = maxY;

		// velocity
		this.velX = Math.cos(direction) * speed;
		this.velY = Math.sin(direction) * speed;

		this.direction = direction;

		// acceleration
		this.accX = 0;
		this.accY = 0;

		this.mass = mass || 1;
		this.radius = this.mass ;
		this.color = 'blue';

		return this;
	}

	Particle.prototype = {
		update: function() {
			// add acceleration to velocity
			this.velX += this.accX;
			this.velY += this.accY;

			// add velocity to position
			this.x += this.velX;
			this.y += this.velY;

			// reset acceleration
			this.accX = this.accY = 0;

			if (this.x <= 0 || this.x >= this.maxX) {
				this.velX = -this.velX;
			}

			if (this.y <= 0 || this.y >= this.maxY) {
				this.velY = -this.velY;
			}

			return this;
		},

		// get the length of the vector
		getLength: function() {
			return Math.sqrt(this.velX*this.velX + this.velY*this.velY);

		},

		// set direction of the vector
		setDirection: function(direction) {
			var length = this.getLength();
			this.velX = Math.cos(direction) * length;
			this.velY = Math.sin(direction) * length;
		},

		// Newton's second law
		// force = mass * acceleration
		// F = M * A
		// A = F / M
		applyForce: function(fx, fy) {
			fx /= this.mass;
			fy /= this.mass;

			this.accX += fx;
			this.accY += fy;
		},

		// apply gravity to vector
		applyGravity: function(gx, gy) {
			gx *= this.mass;
			gy *= this.mass;

			this.applyForce(gx, gy);
		},

		// apply friction to vector
		applyFriction: function(fric) {
			var length = this.getLength(),
				inverseVelX = -this.velX,
				inverseVelY = -this.velY;

			if (length !== 0) {
				inverseVelX /= length;
				inverseVelY /= length;

				inverseVelX *= fric;
				inverseVelY *= fric;

				this.applyForce(inverseVelX, inverseVelY);
			}
		},

		// apply drag to vector
		// drag force = coefficient * speed * speed
		applyDrag: function(c) {
			var length = this.getLength(),
				dragMagnitude  = c * speed * speed,
				dragX = -this.velX,
				dragY = -this.velY;

			if (length !== 0) {
				// drag moves in the opposite direction of velocity
				dragY /= length;

				dragY *= 0.2; //c;
				this.applyForce(0, dragY);
			}
		},

		// gravitate the vector to another vector
		gravitateTo: function(p2) {
			var G = 0.4,
				dx = p2.x - this.x,
				dy = p2.y - this.y,
				distance = Math.sqrt(dx * dx + dy * dy),
				force = G * (this.mass * p2.mass) / distance,

				// A normalized direction vector (or unit vector) is computed to provide
				// a direction for the gravitational force scalar
				unitX = dx / distance,
				unitY = dy / distance,

				// The velocity vector is updated by gravitational acceleration multiplied by the unit vector
				fx = force * unitX,
				fy = force * unitY;

			this.applyForce(fx, fy);

		}
	};

	return Particle;

})();

(function() {
	// some constants
	var TO_RADIAN = Math.PI / 180,
		TWO_PI = Math.PI * 2,

		btn = document.querySelector('.btn'),
		canvas = document.querySelector('.js-canvas'),
		ctx = canvas.getContext('2d'),
		canvas2 = document.querySelector('.js-canvas-static'),
		ctxStatic = canvas2.getContext('2d'),

		w = window.innerWidth,
		h = window.innerHeight,

		raf = null,

		// particle vars
		MAX_PARTICLES = 1000,
		particles = [],
		particlesIdle = [],
		attractors = [],
		particleAngle = 5;

	// set canvas size
	canvas.setAttribute('width', w);
	canvas.setAttribute('height', h);

	canvas2.setAttribute('width', w);
	canvas2.setAttribute('height', h);

	// add listeners
	btn.addEventListener('mousedown', rerun);
	canvas2.addEventListener('mousedown', addAttractor);
	window.addEventListener('resize', resize);

	var emitter;

	var rad = (Math.random() * 360) * TO_RADIAN,
		q,
		p;

	gogogo();

	function gogogo() {
		emitter = new Particle(20, h >> 1, 0, 0, 10, w, h);
		emitter.color = 'black';
		ctxStatic.beginPath();
		ctxStatic.fillStyle = emitter.color;
		ctxStatic.arc(emitter.x, emitter.y, emitter.radius, 0, TWO_PI, true);
		ctxStatic.fill();
		ctxStatic.closePath();

		for (q = 0; q < MAX_PARTICLES; q++) {
			p = createParticle();
			particles.push(p);
		}

		loop();
	}

	function loop() {
		// clear stage
		ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
		ctx.fillRect(0, 0, w, h);

		var particleCount = particles.length,
			attractorCount = attractors.length,
			particle,
			attractor;

		// create particles if allowed
		if (particleCount < MAX_PARTICLES) {
			particle = getParticle();
			particles.push(p);
		}

		// loop through particles
		var q,
			i;

		for (q = 0; q < particleCount; ++q) {
			particle = particles[q];

			particle.update();

			for (i = 0; i < attractorCount; i++) {
				attractor = attractors[i];
				particle.gravitateTo(attractor);
			}

			ctx.beginPath();
			ctx.fillStyle = particle.color;
			ctx.arc(particle.x, particle.y, particle.radius, 0, TWO_PI, true);
			ctx.fill();
			ctx.closePath();

		}

		raf = window.requestAnimationFrame(loop);
	}

	function getParticle() {
		var p = createParticle();

		if (particlesIdle.length > 0) {
			p = particlesIdle.pop();
		} else {
			p = createParticle();
		}

		return p;
	}

	function createParticle() {
		var angle = randomBetween(-0.7, 0.3),
			speed = 1, //randomBetween(2, 5),
			mass = 1, // randomBetween(2, 5),
			p = new Particle(emitter.x, emitter.y, angle, speed, mass, w, h);

		p.color = '#333';
		return p;
	}

	function addAttractor(e) {
		// create attractor
		var x = e.clientX,
			y = e.clientY,
			m = randomBetween(5, 15),
			attractor = new Particle(x, y, 0, 0, m);

		attractor.color = '#bababa';
		attractors.push(attractor);

		// draw them on the static stage
		var z = attractors.length,
			a;

		while (z--) {
			a = attractors[z];
			ctxStatic.beginPath();
			ctxStatic.fillStyle = a.color;
			ctxStatic.arc(a.x, a.y, a.radius, 0, TWO_PI, true);
			ctxStatic.fill();
			ctxStatic.closePath();
		}
	}

	function rerun() {
		reset();
	}

	function resize() {
		w = window.innerWidth;
		h = window.innerHeight;

		canvas.setAttribute('width', w);
		canvas.setAttribute('height', h);

		canvas2.setAttribute('width', w);
		canvas2.setAttribute('height', h);

		reset();
	}

	function reset() {
		attractors = [];
		particles = [];

		ctx.fillStyle = 'rgba(255, 255, 255, 1)';
		ctx.fillRect(0, 0, w, h);

		ctxStatic.clearRect(0, 0, ctxStatic.canvas.width, ctxStatic.canvas.height);

		window.cancelAnimationFrame(raf);

		gogogo();
	}

	// util functions
	function randomBetween(min, max, round) {
		var rand = Math.random()*(max-min+1)+min;
		if (round === true) {
			return Math.floor(rand);
		} else {
			return rand;
		}
	}
})();