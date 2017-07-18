define([
	'underscore',
	'Utils',
	'views/entities/entity',
	'views/entities/player',
],
function(_, Utils, Entity, Player) {

	function EntityManager() {
		this.size = null;
		this.entities = [];
	}

	EntityManager.prototype.add = function(options) {
	};

	// creates an entity and add it to the list
	EntityManager.prototype.create = function(num, options) {

		var id,
			vector,
			target,
			ops,
			entity;

		while(num--) {
			vector = {
				x: Utils.randomBetween(0, this.size.width, true),
				y: Utils.randomBetween(0, this.size.height, true),
				speed: Utils.randomBetween(0.1, 1)
			};
			target = this.getEntityTarget(vector);

			ops = {
				age: Utils.randomBetween(0, 5, true),
				strength: Utils.randomBetween(0, 5, true),
				state: 'wandering'
			};

			id = Utils.randomNumber();

			// create and add to list
			entity = new Entity(id, ops, vector, target);
			this.entities.push(entity);
		}

		// create player
		id = Utils.randomNumber();
		vector = {
				x: Utils.randomBetween(0, this.size.width, true),
				y: Utils.randomBetween(0, this.size.height, true),
				speed: 2 //Utils.randomBetween(0.4, 2)
			};
		target = this.getEntityTarget(vector);
		ops = {
			age: Utils.randomBetween(0, 5, true),
			strength: Utils.randomBetween(0, 5, true),
			state: 'wandering',
		};

		var player = new Player(id, ops, vector, target);
		player.isPlayer = true;

		this.entities.push(player);
	};

	// get specific entity
	EntityManager.prototype.get = function(id) {
		return _.findWhere(this.getAll(), {id: id});
	};

	// return all entities
	EntityManager.prototype.getAll = function() {
		return this.entities;
	};


	// update single entity
	EntityManager.prototype.update = function(entity) {
		// update internal properties of entity
		entity.update();

		// if entity is idle, set its new target
		switch(entity.options.state) {
			case 'idle':
				var newTarget = this.getEntityTarget(entity.vector);
				entity.setWandering(newTarget);
				break;
		}


		var player = _.findWhere(this.entities, {isPlayer: true}),
			inView = this.getInSight(player);

		inView.forEach(function(e) {
			e.options.color = 'green';
		});
	};

	// get all entities who are in view of 'from' entity
	EntityManager.prototype.getInSight = function(from) {
		var entitiesInView = [];

		this.entities.forEach(_.bind(function(entity) {
			if (this.isInSight(from, entity) && from !== entity) {
				entitiesInView.push(entity);
			}
		}, this));

		return entitiesInView;
	};

	// check if 'to' is in sight of 'from'
	EntityManager.prototype.isInSight = function(from, to) {
		if (from === to) {
			return;
		}

		var distance = Utils.distanceBetween(from.vector, to.vector),
			angle = Utils.angleBetween(from.vector, to.vector),
			inView = (distance <= from.options.viewDistance) && (Math.abs(from.vector.angle - angle) <= from.options.viewAngle);

		if (inView) {
			return to;
		}
	};

	// get a new target
	EntityManager.prototype.getEntityTarget = function(vector) {
		var a = Utils.randomBetween(0, 360, true) * Utils.TO_RADIAN,
			r = Utils.randomBetween(20, 50, true),
			t = {
				x: Utils.bound(vector.x + (Math.cos(a) * r), 0, this.size.width),
				y: Utils.bound(vector.x + (Math.sin(a) * r), 0, this.size.height)
			};

		return t;
	};

	// sets the internal stage size
	// size is an object with width and height
	EntityManager.prototype.setSize = function(size) {
		this.size = size;
	};

	// And now return the constructor function
	return EntityManager;
});
