// http://natureofcode.com/book/chapter-2-forces/
// https://github.com/bit101/CodingMath/blob/master/episode11/vector.js
// http://codingmath.com/posts/episode11.html

/**
 * gravity simplified:
 * gravity = M / r2
 * gravity = Mass / (radius * radius)
 *
 * mass: 	amount of matter in object (measured in KG)
 * weight: 	force of gravity applied on object (measured in Newton (N))
 *			weight = mass times the acceleration of gravity (w = m * g)
 * location is adjusted by velocity, and velocity by acceleration
 * acceleration is equal to the sum of all forces divided by mass
**/

var Vector = (function() {
	return function(x, y) {
		this.x = x || 0;
		this.y = y || 0;

		this.add = function(vec) {
			return new Vector(this.x + vec.x, this.y + vec.y);
		};

		this.addTo = function(vec) {
			this.x += vec.x;
			this.y += vec.y;
		};

		this.sub = function(vec) {
			return new Vector(this.x - vec.x, this.y - vec.y);
		};

		this.div = function(val) {
			return new Vector(this.x / val, this.y /val);
		};

		this.divFrom = function(val) {
			this.x /= val;
			this.y /= val;
		};

		this.mult = function(val) {
			return new Vector(this.x * val, this.y * val);
		};

		this.normalize = function() {
			var l = this.getLength();

			if (l !== 0) {
				this.divFrom(l);
			}
		};

		this.limit = function(vec) {
			if (this.x > vec.x) {
				this.x = vec.x;
			}

			if (this.y > vec.y) {
				this.y = vec.y;
			}
		};

		this.getAngle = function() {
			return Math.atan2(this.y, this.x);
		};

		this.setAngle = function(angle) {
			var length = this.getLength();
			this.x = Math.cos(angle) * length;
			this.y = Math.sin(angle) * length;
		};

		this.getLength = function() {
			return Math.sqrt(this.x * this.x + this.y * this.y);
		};

		this.setLength = function(length) {
			var angle = this.getAngle();
			this.x = Math.cos(angle) * length;
			this.y = Math.sin(angle) * length;
		};
	};
})();


var Particle  = (function() {
	return function(position, speed, direction) {
		this.position = position;
		this.velocity = new Vector();
		this.velocity.setLength(speed);
		this.velocity.setAngle(direction);


		this.update = function() {
			this.position = this.position.add(this.velocity);
		};

		this.distanceBewteen = function(p2) {
			var dx = p2.position.x - this.position.x,
				dy = p2.position.y - this.position.y;

			return Math.sqrt(dx * dx + dy * dy);
		};

		this.angleBetween = function(p2) {
			return Math.atan2(p2.position.y - this.position.y, p2.position.x - this.position.x);
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

var Planet = (function() {
	return function(position, speed, direction, mass, color) {
		// Planet extends Particle
		Particle.call(this, position, speed, direction);

		this.mass = mass;
		this.color = color;


		this.gravitateTo = function(p2) {
			var gravity = new Vector(0, 0),
				distance = this.distanceBewteen(p2);

			gravity.setLength(p2.mass / (distance * distance));
			gravity.setAngle(this.angleBetween(p2));
			this.velocity.addTo(gravity);
		};
	};
})();

(function() {
	var canvas = document.querySelector('.js-canvas-particles'),
		ctx = canvas.getContext('2d'),
		w = window.innerWidth,
		h = window.innerHeight;

	canvas.setAttribute('width', w);
	canvas.setAttribute('height', h);

	var earth = new Planet(
			new Vector(w * 0.5, h * 0.5),	// location
			0,								// velocity
			0, 								// direction
			20000,							// mass
			'#0e83af'						// color
		),
		planet = new Planet(
			new Vector(w * 0.5 + 200, h * 0.5),	// location
			0,				// velocity
			0,			// direction
			10,				// mass,
			'#af9a0e'		// color
		);

	document.addEventListener('mousemove', function(e) {
		// var mX = e.clientX,
		// 	mY = e.clientY;

		// earth.position.x = mX;
		// earth.position.y = mY;
	});

	update();

	function update() {
		window.requestAnimationFrame(update);
		ctx.clearRect(0, 0, w, h);

		earth.update();
		ctx.beginPath();
		ctx.arc(earth.position.x, earth.position.y, 50, 0, 2 * Math.PI, false);
		ctx.fillStyle = earth.color;
		ctx.fill();

		planet.gravitateTo(earth);
		planet.update();
		ctx.beginPath();
		ctx.arc(planet.position.x, planet.position.y, 10, 0, 2 * Math.PI, false);
		ctx.fillStyle = planet.color;
		ctx.fill();
	}
})();
