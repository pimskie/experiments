import Controller from './controller';

let controllers = {};

controllers.left = new Controller('.js-controller-left');
window.controllers = controllers;

function onVisibilityChange(e) {
	let isActive = !document.hidden;

	for (let controllerName of Object.keys(controllers)) {
		controllers[controllerName].setIsActive(isActive);
	}
}

document.addEventListener('visibilitychange', onVisibilityChange);


const CTRL = 17;

function onKeyDown(e) {
	if (e.which === CTRL) {
		controllers.left.mute();
	}
}


function onKeyUp(e) {
	if (e.which === CTRL) {
		controllers.left.mute(false);
	}
}

document.addEventListener('keydown', onKeyDown);
document.addEventListener('keyup', onKeyUp);



// SKIN SHIZZLE
let stylesheet = document.getElementById('skin');
let styleSelector = document.querySelector('[name=skin]');

function setSkin(skin) {
	let parts = stylesheet.href.split('/');

	parts[parts.length - 1] = `${skin}.css`;

	stylesheet.href = parts.join('/');

	localStorage.setItem('skin', skin);
}

styleSelector.addEventListener('change', (e) => {
	let skin = e.target.value;

	setSkin(skin);
});

if (localStorage.getItem('skin')) {
	let skin = localStorage.getItem('skin');

	styleSelector.value = skin;
	setSkin(skin);
}
