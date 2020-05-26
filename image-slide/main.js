const qs = sel => document.querySelector(sel);

const IMG_ROOT = 'https://pimskie.dev/public/assets/imageslider';
const images = ['img-1.jpg', 'img-2.jpg', 'img-3.jpg'];

const container = qs('.js-container');
let front;
let back;

const bodyStyles = window.getComputedStyle(document.body);
const numPanes = parseInt(bodyStyles.getPropertyValue('--num-panes'), 10);

const transitionDuration = bodyStyles.getPropertyValue('--animation-duration');
const transitionDurationMS = parseFloat(transitionDuration.replace('ms', ''));

const animationDelay = bodyStyles.getPropertyValue('--animation-delay');
const animationDelayMS = parseFloat(animationDelay.replace('ms', ''));

const totalDelay = animationDelayMS * numPanes;
const animationTime = transitionDurationMS + totalDelay;

let timeoutId = null;

const build = () => {
	front = document.createElement('div');

	front.classList.add('slides');
	front.innerHTML = new Array(numPanes).fill().map((_, i) => {
		return `
		<div class="slide slide--${i + 1}">
			<div class="slide__image"></div>
		</div>
		`;
	}).join('');

	back = front.cloneNode(true);

	front.classList.add('is-front');
	back.classList.add('is-back');

	updateImages(`${IMG_ROOT}/${images[0]}`, `${IMG_ROOT}/${images[1]}`);

	container.appendChild(front);
	container.appendChild(back);

};

const updateImages = (img1, img2) => {
	front.style.setProperty('--image-url', `url(${img1})`);
	back.style.setProperty('--image-url', `url(${img2})`);
}

const switchImages = () => {
	disable();

	container.classList.add('is-switching');

	clearTimeout(timeoutId);

	timeoutId = setTimeout(() => {
		images.push(images.shift());

		updateImages(`${IMG_ROOT}/${images[0]}`, `${IMG_ROOT}/${images[1]}`);

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

build();
enable();
