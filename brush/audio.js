const audioCtx = new AudioContext();
const { destination, sampleRate } = audioCtx;
const bufferSize = sampleRate * 1;

const volume = audioCtx.createGain();
volume.gain.value = 0.8;

volume.connect(destination);

const bandpass = audioCtx.createBiquadFilter();
const bandHz = 2500;

bandpass.type = 'bandpass';
bandpass.frequency.value = bandHz;

let noise;

const connectAndPlay = (source) => {
	volume.gain.value = 0;

	source.loop = true;

	source
		.connect(bandpass)
		.connect(volume);

	source.start();

	volume.gain.linearRampToValueAtTime(0.1, audioCtx.currentTime + 0.25);
};

const playWhiteNoise = () => {
	const buffer = audioCtx.createBuffer(1, bufferSize, sampleRate);
	const data = buffer.getChannelData(0);

	for (let i = 0; i < bufferSize; i++) {
		data[i] = Math.random() * 2 - 1;
	}

	noise = audioCtx.createBufferSource();
	noise.buffer = buffer;

	connectAndPlay(noise);
}

const playPinkNoise = () => {
	var b0, b1, b2, b3, b4, b5, b6;
	b0 = b1 = b2 = b3 = b4 = b5 = b6 = 0.0;

	const buffer = audioCtx.createBuffer(1, bufferSize, sampleRate);
	const data = buffer.getChannelData(0);

	for (var i = 0; i < bufferSize; i++) {
		const white = Math.random() * 2 - 1;

		b0 = 0.99886 * b0 + white * 0.0555179;
		b1 = 0.99332 * b1 + white * 0.0750759;
		b2 = 0.96900 * b2 + white * 0.1538520;
		b3 = 0.86650 * b3 + white * 0.3104856;
		b4 = 0.55000 * b4 + white * 0.5329522;
		b5 = -0.7616 * b5 - white * 0.0168980;

		data[i] = b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362;
		data[i] *= 0.11; // (roughly) compensate for gain

		b6 = white * 0.115926;
	}

	noise = audioCtx.createBufferSource();
	noise.buffer = buffer;

	connectAndPlay(noise);
};

const stopNoise = () => {
	volume.gain.linearRampToValueAtTime(0, audioCtx.currentTime + 0.1);

	noise.stop();
};

const button = document.querySelector('button');
let isPlaying = false;

button.addEventListener('click', () => {
	isPlaying = !isPlaying;

	if (isPlaying) {
		playPinkNoise();
	} else {
		stopNoise();
	}
});
