let images = ['img-1.jpg', 'img-2.jpg', 'img-3.jpg'];

const qs = sel => document.querySelector(sel);

const container = qs('.js-container');
const slidesA = qs('.js-slides-a');
const slidesB = qs('.js-slides-b');

const bodyStyles = window.getComputedStyle(document.body);
const transitionDuration = bodyStyles.getPropertyValue('--animation-duration');
const transitionDurationMS = parseFloat(transitionDuration.replace('ms', ''));

const animationDelay = bodyStyles.getPropertyValue('--animation-delay');
const animationDelayMS = parseFloat(animationDelay.replace('ms', ''));

const totalDelay = animationDelayMS * slidesA.children.length;
const animationTime = transitionDurationMS + totalDelay;

let timeoutId = null;

const switchImages = () => {
	disable();

	container.classList.add('is-switching');

	clearTimeout(timeoutId);

	timeoutId = setTimeout(() => {
		images.push(images.shift());

		slidesA.style.setProperty('--image-url', `url(/img/${images[0]})`);
		slidesB.style.setProperty('--image-url', `url(/img/${images[1]})`);

		container.classList.remove('is-switching');

		enable();

	}, animationTime);
};


const enable = () => {
	container.addEventListener('click', switchImages);
};

const disable = () => {
	container.removeEventListener('click', switchImages);
};

enable();
