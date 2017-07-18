define([
	'Utils'
],

function(Utils) {

	function Stage(canvasElement) {
		this.canvasElement = canvasElement;
		this.context = this.canvasElement.getContext('2d');

		this.setSize();
	}

	// sets the size of the canvas and returns it dimensions in an object
	Stage.prototype.setSize = function() {
		this.size = {
			width: 500,
			height: 500
		};
		this.canvasElement.setAttribute('width', this.size.width);
		this.canvasElement.setAttribute('height', this.size.height);

		return this.size;
	};

	// returns size of the canvas
	Stage.prototype.getSize = function() {
		return this.size;
	};

	// returns the context2D of the canvas
	Stage.prototype.getContext = function() {
		return this.context;
	};


	Stage.prototype.clear = function() {
		this.context.save();

		// Use the identity matrix while clearing the canvas
		this.context.setTransform(1, 0, 0, 1, 0, 0);
		this.context.clearRect(0, 0, this.size.width, this.size.height);

		// Restore the transform
		this.context.restore();
	};

	Stage.prototype.draw = function(entity) {
		var vec = entity.vector,
			options = entity.options,
			target = entity.target,
			angleToTarget = entity.getAngle();

		// translate the context to the x,y position of the entity
		// after translate, draw entity at 0,0
		this.context.save();
		this.context.translate(vec.x, vec.y);

		// rotate canvas to the direction of the target
		this.context.rotate(angleToTarget);

		// draw entity and its sight
		this.drawEntity(options);
		this.drawSight(options);

		// restore the canvas to the normal matrix
		this.context.restore();

		// draw the target
		this.drawTarget(target);
	};

	Stage.prototype.drawEntity = function(options) {
		this.context.beginPath();
		this.context.arc(0, 0, options.radius, 0, Utils.TWO_PI, false);
		this.context.lineWidth = 1;
		this.context.strokeStyle = '#808080';
		this.context.fillStyle = options.color;
		this.context.fill();
		this.context.stroke();
		this.context.closePath();
	};

	Stage.prototype.drawSight = function(options) {
		this.context.beginPath();
		this.context.moveTo(0, 0);
		this.context.arc(0, 0, options.viewDistance, -options.viewAngle, options.viewAngle);
		this.context.lineTo(0, 0);
		this.context.fillStyle = options.viewColor;
		this.context.fill();
		this.context.closePath();
	};

	Stage.prototype.drawTarget = function(target) {
		this.context.beginPath();
		this.context.arc(target.x, target.y, 10, 0, Utils.TWO_PI, false);
		this.context.fillStyle = '#17a338';
		this.context.fill();
		this.context.closePath();
	};

	// And now return the constructor function
	return Stage;
});
