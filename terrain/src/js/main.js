console.log('terrain jow');

import Generator from './components/generator.mjs';
import World from './components/world.mjs';

const generator = new Generator(document.querySelector('[data-ref=generator]'));
const world = new World(document.querySelector('[data-ref=world]'));

let isFlying = false;

const fly = () => {
	const noiseValues = generator.update(isFlying);

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

