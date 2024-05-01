const { chars } = new SplitType('#title-text', { types: 'words, chars' })
const play = () => {
	document.querySelector('#logo').classList.remove('hidden');

	const tl = gsap.timeline();
	tl.fromTo("#circle", { scale: 0 }, { scale: 1, duration: 1, ease: "power3.out", });
	tl.fromTo("#square", { opacity: 0, scale: 0.7 }, { opacity: 1, scale: 1, duration: 2, ease: "power3.out", });
	tl.to("#circle", { borderWidth: 0 }, '<');
	tl.to("#square", { width: '90%', delay: 1.5 });
	tl.to("#square", { maskSize: '100%', webkitMaskSize: '100%' }, '<');

	tl.fromTo(chars, { y: '100%', opacity: 0 }, { y: 0, stagger: 0.05, opacity: 1, ease: "elastic.out(1,0.3)", duration: 1.5, delay: 0.5, onComplete: function() {
		document.getElementById('audio').play();
	}}, '<')

	tl.fromTo('#payoff', { y: '100%' }, { y: '0', duration: 1.5, ease: "power3.out"} );
};

document.body.addEventListener('click', () => {
	play();
});
