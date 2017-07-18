define([
	'underscore',
	'Stats',
	'views/stage',
	'views/entities/entity',
	'managers/entity'
],

function(_, Stats, Stage, Entity, EntityManager) {
	return {
		init: function() {
			// bind scope
			_.bindAll(this, 'run');

			// setup stats
			this.setupStats();

			// setup stage
			var canvasEl = document.querySelector('canvas.stage');
			this.stage = new Stage(canvasEl);

			// setup enemy manager
			this.entityManager = new EntityManager();
			this.entityManager.setSize(this.stage.getSize());

			var entities = this.entityManager.create(5);

			this.run();
		},

		setupStats: function() {
			this.stats = new Stats();
			this.stats.setMode(0); // 0: fps, 1: ms

			// align top-left
			this.stats.domElement.style.position = 'absolute';
			this.stats.domElement.style.right = '0px';
			this.stats.domElement.style.top = '0px';

			document.body.appendChild(this.stats.domElement);
		},

		run: function() {
			this.stats.begin();

			// empty canvas
			this.stage.clear();

			var entities = this.entityManager.getAll();
			entities.forEach(_.bind(function(entity) {
				// update entity properties
				this.entityManager.update(entity);

				// redraw entity
				this.stage.draw(entity);
			}, this));

			this.stats.end();

			// loop
			window.requestAnimationFrame(this.run);
		}
	};
});