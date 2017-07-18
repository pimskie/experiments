// http://natureofcode.com/book/chapter-2-forces/#intro_section4
// https://github.com/bit101/CodingMath/blob/master/episode11/vector.js
// http://codingmath.com/posts/episode11.html

/**
 * gravity simplified:
 * gravity = M / r2
 * gravity = Mass / radius square
**/

/**
 * gravity simplified:
 * gravity = M / r2
 * gravity = Mass / radius square
**/



var Particle  = (function() {
	return function(x, y, direction, speed, mass, gravity) {
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
		this.gravity = gravity || 0;
		this.radius = this.mass * 10;

		this.update = function() {
			// add acceleration to velocity
			this.velX += this.accX;
			this.velY += this.accY;

			// add velocity to position
			this.x += this.velX;
			this.y += this.velY;

			// reset acceleration
			this.accX = this.accY = 0;

			this.checkBounds();
		};

		this.getLength = function() {
			// var l = Math.sqrt(this.x * this.x + this.y * this.y);
			// return l;
			return Math.sqrt(this.velX * this.velX + this.velY * this.velY);

		};

		this.setDirection = function(direction) {
			var length = this.getLength();
			this.velX = Math.cos(direction) * length;
			this.velY = Math.sin(direction) * length;
		};

		this.setBounds = function(x, y, w, h) {
			this.boundX = x;
			this.boundY = y;
			this.boundWidth = w;
			this.boundHeight = h;
		};

		this.checkBounds = function() {
			if (!this.boundWidth || !this.boundHeight) {
				return false;
			}

			if (this.x + this.radius >= this.boundWidth) {
				this.x = this.boundWidth - this.radius;
				this.velX *= -1;

			} else if (this.x - this.radius < this.boundX) {
				this.x = this.radius;
				this.velX *= -1;
			}

			if (this.y + this.radius >= this.boundHeight) {
				this.y = this.boundHeight - this.radius;
				this.velY *= -1;
			}

			if (this.y - this.radius< this.boundY) {
				this.y = this.radius;
				this.velY *= -1;
			}
		};

		// Newton's second law
		// force = mass * acceleration
		// F = M * A
		// A = F / M
		this.applyForce = function(fx, fy) {
			fx /= this.mass;
			fy /= this.mass;

			this.accX += fx;
			this.accY += fy;
		};

		this.applyGravity = function(gx, gy) {
			gx *= this.mass;
			gy *= this.mass;

			this.applyForce(gx, gy);
		};

		this.applyFriction = function(fric) {
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
		};

		// drag force = coefficient * speed * speed
		this.applyDrag = function(c) {
			var length = this.getLength(),
				dragMagnitude  = c * speed * speed,
				dragX = -this.velX,
				dragY = -this.velY;

			if (length !== 0) {
				// drag moves in the opposite direction of velocity
				dragY /= length;

				dragY *= c;
				this.applyForce(0, dragY);
			}
		};

		this.isInside = function(obj) {
			if (this.y > obj.y && this.y <= obj.y + obj.height) {
				return true;
			}

			return false;
		};

		/*
		// Keith Peters
		// http://codingmath.com/posts/episode18.html
		// https://github.com/bit101/CodingMath/blob/master/episode18/particle.js
		this.angleBetween = function(p2) {
			var dx = p2.x - this.x,
				dy = p2.y - this.y,
				distSQ = dx * dx + dy * dy,
				dist = Math.sqrt(distSQ),
				force = p2.mass / distSQ,
				ax = dx / dist * force,
				ay = dy / dist * force;

			this.vx += ax;
			this.vy += ay;
		}
		*/
	};
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


	var TO_RADIAN = Math.PI / 180,
		canvas = document.querySelector('.js-canvas-particles'),
		ctx = canvas.getContext('2d'),
		w = window.innerWidth,
		h = window.innerHeight,

		NUM_PLANETS = 10,
		planets = [];

	canvas.setAttribute('width', w);
	canvas.setAttribute('height', h);

	// create planets
	var i = NUM_PLANETS,
		planet,
		posX,
		mass;

	while (i--) {
		mass = randomBetween(1, 3);
		planet = new Particle(Math.random() * w, 100, 90*TO_RADIAN, 0, mass);
		planet.color = 'rgba(255, 0, 0, 0.8)';

		planet.setBounds(0, 0, w, h);
		planets.push(planet);
	}

	// setup liquid
	var liquid = {
		x: 0,
		y: h >> 1,
		width: w,
		height: h >> 1,
		c: 0.9
	};

	loop();

	function loop() {
		stats.begin();

		ctx.fillStyle = 'rgba(0, 0, 0, 1)';
		ctx.fillRect(0, 0, w, h);

		// update and draw planets
		var i = NUM_PLANETS,
		planet;
		while (i--) {
			planet = planets[i];

			planet.applyFriction(0.1);
			planet.applyGravity(0, 0.3);
			//planet.applyForce(1, 0);

			// add drag
			if (planet.isInside(liquid)) {
				planet.applyDrag(liquid.c);
			}

			planet.update();

			ctx.beginPath();
			ctx.arc(planet.x, planet.y, planet.radius, 0, 2 * Math.PI, false);
			ctx.fillStyle = planet.color;
			ctx.fill();
			ctx.closePath();
		}

		// draw liquid
		ctx.beginPath();
		ctx.rect(liquid.x, liquid.y, liquid.width, liquid.height);
		ctx.fillStyle = 'rgba(21, 180, 235, 0.2)';
		ctx.fill();
		ctx.closePath();

		stats.end();
		window.requestAnimationFrame(loop);
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