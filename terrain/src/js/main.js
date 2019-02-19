console.log('terrain jow');

import { angleBetween } from './vendor/utils';
import Generator, { SIZE as mapSize } from './components/generator.mjs';
import World from './components/world.mjs';

const generator = new Generator(document.querySelector('[data-ref=generator]'));
const world = new World(document.querySelector('[data-ref=world]'), mapSize);

let isFlying = false;

const fly = () => {
	const cameraDirection = world.cameraDirection;
	const theta = Math.atan2(cameraDirection.x, cameraDirection.z * -1) + (Math.PI / 2);

	const noiseAngle = theta;

	const noiseValues = generator.update(isFlying, noiseAngle);

	world.generate(noiseValues);
	world.render();

	world.render();

	requestAnimationFrame(() => fly());
};

const onKeyDown = (e) => {
	if (e.code === 'Space') {
		isFlying = true;
	}
};

const onKeyUp = (e) => {
	if (e.code === 'Space') {
		isFlying = false;
	}
};

document.addEventListener('keydown', onKeyDown);
document.addEventListener('keyup', onKeyUp);

fly();

