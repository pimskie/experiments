import Vector from '//rawgit.com/pimskie/vector/master/vector.js';

import Stage from './stage.js';
import Boid from './boid.js';

const TAU = Math.PI * 2;

const stats = new Stats();
stats.showPanel(0);
document.body.appendChild(stats.dom);

const stage = new Stage(document.querySelector('.js-canvas'), window.innerWidth, window.innerHeight);
const pointer = { position: stage.center.clone() };

let scatter = false;
const numBoids = 400;

const controlSeparation = document.getElementById('separation');
const controlCohesion = document.getElementById('cohesion');
const controlAlignment = document.getElementById('alignment');
const controlPerception = document.getElementById('perception');
const controlPredators = document.getElementById('predators');

const boids = new Array(numBoids).fill().map((_, i) => {
	const position = stage.getRandomPosition();
	const mass = 1;
	const maxVelocity = 1.5;

	const a = Math.random() * TAU;
	const velocity = new Vector();
	velocity.length = maxVelocity;
	velocity.angle = a;

	return new Boid({ position, mass, velocity, maxVelocity });
});

const numPredators = 4;
const predators = new Array(numPredators).fill().map(() => {
	return new Boid({
		position: stage.getRandomPosition(),
		velocity: new Vector(Math.cos(Math.random() * TAU), Math.sin(Math.random() * TAU)),
		mass: 1,
		maxVelocity: 2,
	});
});

const loop = () => {
	stats.begin();
	stage.clear();

	const perception = controlPerception.value;
	const applyPredators = controlPredators.checked;

	boids.forEach((boid, i) => {
		const { separation, alignment, cohesion } = boid.getForces(boids, perception * 0.5, perception, perception);
		const directionalForce = boid.goto(stage.center);

		boid.applyForce(directionalForce.multiplySelf(0.2));
		boid.applyForce(cohesion.multiplySelf(controlCohesion.value));
		boid.applyForce(alignment.multiplySelf(controlAlignment.value));
		boid.applyForce(separation.multiplySelf(controlSeparation.value));

		if (applyPredators) {
			predators.forEach((predator) => {
				boid.applyForce(boid.flee(predator, stage.width * 0.1));
			});
		}

		if (scatter) {
			const predatorForce = boid.flee(pointer, stage.width * 0.1);

			boid.applyForce(predatorForce);

		}

		const hue = 180 + (Math.cos((boid.position.x + boid.position.y) * 0.001) * 180);
		boid.update(hue, stage);
		boid.draw(stage.context);
	});

	if (applyPredators) {
		predators.forEach((predator) => {
			const nearest = predator.getNearest(boids);
			predator.applyForce(predator.goto(nearest.position).multiplySelf(5));
			predator.update(0, stage);
			predator.draw(stage.context, 3);
		});
	}

	stats.end();

	requestAnimationFrame(loop);
};

loop();

window.addEventListener('resize', () => {
	stage.setSize(window.innerWidth, window.innerHeight);
});

document.body.addEventListener('pointermove', (e) => {
	pointer.position.x = e.clientX;
	pointer.position.y = e.clientY;
});

document.body.addEventListener('pointerdown', () => {
	scatter = true;
});

document.body.addEventListener('pointerup', () => {
	scatter = false;
});
