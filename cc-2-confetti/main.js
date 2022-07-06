const container = document.querySelector('.js-container');

const createFlake = () => {
	const flake = document.createElement('div');
	const hue = 360 * Math.random();

	flake.style.setProperty('--hue', hue);

	flake.classList.add('flake');

	container.appendChild(flake);

	const maxDepth = 50;
	const depth = -50 + (100 * Math.random());
	const lightness = (depth / maxDepth) * 50;

	const animationFrames = () => [
		{
			'--rotation': `${360 * Math.random()}`,
			'--positionX': 0,
			'--positionY': 0,
			'--lightness': 50,
		},
		{
			 '--rotation':`${360 * Math.random() * 3}`,
			 '--positionX': -50 + (100 * Math.random()),
			 '--positionY': -50 + (100 * Math.random()),
			 '--positionZ': depth,
			 '--lightness': 50 - lightness, //lightness,
	},
	  ];

	  const animationTiming = {
		duration: 2000,
		iterations: 1,
		 easing: 'cubic-bezier(0,.91,.44,.96)',
	};

	  flake
		.animate(animationFrames(), animationTiming)
		.finished.then((e) => flake.remove());
};

 const party = (e) => {
	// const { pageX: mouseX, pageY: mouseY } = e;

	for (let i = 0; i < 30; i++) {
		createFlake();
	}
};


 document.body.addEventListener('click', party);

 party();
