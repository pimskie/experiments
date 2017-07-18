// http://natureofcode.com/book/chapter-2-forces/#intro_section4
// http://www.arachnoid.com/orbital_dynamics/index.html
// http://www.dummies.com/how-to/content/how-to-calculate-a-satellites-speed-around-the-ear.html
// http://codingmath.com/

var Particle  = (function() {
	function Particle(x, y, direction, speed, mass) {
		// position
		this.x = x;
		this.y = y;

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
			var G = 0.7,
				dx = p2.x - this.x,
				dy = p2.y - this.y,
				distance = Math.sqrt(dx * dx + dy * dy),
				force = (G * this.mass * p2.mass) / (distance * distance),


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
	// init stats
	var stats = new Stats();
	stats.setMode(0);

	// align top-left
	stats.domElement.style.position = 'absolute';
	stats.domElement.style.right = '0px';
	stats.domElement.style.top = '0px';
	stats.domElement.style.zIndex = '999';
	document.body.appendChild(stats.domElement);


		// some constants
	var TO_RADIAN = Math.PI / 180,
		TWO_PI = Math.PI * 2,
		NUM_ATTRACTORS = 1,

		// canvas vars
		canvas = document.querySelector('.js-canvas'),
		ctx = canvas.getContext('2d'),

		canvas2 = document.querySelector('.js-canvas-draw'),
		ctxDraw = canvas2.getContext('2d'),

		canvas3 = document.querySelector('.js-canvas-static'),
		ctxStatic = canvas3.getContext('2d'),

		drawingParticle = {
			drawing: false
		},

		particles = [],
		attractors = [],

		w = window.innerWidth,
		h = window.innerHeight;

	// set canvas size
	canvas.setAttribute('width', w);
	canvas.setAttribute('height', h);
	canvas2.setAttribute('width', w);
	canvas2.setAttribute('height', h);
	canvas3.setAttribute('width', w);
	canvas3.setAttribute('height', h);

	// add listener
	document.addEventListener('mousedown', startDrawParticle);
	document.addEventListener('mouseup', stopDrawParticle);

	// create attractors
	var q,
		attractor;
	for (q = 0; q < NUM_ATTRACTORS; q++) {
		var midX = w >> 1,
			midY = h >> 1,
			rX = randomBetween(-300, 300),
			rY = randomBetween(-300, 300),
			m = randomBetween(10, 20);

		attractor = new Particle(midX + rX, midY + rY, 0, 0, m);
		attractor.color = '#000000';
		attractors.push(attractor);

		// draw them right away, that canvas don't need updates
		ctxStatic.beginPath();
		ctxStatic.fillStyle = attractor.color;
		ctxStatic.arc(attractor.x, attractor.y, attractor.radius, 0, TWO_PI);
		ctxStatic.fill();
		ctxStatic.closePath();
	}

	loop();
	function loop() {
		stats.begin();

		ctx.fillStyle = 'rgba(255, 255, 255, 0.06)';
		ctx.fillRect(0, 0, w, h);

		if (drawingParticle.drawing === true) {
			ctxDraw.clearRect(0, 0, w, h);
			ctxDraw.beginPath();
			ctxDraw.strokeStyle = '#000';
			ctxDraw.strokeWidth = '1';
			ctxDraw.moveTo(drawingParticle.toX, drawingParticle.toY);
			ctxDraw.lineTo(drawingParticle.fromX, drawingParticle.fromY);
			ctxDraw.stroke();
			ctxDraw.closePath();
		}

		var particleCount = particles.length,
			attractorCount = attractors.length,
			particle,
			attractor,
			i,
			q;

		for (i = 0; i < particleCount; i++) {
			particle = particles[i];

			if (particle.x < 0 || particle.x > w) particle.velX = -particle.velX;
			if (particle.y < 0 || particle.y > h) particle.velY = -particle.velY;

			for (q = 0; q < attractorCount; q++) {
				attractor = attractors[q];
				particle.gravitateTo(attractor);
			}

			particle.update();

			ctx.beginPath();
			ctx.fillStyle = particle.color;
			ctx.arc(particle.x, particle.y, particle.radius, 0, TWO_PI, true);
			ctx.fill();
			ctx.closePath();
		}

		stats.end();
		window.requestAnimationFrame(loop);
	}


	function startDrawParticle(e) {
		drawingParticle.drawing = true;
		drawingParticle.toX = drawingParticle.fromX = e.clientX;
		drawingParticle.toY = drawingParticle.fromY = e.clientY;

		document.addEventListener('mousemove', drawParticle);
	}

	function drawParticle(e) {
		drawingParticle.fromX = e.clientX;
		drawingParticle.fromY = e.clientY;
	}

	function stopDrawParticle(e) {
		ctxDraw.clearRect(0, 0, w, h);

		var dx = drawingParticle.toX - drawingParticle.fromX,
			dy = drawingParticle.toY - drawingParticle.fromY,
			angle = Math.atan2(dy, dx),
			speed = Math.sqrt(dx*dx + dy*dy) * 0.01,
			particle = new Particle(drawingParticle.toX, drawingParticle.toY, angle, speed, 2);

		particle.color = '#333';
		particles.push(particle);

		drawingParticle.drawing = false;
		document.removeEventListener('mousemove', drawParticle);
	}

	function randomBetween(min, max, round) {
		var rand = Math.random()*(max-min+1)+min;
		if (round === true) {
			return Math.floor(rand);
		} else {
			return rand;
		}
	}
})();