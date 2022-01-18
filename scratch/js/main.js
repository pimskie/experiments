import Disc from './modules/disc.js';
import Sampler from './modules/sampler.js';
import Controls from './modules/controls.js';

const disc = new Disc(document.querySelector('#disc'));
const sampler = new Sampler();
const controls = new Controls({
	toggleButton: document.querySelector('#playToggle'),
});


const start = async () => {
	await sampler.loadTrack('./audio/samples.mp3');;

	controls.isDisabled = false;

	controls.onIsplayingChanged = (isPlaying) => {
		if (isPlaying) {
			sampler.play();
		} else {
			sampler.pause();
		}
	};

	// sampler.play();
};


start();
