define([
	'underscore',
	'Utils',
	'text!config/entity.json'
],

function(_, Utils, config) {

	function Base(id, options, vector, target) {
		this.id = null;
		this.defaults = {
			age: 0,
			chasing: false,
			color: '#ffffff',
			experience: 0,
			hunger: 0,
			mood: 0,
			panic: false,
			radius: 0,
			sickness: 0,
			state: 'wandering',
			strength: 5,
			viewDistance: 80,
			viewAngle: 45 * Utils.TO_RADIAN,
			viewColor: 'rgba(200, 60, 60, 0.5)',
			wander: false,
			wanderTime: Utils.randomBetween(1000, 4000, true)
		};

		this.animation = {
			timeCurrent: 0,
			timeTotal: 200,
			valueStart: 0,
			valueEnd: 0
		};

		options = options || {};
		this.options = _.extend(this.defaults, options);
		this.id = id;
		this.vector = vector;
		this.setTarget(target);

		this.config = JSON.parse(config);

		this.init();
	}

	Base.prototype.init = function() {

	};

	Base.prototype.update = function() {
		this.updateAngle();
		this.updateVelocity();
		this.updateRadius();
		this.updatePosition();
	};


	Base.prototype.updateVelocity = function() {
		this.vector.velX = Math.cos(this.vector.angle) * this.vector.speed;
		this.vector.velY = Math.sin(this.vector.angle) * this.vector.speed;
	};

	// http://www.kirupa.com/html5/animating_with_easing_functions_in_javascript.htm
	Base.prototype.updatePosition = function() {
		var timeWandered = Date.now() - this.options.wanderStart,
			inView = false;

		if (timeWandered >= this.options.wanderTime) {
			//this.options.status = 'idle';
		}

		var distance = Math.round(Utils.distanceBetween(this.vector, this.target));

		if (distance > this.options.radius) {
			// if entity isn't at target, move towards it
			this.vector.x += this.vector.velX;
			this.vector.y += this.vector.velY;
		} else {
			// set status to idle
			this.options.state = 'idle';
		}
	};

	// update wandering position and time
	// target is object with x / y keys
	Base.prototype.setWandering = function(target) {
		this.setTarget(target);

		this.options.state = 'wandering';
		this.options.wanderStart = Date.now();
	};

	// sets (new) target
	// target is object with x / y keys
	Base.prototype.setTarget = function(target) {
		// set the target
		this.target = target;

		this.animation.timeCurrent = 0;
		this.animation.timeTotal = 100; //Math.round(Utils.distanceBetween(this.vector, this.target) / 300 * 100);

		// update the angle
		this.setAngle();
	};

	// set entity angle
	Base.prototype.setAngle = function() {
		this.vector.angle = this.getAngle(); //this.vector.angle || 0;
		this.vector.endAngle = this.getAngle();
	};

	// update angle in animation
	Base.prototype.updateAngle = function() {
	};

	// get entity angle to target
	Base.prototype.getAngle = function() {
		return Utils.angleBetween(this.vector, this.target);
	};

	Base.prototype.updateRadius = function() {
		var strengthDiff = this.config.strength.max - this.config.strength.min,
			strengthPerc = this.options.strength / strengthDiff,
			radiusDiff = this.config.radius.max - this.config.radius.min;

		this.options.radius = this.config.radius.min + (radiusDiff * strengthPerc);
	};

	Base.prototype.easeOutCubic = function(currentIteration, startValue, changeInValue, totalIterations) {
		return changeInValue * (Math.pow(currentIteration / totalIterations - 1, 3) + 1) + startValue;
	};

	return Base;
});
