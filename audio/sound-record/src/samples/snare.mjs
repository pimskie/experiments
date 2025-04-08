/**
 * SnareDrum - A realistic snare drum synthesizer using the Web Audio API
 * ES6 module implementation with modern JavaScript patterns
 */
class SnareDrum {
	/**
	 * Create a new SnareDrum instance
	 * @param {AudioContext} [context] - Optional AudioContext to use
	 */
	constructor(context = null) {
		this.context =
			context || new (window.AudioContext || window.webkitAudioContext)();
	}

	/**
	 * Create a pink noise buffer for realistic snare wire sound
	 * @param {number} duration - Duration of the noise buffer in seconds
	 * @returns {AudioBuffer} - The generated noise buffer
	 * @private
	 */
	#createNoiseBuffer(duration = 2) {
		const bufferSize = this.context.sampleRate * duration;
		const buffer = this.context.createBuffer(
			1,
			bufferSize,
			this.context.sampleRate
		);
		const output = buffer.getChannelData(0);

		// Pink noise coefficients
		let b0 = 0,
			b1 = 0,
			b2 = 0,
			b3 = 0,
			b4 = 0,
			b5 = 0,
			b6 = 0;

		// Generate pink noise (more natural sounding than white noise)
		for (let i = 0; i < bufferSize; i++) {
			const white = Math.random() * 2 - 1;

			// Pink noise filter implementation
			b0 = 0.99886 * b0 + white * 0.0555179;
			b1 = 0.99332 * b1 + white * 0.0750759;
			b2 = 0.969 * b2 + white * 0.153852;
			b3 = 0.8665 * b3 + white * 0.3104856;
			b4 = 0.55 * b4 + white * 0.5329522;
			b5 = -0.7616 * b5 - white * 0.016898;

			output[i] = b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362;
			output[i] *= 0.11; // Normalize to roughly unit volume

			b6 = white * 0.115926;
		}

		return buffer;
	}

	/**
	 * Create a distortion curve for subtle warmth
	 * @param {number} amount - Amount of distortion (1-50)
	 * @returns {Float32Array} - The generated curve
	 * @private
	 */
	#createDistortionCurve(amount = 5) {
		const samples = 44100;
		const curve = new Float32Array(samples);
		const deg = Math.PI / 180;
		const k = amount || 5;

		for (let i = 0; i < samples; i++) {
			const x = (i * 2) / samples - 1;
			// Tube-like distortion algorithm
			curve[i] = ((3 + k) * x * 20 * deg) / (Math.PI + k * Math.abs(x));
		}

		return curve;
	}

	/**
	 * Create a simple room impulse response for reverb
	 * @param {number} duration - Duration of the impulse in seconds
	 * @returns {AudioBuffer} - The generated impulse response
	 * @private
	 */
	#createRoomImpulse(duration = 1.5) {
		const length = this.context.sampleRate * duration;
		const impulse = this.context.createBuffer(
			2,
			length,
			this.context.sampleRate
		);
		const leftChannel = impulse.getChannelData(0);
		const rightChannel = impulse.getChannelData(1);

		// Generate stereo room impulse response with exponential decay
		for (let i = 0; i < length; i++) {
			const decay = Math.exp(-i / (this.context.sampleRate * 0.3));
			leftChannel[i] = (Math.random() * 2 - 1) * decay * 0.05;
			rightChannel[i] = (Math.random() * 2 - 1) * decay * 0.05;
		}

		return impulse;
	}

	/**
	 * Play the snare drum with the specified parameters
	 * @param {Object} options - Playback options
	 * @param {number} [options.time=context.currentTime] - When to play the sound (in seconds)
	 * @param {number} [options.volume=1.0] - Volume level (0.0 to 1.0)
	 * @param {number} [options.tone=1.0] - Tone character (0.0 to 1.0)
	 * @param {number} [options.snappy=0.8] - Snappiness/wire sound (0.0 to 1.0)
	 * @param {number} [options.roomLevel=0.3] - Amount of room sound (0.0 to 1.0)
	 * @returns {SnareDrum} - Returns this for method chaining
	 */
	play({
		time = null,
		volume = 1.0,
		tone = 1.0,
		snappy = 0.8,
		roomLevel = 0.3,
	} = {}) {
		// Use provided time or current time
		const startTime = time !== null ? time : this.context.currentTime;

		// === Create the main audio routing graph ===
		const mainCompressor = this.#createCompressor(startTime);
		const mainOutput = this.context.createGain();
		mainOutput.gain.value = volume;
		mainOutput.connect(mainCompressor);

		// === Create the drum components ===
		this.#createDrumBody(mainOutput, startTime, tone);
		this.#createSnareWires(mainOutput, startTime, snappy);
		this.#createAttackTransient(mainOutput, startTime);

		// === Add effects ===
		this.#addRoomEffect(mainCompressor, startTime, roomLevel);
		this.#addWarmth(mainCompressor, startTime);

		return this;
	}

	/**
	 * Create the main compressor for the snare sound
	 * @param {number} startTime - When to start the effect
	 * @returns {DynamicsCompressorNode} - The compressor node
	 * @private
	 */
	#createCompressor(startTime) {
		const compressor = this.context.createDynamicsCompressor();
		compressor.threshold.setValueAtTime(-24, startTime);
		compressor.knee.setValueAtTime(4, startTime);
		compressor.ratio.setValueAtTime(12, startTime);
		compressor.attack.setValueAtTime(0.002, startTime);
		compressor.release.setValueAtTime(0.25, startTime);
		compressor.connect(this.context.destination);
		return compressor;
	}

	/**
	 * Create the drum body resonance (low and mid frequencies)
	 * @param {AudioNode} output - The output node to connect to
	 * @param {number} startTime - When to start the sound
	 * @param {number} toneAmount - Tone character (0.0 to 1.0)
	 * @private
	 */
	#createDrumBody(output, startTime, toneAmount) {
		// Scale the frequencies based on tone parameter
		const baseFreq = 150 + toneAmount * 50;

		// === Create the main drum body (low frequencies) ===
		const bodyGain = this.context.createGain();
		bodyGain.gain.setValueAtTime(0.7, startTime);
		bodyGain.gain.exponentialRampToValueAtTime(0.01, startTime + 0.15);
		bodyGain.connect(output);

		// Create multiple oscillators for richer harmonics
		const oscFreqs = [baseFreq, baseFreq * 1.2, baseFreq * 1.47];
		const oscTypes = ["sine", "triangle", "sawtooth"];
		const oscGains = [1.0, 0.5, 0.2];

		oscFreqs.forEach((freq, i) => {
			const osc = this.context.createOscillator();
			osc.type = oscTypes[i];
			osc.frequency.setValueAtTime(freq, startTime);
			osc.frequency.exponentialRampToValueAtTime(freq * 0.5, startTime + 0.08);

			const oscGain = this.context.createGain();
			oscGain.gain.value = oscGains[i];

			osc.connect(oscGain);
			oscGain.connect(bodyGain);

			osc.start(startTime);
			osc.stop(startTime + 0.3);
		});

		// === Create the drum shell resonance (mid frequencies) ===
		const shellOsc = this.context.createOscillator();
		shellOsc.type = "triangle";
		shellOsc.frequency.setValueAtTime(baseFreq * 2.2, startTime);
		shellOsc.frequency.exponentialRampToValueAtTime(
			baseFreq * 1.2,
			startTime + 0.05
		);

		const shellGain = this.context.createGain();
		shellGain.gain.setValueAtTime(0.3, startTime);
		shellGain.gain.exponentialRampToValueAtTime(0.01, startTime + 0.1);

		shellOsc.connect(shellGain);
		shellGain.connect(output);

		shellOsc.start(startTime);
		shellOsc.stop(startTime + 0.2);
	}

	/**
	 * Create the snare wire rattling sound (high frequencies)
	 * @param {AudioNode} output - The output node to connect to
	 * @param {number} startTime - When to start the sound
	 * @param {number} snappiness - Amount of snare wire sound (0.0 to 1.0)
	 * @private
	 */
	#createSnareWires(output, startTime, snappiness) {
		// Create noise source
		const noiseBuffer = this.#createNoiseBuffer(2);
		const noiseSource = this.context.createBufferSource();
		noiseSource.buffer = noiseBuffer;

		// Create multi-stage filter chain for realistic snare wire sound
		const filterChain = this.#createSnareFilterChain(snappiness);

		// Create envelope
		const noiseEnvelope = this.context.createGain();
		noiseEnvelope.gain.setValueAtTime(snappiness, startTime);
		noiseEnvelope.gain.exponentialRampToValueAtTime(0.01, startTime + 0.2);

		// Connect everything
		noiseSource.connect(filterChain.input);
		filterChain.output.connect(noiseEnvelope);
		noiseEnvelope.connect(output);

		noiseSource.start(startTime);
		noiseSource.stop(startTime + 0.3);
	}

	/**
	 * Create the filter chain for the snare wires
	 * @param {number} snappiness - Amount of snare wire sound (0.0 to 1.0)
	 * @returns {Object} - Object with input and output nodes
	 * @private
	 */
	#createSnareFilterChain(snappiness) {
		// Multi-stage filter for more realistic snare wire sound
		const lowpass = this.context.createBiquadFilter();
		lowpass.type = "lowpass";
		lowpass.frequency.value = 8000;
		lowpass.Q.value = 0.8;

		const highpass = this.context.createBiquadFilter();
		highpass.type = "highpass";
		highpass.frequency.value = 2000;
		highpass.Q.value = 0.75;

		// Peaking EQ to emphasize snare wire frequencies
		const peakEQ = this.context.createBiquadFilter();
		peakEQ.type = "peaking";
		peakEQ.frequency.value = 4500;
		peakEQ.Q.value = 2.5;
		peakEQ.gain.value = 15 * snappiness;

		// Connect the filter chain
		lowpass.connect(highpass);
		highpass.connect(peakEQ);

		return {
			input: lowpass,
			output: peakEQ,
		};
	}

	/**
	 * Create the initial attack transient
	 * @param {AudioNode} output - The output node to connect to
	 * @param {number} startTime - When to start the sound
	 * @private
	 */
	#createAttackTransient(output, startTime) {
		const attackOsc = this.context.createOscillator();
		attackOsc.type = "triangle";
		attackOsc.frequency.setValueAtTime(250, startTime);
		attackOsc.frequency.exponentialRampToValueAtTime(80, startTime + 0.02);

		const attackGain = this.context.createGain();
		attackGain.gain.setValueAtTime(0.6, startTime);
		attackGain.gain.exponentialRampToValueAtTime(0.01, startTime + 0.03);

		attackOsc.connect(attackGain);
		attackGain.connect(output);

		attackOsc.start(startTime);
		attackOsc.stop(startTime + 0.05);
	}

	/**
	 * Add room simulation effect for depth
	 * @param {AudioNode} input - The input node to process
	 * @param {number} startTime - When to start the effect
	 * @param {number} roomLevel - Amount of room effect (0.0 to 1.0)
	 * @private
	 */
	#addRoomEffect(input, startTime, roomLevel) {
		if (roomLevel <= 0) return;

		const convolver = this.context.createConvolver();
		convolver.buffer = this.#createRoomImpulse();

		// Create dry/wet mix
		const dryGain = this.context.createGain();
		dryGain.gain.value = 1 - roomLevel;

		const wetGain = this.context.createGain();
		wetGain.gain.value = roomLevel;

		// Connect everything
		input.connect(dryGain);
		dryGain.connect(this.context.destination);

		input.connect(convolver);
		convolver.connect(wetGain);
		wetGain.connect(this.context.destination);
	}

	/**
	 * Add subtle distortion for warmth
	 * @param {AudioNode} input - The input node to process
	 * @param {number} startTime - When to start the effect
	 * @private
	 */
	#addWarmth(input, startTime) {
		const distortion = this.context.createWaveShaper();
		distortion.curve = this.#createDistortionCurve(5);
		distortion.oversample = "4x";

		const distortionGain = this.context.createGain();
		distortionGain.gain.value = 0.2;

		input.connect(distortion);
		distortion.connect(distortionGain);
		distortionGain.connect(this.context.destination);
	}

	/**
	 * Get the current audio context
	 * @returns {AudioContext} - The audio context
	 */
	getContext() {
		return this.context;
	}

	/**
	 * Set a new audio context
	 * @param {AudioContext} newContext - The new audio context to use
	 * @returns {SnareDrum} - Returns this for method chaining
	 */
	setContext(newContext) {
		this.context = newContext;
		return this;
	}
}

// Export as ES module
export default SnareDrum;
