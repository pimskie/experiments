class SpraySound {
	constructor() {
		this.audioCtx = new AudioContext();
		this.destination = this.audioCtx.destination;

		this.volume = this.audioCtx.createGain();
		this.volume.gain.value = 0.8;

		this.bandpass = this.audioCtx.createBiquadFilter();
		this.bandpass.type = 'bandpass';

		this.bandpass.frequency.value = 2500;

		this.panner = this.audioCtx.createStereoPanner();

		this.volume
			.connect(this.panner)
			.connect(this.destination);
	}

	get time() {
		return this.audioCtx.currentTime;
	}

	play() {
		const { sampleRate } = this.audioCtx;
		const bufferSize = sampleRate * 1;

		let b0, b1, b2, b3, b4, b5, b6;
		b0 = b1 = b2 = b3 = b4 = b5 = b6 = 0.0;

		const buffer = this.audioCtx.createBuffer(1, bufferSize, sampleRate);
		const data = buffer.getChannelData(0);

		for (let i = 0; i < bufferSize; i++) {
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

		this.source = this.audioCtx.createBufferSource();
		this.source.buffer = buffer;

		this.connectAndPlay();
	};

	connectAndPlay() {
		this.source.loop = true;

		this.source
			.connect(this.bandpass)
			.connect(this.volume);

		this.source.start();

		this.volume.gain.setValueAtTime(0, this.time);
		this.volume.gain.linearRampToValueAtTime(0.1, this.time + 0.25);
	}

	stop() {
		this.volume.gain.linearRampToValueAtTime(0, this.time + 0.25);
	}

	pan(amount) {
		this.panner.pan.linearRampToValueAtTime(amount, this.time + 0.25)
	}

	setFrequency(ratio) {
		// ratio 0: small spray, 1: large spray
		// frequency 2500: small spray, 1500: large spray

		const start = 2500;
		const end = 1200;
		const diff = end - start;
		const freq = start + (diff * ratio);

		this.bandpass.frequency.setValueAtTime(freq, this.time);
	}

	toggle(on) {
		if (on) {
			this.volume.connect(this.destination);
		} else {
			this.volume.disconnect();
		}
	}
}

export default new SpraySound();
