// HERE COMES THE PPAAAAAIN!

(function() {
	'use strict';

	var PI = Math.PI,
		PI2 = PI * 2,

		w = window.innerWidth,
		h = window.innerHeight,

		hypo = 0,

		canvas = document.querySelector('.js-stage'),
		ctx = canvas.getContext('2d'),

		trails = [],

		options = {
			numTrails: 2,
			branches: 4,
			size: 4,
			speed: 0.05,
			radius: 40,
			angle: 0,
			decay: 0.002,
			trailLength: 0.9,
			alternateColors: false
		};

	init();

	function toDegrees(radians) {
		return radians * (180 / PI);
	}

	function toRadians(degrees) {
		return degrees * (PI / 180);
	}

	function randomBetween(min, max, round) {
		var rand = Math.random()*(max-min+1)+min;
		if (round === true) {
			return Math.floor(rand);
		} else {
			return rand;
		}
	}

	function init() {
		initEvents();
		initUI();
		initStage();

		run();
	}

	function initEvents() {
		window.addEventListener('resize', initStage);
	}

	function initUI() {
		var gui = new dat.GUI();

		gui.add(options, 'numTrails', 2, 40).step(1).onFinishChange(initStage);
		gui.add(options, 'branches', 0, 5).step(1).onFinishChange(initStage);
		gui.add(options, 'size', 1, 7).onFinishChange(initStage);
		gui.add(options, 'radius', 10, 60).step(1).onFinishChange(initStage);
		gui.add(options, 'speed', 0.01, 0.1).onFinishChange(initStage);
		gui.add(options, 'trailLength', 0, 1).step(0.05).onFinishChange(initStage);
		gui.add(options, 'decay', 0.001, 0.009).onFinishChange(initStage);
		gui.add(options, 'alternateColors').onFinishChange(initStage);
	}

	function initStage() {
		w = window.innerWidth;
		h = window.innerHeight;

		hypo = Math.sqrt((w >> 1) * (w >> 1) + (h >> 1) * (h >> 1));
		hypo *= 0.75;

		canvas.setAttribute('width', w);
		canvas.setAttribute('height', h);

		ctx.clearRect(0, 0, w, h);

		initTrails();
	}

	function initTrails() {
		var i = options.numTrails,
			angleStep = PI2 / options.numTrails,
			radius = options.radius,
			size = options.size,
			branches = options.branches,
			speed = options.speed,
			angle = 0,
			angleTo,
			trail,

			x, y;

		// reset trails array
		trails = [];

		while (i--) {
			angleTo = angle + toRadians(180);

			trail = new Trail(w >> 1, h >> 1, angle, angleTo, radius, speed, size, branches);
			trails.push(trail);

			angle += angleStep;
			speed = -speed;
		}
	}

	function Trail(x, y, angle, angleTo, radius, speed, size, branches) {
		this.x = x;
		this.y = y;

		this.centerX = x;
		this.centerY = y;

		this.size = size;
		this.radius = radius;
		this.speed = speed;

		this.decay = options.decay;
		this.opacity = 1;
		this.color = this.speed < 0 && options.alternateColors ? '#E23C3C' : '#14AACE';

		this.branches = branches;
		this.bloomed = false;
		this.iteration = 0;

		this.angle = angle;
		this.angleInitial = this.angle;

		this.angleTo = angleTo;

		if (this.speed < 0 && this.angleTo > this.angle) {
			this.angleTo = this.angle - (this.angleTo - this.angle);
		} else if (this.speed > 0 && this.angleTo < this.angle) {
			this.angleTo = PI2 + this.angleTo;
		}

		this.diff = this.angleTo - this.angle;

		this.update = function(ctx) {
			if (this.isDead === true) {
				return;
			}

			var distance = (Math.sqrt((this.x - (w >> 1)) * (this.x - (w >> 1)) + (this.y - (h >> 1)) * (this.y - (h >> 1))) / hypo);
			this.opacity = 1  - distance;

			if (	this.speed > 0 && Math.abs(this.angle) >= Math.abs(this.angleTo)
				||	this.speed < 0 && this.angle <= this.angleTo) {

				this.centerX = this.x + Math.cos(this.angle) * this.radius;
				this.centerY = this.y + Math.sin(this.angle) * this.radius;

				this.angle = this.angleTo + PI;

				if (this.angle >= PI2) {
					this.angle = this.angle % PI2;
				}

				this.angleTo = this.angle - this.diff;

				this.speed = -this.speed;
				this.diff = -this.diff;
				this.iteration += 1;

				if (this.iteration === 2) {
					var branches = this.branches,
						spread = toRadians(300),
						angle = this.angle,
						angleStep = spread / branches,
						angleTo = this.angle + angleStep; // this.angleTo - (spread * 0.5),

					while (branches--) {
						trails.push(new Trail(
							this.centerX,
							this.centerY,
							angle,
							angleTo,
							this.radius * 0.9,
							-this.speed * 0.5,
							this.size * 0.95,
							branches
						));

						angleTo += angleStep;
					}
				}
			}

			if (this.x <= 0 || this.x >= w || this.y <= 0 || this.y >= h || this.size <= 0) {
				this.isDead = true;
			}

			this.x = this.centerX + (Math.cos(this.angle) * this.radius);
			this.y = this.centerY + (Math.sin(this.angle) * this.radius);

			this.size -= this.decay;
			this.angle += this.speed;
		};

		this.draw = function(ctx) {
			if (this.isDead === true || this.size < 0) return;

			ctx.beginPath();
			ctx.fillStyle = 'rgba(255, 0, 0, '+ this.opacity + ')';
			// ctx.fillStyle = this.color;

			ctx.arc(this.x, this.y, this.size, 0, PI2);
			ctx.fill();
			ctx.closePath();
		};

	}

	var canvasRotation = 0;

	function run() {
		var i = trails.length,
			distance,
			q;

		// clear trails
		// ctx.fillStyle = 'rgba(34, 34, 34, ' + (1 - options.trailLength) + ')';
		ctx.fillStyle = 'rgba(34, 34, 34, 0.005)';
		ctx.fillRect(0, 0, w, h);

		// ctx.globalCompositeOperation = 'source-over';
		// ctx.fillStyle = "rgba(0, 200, 200, 0.02)";
		// ctx.fillRect(0, 0, w, h);
		// ctx.globalCompositeOperation = 'darker';

		while (i--) {
			trails[i].update(ctx);
			trails[i].draw(ctx);

			if (trails[i].isDead) {
				trails.splice(i, 1);
			}
		}

		window.requestAnimationFrame(run);
	}

})();