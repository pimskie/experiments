import timeConfigs from '../configs/times';

// the max duration of a tape in MS
const SAMPLE_DURATION = timeConfigs.sampleTime;

class SampleCreator { // eslint-disable-line no-unused-vars
	/**
	 * Create possibly mutiple tapes from 1 buffer
	 *
	 * @param {AudioContext} ctx An AudioContext instance
	 * @param {AudioBuffer} buffer The audioBuffer to create sources from
	 * @see https://developer.mozilla.org/en-US/docs/Web/API/AudioBuffer
	 */
	constructor(ctx, buffer) {
		this.ctx = ctx;
		this.buffer = buffer;

		this.bufferReversed = this.ctx.createBuffer(1, this.buffer.length, this.buffer.sampleRate);
		this.bufferReversed.getChannelData(0).set(this.buffer.getChannelData(0).slice().reverse());

		this.durationTotal = buffer.duration;

		this.source = null;
		this.duration = 0;
		this.offset = 0;
	}

	/**
	 * Create a tape
	 *
	 * @param {int} startTime the start time of the tape in MS
	 * @param {bool} reversed if the tape should play in reverse
	 * @return {AudioBufferSourceNode} tape the source to play
	 */
	create(startTime = 0, reversed = false, sampleDuration = SAMPLE_DURATION) {
		if (startTime > this.durationTotal || startTime < 0) {
			throw new Error(`getTape: startTime can't be higher than duration or lower than 0 (${startTime}, ${this.durationTotal})`);
		}

		let totalDuration = this.buffer.duration;
		let sampleRate = this.ctx.sampleRate;

		let startTimeSec = startTime;
		let durationSec = sampleDuration;

		// +- 2MS faster than `Math.min`
		if (startTimeSec + durationSec > totalDuration) {
			durationSec = totalDuration - startTimeSec;
		}

		let duration = durationSec * sampleRate;
		let sourceBuffer;
		let offset;

		if (reversed) {
			offset = this.durationTotal - startTimeSec;
			sourceBuffer = this.bufferReversed;
		} else {
			offset = startTimeSec;
			sourceBuffer = this.buffer;
		}

		offset *= sampleRate;

		let length = offset + duration - 1;
		let tapeBuffer = this.ctx.createBuffer(1, duration, this.ctx.sampleRate);
		let bufferArray = sourceBuffer.getChannelData(0).slice(offset, length);

		tapeBuffer.getChannelData(0).set(bufferArray);

		this.source = this.createSource(tapeBuffer);
		this.duration = duration / this.ctx.sampleRate;

		this.offset = startTime;

		return this.source;
	}

	/**
	 * Create a `AudioBufferSourceNode` from the provided buffer
	 *
	 * @param {AudioBuffer} buffer the buffer to create to source node with
	 * @return {AudioBufferSourceNode} the created sourceNode
	 */
	createSource(buffer) {
		let source = this.ctx.createBufferSource();

		source.buffer = buffer;
		source.loop = false;

		return source;
	}
}

export default SampleCreator;
