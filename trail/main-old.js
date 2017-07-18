// HERE COMES THE PPAAAAAIN!

(function() {
	'use strict';

	var PI = Math.PI,
		PI2 = PI * 2,
		NUM_TRAILS = 1,
		MAX_SPEED = 1,

		w = window.innerWidth,
		h = window.innerHeight,

		canvas = document.querySelector('.js-stage'),
		ctx = canvas.getContext('2d'),

		trail;

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
		initStage();

		run();
	}

	function initEvents() {
		window.addEventListener('resize', initStage);
	}

	function initStage() {
		w = window.innerWidth;
		h = window.innerHeight;

		canvas.setAttribute('width', w);
		canvas.setAttribute('height', h);

		initTrails();
	}

	function initTrails() {
		var t,
			x, y, velX, velY;

		trail = new Trail(w >> 1, h >> 1);
	}

	function Trail(x, y) {
		this.x = x;
		this.y = y;

		this.centerX = x;
		this.centerY = y;

		this.size = 5;
		this.radius = 50;
		this.speed = 0.05;

		this.iteration = 1;

		this.angle = toRadians(0);
		this.changeAt = toRadians(200);
		this.changeAtInital = this.changeAt;
		this.changeDiff = PI2 - this.changeAt;

		console.log('from', toDegrees(this.angle), 'to', toDegrees(this.changeAt));

		this.update = function(ctx) {
			// if ((this.changeAt > 0 && this.angle >= this.changeAt) || (this.changeAt < 0 && this.angle <= this.changeAt) || (this.angle === this.changeAt)) {
			if (Math.abs(this.angle) >= Math.abs(this.changeAt)) {

				this.centerX = this.x  + Math.cos(this.angle) * this.radius;
				this.centerY = this.y  + Math.sin(this.angle) * this.radius;

				if (toDegrees(Math.abs(this.changeAt - PI)) >= 360) {
					this.angle = Math.abs((this.changeAt - PI) % PI2);
					this.changeAtInital = -this.changeAtInital;
				} else {
					this.angle = this.changeAt - PI;
				}

				if (toDegrees(Math.abs(this.angle - this.changeAtInital)) >= 360) {
					console.log('hier gaatie gek doen');

					this.changeAt = this.angle + this.changeAtInital + Math.abs((this.angle - this.changeAtInital) % PI2);
				} else {
					this.changeAt = this.angle - this.changeAtInital;
				}


				this.speed = -this.speed;
				this.iteration += 1;

				// Test circle
				ctx.beginPath();
				ctx.strokeStyle = '#ff0000';
				ctx.lineWidth = 10;
				ctx.arc(this.centerX, this.centerY, 50, 0, PI2);
				ctx.stroke();
				ctx.closePath();

				console.log('from', toDegrees(this.angle), 'to', toDegrees(this.changeAt));

				if (this.iteration === 5) {
					//this.changeAt = 9999999999999;
				}
			}

			this.x = this.centerX + (Math.cos(this.angle) * this.radius);
			this.y = this.centerY + (Math.sin(this.angle) * this.radius);

			// console.log(this.angle);
			this.angle += this.speed;
		};

		this.draw = function(ctx) {
			ctx.beginPath();
			ctx.fillStyle = '#fff';
			ctx.arc(this.x, this.y, this.size, 0, PI2);
			ctx.fill();
			ctx.closePath();
		};

	}

	function run() {
		window.requestAnimationFrame(run);
		var distance,
			q;

		// clear trails
		ctx.fillStyle = 'rgba(0, 0, 0, 0.01)';
		ctx.fillRect(0, 0, w, h);

		trail.update(ctx);
		trail.draw(ctx);
	}

})();