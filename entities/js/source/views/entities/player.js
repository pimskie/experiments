define([
	'underscore',
	'views/entities/base'
],

function(_, Base) {
	function Player(id, options, vector, target) {
		Base.apply(this, arguments);

		this.defaults = _.extend(this.defaults, {
			viewColor: 'rgba(0, 200, 0, 0.5)'
		});
	}

	Player.prototype = Object.create(Base.prototype);
	Player.prototype.constructor = Player;

	// override methods
	Player.prototype.init = function() {
		var canvas = document.querySelector('canvas.stage');
		canvas.addEventListener('mousemove', _.bind(this.onMouseMove, this));
	};

	Player.prototype.onMouseMove = function(e) {
		var mousePos = {
			x: e.layerX,
			y: e.layerY
		};

		// parent method
		this.setTarget(mousePos);
	};

	// override & empty
	Player.prototype.setWandering = function() {};

	Player.prototype.checkSurroundings = function() {
		// body...
	};

	// And now return the constructor function
	return Player;
});
