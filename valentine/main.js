const container = document.querySelector('.js-container');
const img = document.querySelector('.js-img-heart');

let hearts = [];

let width;
let height;

let rafId = null;

const setSize = () => { 
	width = window.innerWidth;
	height = window.innerHeight;
}

const boom = () => {
	const x = width >> 1;
	const y = height >> 1;

	const hypo = Math.sqrt(x * x + y * y);

	for (let i = 0; i < 50; i++) {
		const element = document.createElement('div');
		element.classList.add('heart');
		document.body.appendChild(element);

		const angle = Math.random() * (Math.PI * 2);

		const heartAnim = new TimelineLite();
		heartAnim.to(element, Math.random() * 2, {
			scale: 0,
			x: Math.cos(angle) * hypo,
			y: Math.sin(angle) * hypo,
			rotationX: Math.random() * 360,	
			rotationY: Math.random() * 360,	
			transformOrigin: '50% 50%',
			onComplete: () => { 
				document.body.removeChild(element);
			}
		})
	}
}


window.addEventListener('resize', setSize);
setSize();

img.addEventListener('click', () => { 
	container.classList.add('is-animating');

	var animation = new TimelineLite();
	animation
		.to(container, 0.4, {scale: 0.5, ease: Linear.easeNone })
		.to(container, 0.1, {
			scale: 1.4, ease: Linear.easeNone, onComplete: boom });
	
	TweenLite.to(container, 0.5, {
		scale: 0.8
	});
});