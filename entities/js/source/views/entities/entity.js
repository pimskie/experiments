define(['views/entities/base'],

function(Base) {

	function Entity(options) {
		Base.apply(this, arguments);
	}

	Entity.prototype = Object.create(Base.prototype);
	Entity.prototype.constructor = Entity;

	// override methods

	// And now return the constructor function
	return Entity;
});
