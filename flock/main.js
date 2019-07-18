import Vector from '//rawgit.com/pimskie/vector/master/vector.js';

import Stage from './stage.js';
import Boid from './boid.js';
import Grid from './grid.js';

const TAU = Math.PI * 2;

const stats = new Stats();
stats.showPanel(0);
document.body.appendChild(stats.dom);


const stage = new Stage(document.querySelector('.js-canvas'), window.innerWidth, window.innerHeight);
const grid = new Grid({ width: stage.width, height: stage.height, space: 50 });
const predator = stage.center.clone();

const perception = 100;
let scatter = false;

const numBoids = 400;
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

	boids.forEach((b) => {
		const regionCells = grid.getRegionCells(b.position);
		const [cellIndex] = regionCells;

		b.cellIndex = cellIndex;
		b.regionCells = regionCells;
	});

	boids.forEach((boid, i) => {
		const { separation, alignment, cohesion } = boid.getForces(boids, 50, perception, perception);
		const directionalForce = boid.goto(stage.center);

		boid.applyForce(directionalForce.multiplySelf(0.25));
		boid.applyForce(cohesion);
		boid.applyForce(alignment);
		boid.applyForce(separation.multiplySelf(2));

		if (scatter) {
			const predatorForce = boid.flee(predator, stage.width * 0.1);
			boid.applyForce(predatorForce);

		}

		const hue = (boid.cellIndex / (grid.cols * grid.rows)) * 360;

		boid.update(hue, stage);
		boid.draw(stage.context);
	});

	stats.end();

	requestAnimationFrame(loop);
};

loop();

window.addEventListener('resize', () => {
	stage.setSize(window.innerWidth, window.innerHeight);
	grid.setSize(stage.width, stage.height);
});

document.body.addEventListener('pointermove', (e) => {
	predator.x = e.clientX;
	predator.y = e.clientY;
});

document.body.addEventListener('pointerdown', () => {
	scatter = true;
});

document.body.addEventListener('pointerup', () => {
	scatter = false;
});
