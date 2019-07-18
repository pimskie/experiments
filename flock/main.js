import Vector from '//rawgit.com/pimskie/vector/master/vector.js';

import Stage from './stage.js';
import Boid from './boid.js';
import Grid from './grid.js';

const TAU = Math.PI * 2;

const stats = new Stats();
stats.showPanel(0);
document.body.appendChild(stats.dom);


let time = 0;
const timeUpdate = 0.01;

const stage = new Stage(document.querySelector('.js-canvas'), 750, 750);
const grid = new Grid({ width: stage.width, height: stage.height, cols: 20, rows: 20 });

const predator = stage.center.clone();

const numBoids = 700;
const boids = new Array(numBoids).fill().map((_, i) => {
	const position = stage.getRandomPosition();
	const mass = 1;

	const a = Math.random() * TAU;
	const l = 1;
	const velocity = new Vector();

	velocity.length = l;
	velocity.angle = a;

	return new Boid({ position, mass, velocity });
});

const loop = () => {
	stats.begin();

	stage.clear();
	// grid.draw(stage.context);

	const perception = grid.spacingX * 0.5;

	boids.forEach(b => b.cellIndex = grid.getCellIndex(b.position));

	boids.forEach((boid, i) => {
		const { separation, alignment, cohesion } = boid.getForces(boids, perception, perception, perception);
		const predatorForce = boid.flee(predator);
		const directionalForce = boid.goto(stage.center);

		boid.applyForce(directionalForce);
		boid.applyForce(separation);
		boid.applyForce(alignment);
		boid.applyForce(cohesion);
		boid.applyForce(predatorForce);

		boid.update(stage);

		const hue = (boid.cellIndex / (grid.cols * grid.rows)) * 360;

		boid.draw(stage.context, hue);
	});

	time += timeUpdate;

	stats.end();

	requestAnimationFrame(loop);
};

loop();

window.addEventListener('resize', () => {
	stage.setSize(window.innerWidth, window.innerHeight);
});

document.body.addEventListener('pointermove', (e) => {
	predator.x = e.clientX;
	predator.y = e.clientY;
});
