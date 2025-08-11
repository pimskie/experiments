const recordButton = document.querySelector("#record");
const playButton = document.querySelector("#play");

const sourceUrl = "./mic-check.mp3";

playButton.addEventListener("click", () => {
	const audioContext = new AudioContext();

	const destination = audioContext.destination;

	const lowpassFilter = new BiquadFilterNode(audioContext);
	lowpassFilter.type = "lowpass";
	lowpassFilter.frequency.setValueAtTime(700, audioContext.currentTime);

	const highpassFilter = new BiquadFilterNode(audioContext);
	highpassFilter.type = "highpass";
	highpassFilter.frequency.setValueAtTime(1700, audioContext.currentTime);

	const lfo = new OscillatorNode(audioContext, {
		// type: "square",
		frequency: 30,
	});

	const mainVolume = audioContext.createGain();
	mainVolume.gain.setValueAtTime(1, audioContext.currentTime);

	// lowpassFilter.connect(mainVolume);
	// highpassFilter.connect(mainVolume);
	// lfo.connect(mainVolume);

	// lfo.connect(highpassFilter.frequency);
	highpassFilter.connect(mainVolume);
	mainVolume.connect(destination);

	const audioElement = document.createElement("audio");
	audioElement.src = sourceUrl;
	audioElement.crossOrigin = "anonymous";

	const source = audioContext.createMediaElementSource(audioElement);
	source.connect(highpassFilter);

	lfo.start();
	audioElement.play();
});

