const tl = gsap.timeline();

const smokes = Array.from(document.querySelectorAll('.js-smoke'));
const shoreline = document.querySelector('.js-shoreline');

const run = () => {
	tl.fromTo(smokes, { y: '65%' },  { duration: 3, ease: 'power1.inOut', stagger: 0.5, attr:{ y: '7%' } });
	tl.fromTo(shoreline, { y: '0' }, { duration: 4, ease: 'power1.inOut', attr:{ y: '100' } }, '-=3');
};

document.body.addEventListener('click', () => {
	tl.restart(true, false);
});

run();

