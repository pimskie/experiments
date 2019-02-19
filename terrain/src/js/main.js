import * as dat from 'dat.gui';
import Generator, { SIZE as mapSize } from './components/generator.mjs';
import World from './components/world.mjs';

const generator = new Generator(document.querySelector('[data-module=generator]'));
const world = new World(document.querySelector('[data-module=world]'), mapSize);

let isFlying = false;

const generatorOptions = {
	speed: 0.05,
	scale: 0.02,
};

const onOptionsChanged = () => {
	generator.setOptions(generatorOptions);
};

const gui = new dat.GUI();
gui.add(generatorOptions, 'speed').min(0.005).max(0.06).step(0.001).onChange(onOptionsChanged);
gui.add(generatorOptions, 'scale').min(0.005).max(0.3).step(0.001).onChange(onOptionsChanged);

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

