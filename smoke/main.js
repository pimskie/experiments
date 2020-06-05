const tl = gsap.timeline();

const smokes = Array.from(document.querySelectorAll('.js-smoke'));

smokes.forEach((smoke) => {
	const duration = 3 + (Math.random() * 7);
	const delay = 0;
	console.log(duration);

	gsap.to(smoke, { duration, delay, ease: 'power1.inOut', attr:{y: '0%' } });
});

// gsap.fromTo(smokes[0], 2, { y:0 }, {y:-1000});

