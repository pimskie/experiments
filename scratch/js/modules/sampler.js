class Sampler {
	constructor() {
		this.audioContext = new AudioContext();
		this.audioBuffer = null;
		this.audioSource = null;

		this.timeStarted = 0;
		this.timePaused = 0;
		this.timePausedAt = 0;

		this.isPaused = false;
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

		console.log(this.audioBuffer)
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
		this.isPaused = true;

		this.audioSource.stop();
	}
}

export default Sampler;
