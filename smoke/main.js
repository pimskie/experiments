const tl = gsap.timeline();

const smokes = Array.from(document.querySelectorAll('.js-smoke'));
const shoreline = document.querySelector('.js-shoreline');
let delay = 0;

const shuffle = arr => arr.sort((a, b) => 0.5 - Math.random());

const run = () => {
	console.log('run')
	shuffle(smokes);

	tl.fromTo(smokes, { y: '65%' },  { duration: 3, ease: 'power1.inOut', stagger: 0.5, attr:{ y: '7%' } });
	tl.fromTo(shoreline, { y: '0' }, { duration: 3, delay, ease: 'power1.inOut', attr:{ y: '100' } }, '-=2');

};

document.body.addEventListener('click', () => {
	tl.restart(true, false);
});
run();

