 // rotate3d(1, 1, 1, 70deg) translate3d(10px, 10px, 160px)
const container = document.querySelector('.js-container');

 const party = (e) => {
	const { pageX: mouseX, pageY: mouseY } = e;
	const flake = document.createElement('div');
	const hue = 360 * Math.random();
	const rotation = 360 * Math.random();

	flake.style.setProperty('--hue', hue);
	flake.style.setProperty('--rotation', rotation);

	flake.classList.add('flake');

	container.appendChild(flake);

	const animationFrames = () => [
		{ '--rotation': rotation },
		{ '--rotation': ( 360 * Math.random()) * 3 },
	  ];

	  const animationTiming = {
		duration: 2000,
		iterations: 1,
		 easing: 'ease-out',
	};

	  flake
		.animate(animationFrames(), animationTiming)
		.finished.then((e) => flake.remove());
};


 document.body.addEventListener('click', party);
