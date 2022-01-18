class Sampler {
	constructor() {
		this.audioContext = new AudioContext();
		this.audioBuffer = null;
		this.audioBufferReversed = null;
		this.audioSource = null;

		this.timeStarted = 0;
		this.timePausedAt = 0;
		this.duration = 0;
	}

	async getArrayBufferFromUrl(audioUrl) {
		const response = await fetch(audioUrl);
		const buffer = await response.arrayBuffer();

		return buffer;
	}

	async getAudioBuffer(audioUrl) {
		const arrayBuffer = await this.getArrayBufferFromUrl(audioUrl);
		const audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);

		return audioBuffer;
	}

	async loadTrack(audioUrl) {
		this.audioBuffer = await this.getAudioBuffer(audioUrl);
		this.audioBufferReversed = this.getReversedAudioBuffer(this.audioBuffer);

		this.duration = this.audioBuffer.duration;
	}

	getReversedAudioBuffer(audioBuffer) {
		const bufferArray = audioBuffer
			.getChannelData(0)
			.slice()
			.reverse();

		const audioBufferReversed = this.audioContext.createBuffer(1, audioBuffer.length, audioBuffer.sampleRate);

		audioBufferReversed.getChannelData(0).set(bufferArray);

		return audioBufferReversed;
	}

	play() {
		this.audioSource = this.audioContext.createBufferSource();
		this.audioSource.buffer = this.audioBuffer;
		this.audioSource.loop = true;

		this.audioSource.connect(this.audioContext.destination);

		if (this.timePausedAt) {
			this.timeStarted = Date.now() - this.timePausedAt;
			this.audioSource.start(0, this.timePausedAt / 1000);
		}
		else {
			this.timeStarted = Date.now();
			this.audioSource.start(0);
		}
	}

	pause() {
		this.timePausedAt = Date.now() - this.timeStarted;

		this.audioSource.stop();
	}
}

export default Sampler;
