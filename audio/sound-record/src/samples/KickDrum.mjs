class KickDrum {
  /**
   * Create a new KickDrum instance
   * @param {AudioContext} [context] - Optional AudioContext to use
   */
  constructor(context = null) {
    this.context =
      context || new (window.AudioContext || window.webkitAudioContext)();

    // Pre-create and connect the master output chain for lower latency
    this.masterCompressor = this.#createCompressor(this.context.currentTime);
    this.masterGain = this.context.createGain();
    this.masterGain.connect(this.context.destination);
    this.masterCompressor.connect(this.masterGain);

    // Analyzer for visualization
    this.analyzer = this.context.createAnalyser();
    this.analyzer.fftSize = 2048;
    this.masterGain.connect(this.analyzer);

    // Pre-compute some buffers for lower latency
    this._noiseBuffer = this.#createNoiseBuffer(0.1);
    this._distortionCurve = this.#createDistortionCurve(20);
  }

  /**
   * Create a distortion curve for warmth and saturation
   * @param {number} amount - Amount of distortion (1-100)
   * @returns {Float32Array} - The generated curve
   * @private
   */
  #createDistortionCurve(amount = 20) {
    const samples = 44100;
    const curve = new Float32Array(samples);
    const deg = Math.PI / 180;
    const k = amount * 0.5;

    for (let i = 0; i < samples; i++) {
      const x = (i * 2) / samples - 1;
      // Soft clipping algorithm
      curve[i] = ((3 + k) * x * 20 * deg) / (Math.PI + k * Math.abs(x));
    }

    return curve;
  }

  /**
   * Play the kick drum with the specified parameters
   * @param {Object} options - Playback options
   * @param {number} [options.time=context.currentTime] - When to play the sound (in seconds)
   * @param {number} [options.attack=0] - Attack time in milliseconds
   * @param {number} [options.decay=500] - Decay time in milliseconds
   * @param {number} [options.frequency=60] - Base frequency in Hz
   * @param {number} [options.punch=0.7] - Punch amount (0.0 to 1.0)
   * @param {number} [options.clickLevel=0.2] - Amount of click sound (0.0 to 1.0)
   * @param {number} [options.subLevel=0.5] - Amount of sub bass (0.0 to 1.0)
   * @returns {KickDrum} - Returns this for method chaining
   */
  play({
    time = null,
    attack = 0,
    decay = 500,
    frequency = 60,
    punch = 0.7,
    clickLevel = 0.2,
    subLevel = 0.5,
  } = {}) {
    // Add a small lookahead to ensure precise scheduling
    const lookahead = 0.005; // 5ms lookahead

    // Use provided time or current time with lookahead
    const startTime =
      (time !== null ? time : this.context.currentTime) + lookahead;

    // Convert milliseconds to seconds
    const attackTime = attack / 1000;
    const decayTime = decay / 1000;

    // === Create the main audio routing graph ===
    const kickOutput = this.context.createGain();
    kickOutput.connect(this.masterCompressor);

    // === Create the kick components ===
    // For zero attack, we need to ensure immediate start
    if (attack === 0) {
      this.#createImmediateKick(
        kickOutput,
        startTime,
        frequency,
        decayTime,
        punch,
        clickLevel,
        subLevel
      );
    } else {
      this.#createMainBody(
        kickOutput,
        startTime,
        frequency,
        attackTime,
        decayTime,
        punch
      );
      this.#createClickAttack(kickOutput, startTime, frequency, clickLevel);
      this.#createSubBass(
        kickOutput,
        startTime,
        frequency,
        decayTime,
        subLevel
      );
    }

    // === Add warmth and saturation ===
    this.#addWarmth(kickOutput, startTime, 0.3);

    return this;
  }

  /**
   * Create an immediate kick with no attack delay
   * @param {AudioNode} output - The output node to connect to
   * @param {number} startTime - When to start the sound
   * @param {number} frequency - Base frequency in Hz
   * @param {number} decayTime - Decay time in seconds
   * @param {number} punchAmount - Amount of punch (0.0 to 1.0)
   * @param {number} clickLevel - Amount of click sound (0.0 to 1.0)
   * @param {number} subLevel - Amount of sub bass (0.0 to 1.0)
   * @private
   */
  #createImmediateKick(
    output,
    startTime,
    frequency,
    decayTime,
    punchAmount,
    clickLevel,
    subLevel
  ) {
    // === Main Body Oscillator ===
    const osc = this.context.createOscillator();
    osc.type = "sine";

    // Start with higher frequency and immediately begin the pitch sweep
    const startFreq = frequency * 2;
    osc.frequency.setValueAtTime(startFreq, startTime);

    // Fast exponential decay from initial pitch to target frequency
    osc.frequency.exponentialRampToValueAtTime(
      frequency,
      startTime + decayTime * 0.3
    );

    // Create gain node with immediate full volume
    const gainNode = this.context.createGain();
    gainNode.gain.setValueAtTime(1.0 + punchAmount, startTime);

    // Quick punch decay
    gainNode.gain.exponentialRampToValueAtTime(0.7, startTime + 0.01);

    // Main decay
    gainNode.gain.exponentialRampToValueAtTime(0.001, startTime + decayTime);

    // Connect oscillator
    osc.connect(gainNode);
    gainNode.connect(output);

    // Start and stop
    osc.start(startTime);
    osc.stop(startTime + decayTime + 0.05);

    // === Click Component (if enabled) ===
    if (clickLevel > 0) {
      // Create noise for the click with zero attack
      const noise = this.context.createBufferSource();
      noise.buffer = this._noiseBuffer;

      // Create bandpass filter to shape the click
      const clickFilter = this.context.createBiquadFilter();
      clickFilter.type = "bandpass";
      clickFilter.frequency.value = frequency * 10; // Higher frequency for immediate impact
      clickFilter.Q.value = 1.2;

      // Create gain node for click level with immediate full volume
      const clickGain = this.context.createGain();
      clickGain.gain.setValueAtTime(clickLevel * 0.7, startTime);
      clickGain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.03);

      // Connect nodes
      noise.connect(clickFilter);
      clickFilter.connect(clickGain);
      clickGain.connect(output);

      // Start and stop the noise
      noise.start(startTime);
      noise.stop(startTime + 0.05);

      // Also add a short sine sweep for the beater sound
      const clickOsc = this.context.createOscillator();
      clickOsc.type = "triangle";
      clickOsc.frequency.setValueAtTime(frequency * 8, startTime);
      clickOsc.frequency.exponentialRampToValueAtTime(
        frequency * 2,
        startTime + 0.01
      );

      const clickOscGain = this.context.createGain();
      clickOscGain.gain.setValueAtTime(clickLevel * 0.8, startTime);
      clickOscGain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.02);

      clickOsc.connect(clickOscGain);
      clickOscGain.connect(output);

      clickOsc.start(startTime);
      clickOsc.stop(startTime + 0.03);
    }

    // === Sub Bass Component (if enabled) ===
    if (subLevel > 0) {
      // Create sub oscillator (one octave below main frequency)
      const subOsc = this.context.createOscillator();
      subOsc.type = "sine";
      subOsc.frequency.setValueAtTime(frequency * 0.5, startTime);

      // Create gain node for sub level with immediate volume
      const subGain = this.context.createGain();
      subGain.gain.setValueAtTime(subLevel * 0.8, startTime);
      subGain.gain.exponentialRampToValueAtTime(
        0.001,
        startTime + decayTime * 1.2
      );

      // Connect nodes
      subOsc.connect(subGain);
      subGain.connect(output);

      // Start and stop
      subOsc.start(startTime);
      subOsc.stop(startTime + decayTime * 1.3);
    }
  }

  /**
   * Create the main compressor for the kick sound
   * @param {number} startTime - When to start the effect
   * @returns {DynamicsCompressorNode} - The compressor node
   * @private
   */
  #createCompressor(startTime) {
    const compressor = this.context.createDynamicsCompressor();
    compressor.threshold.setValueAtTime(-24, startTime);
    compressor.knee.setValueAtTime(4, startTime);
    compressor.ratio.setValueAtTime(12, startTime);
    compressor.attack.setValueAtTime(0.001, startTime); // Faster attack
    compressor.release.setValueAtTime(0.25, startTime);
    return compressor;
  }

  /**
   * Create the main body of the kick drum
   * @param {AudioNode} output - The output node to connect to
   * @param {number} startTime - When to start the sound
   * @param {number} frequency - Base frequency in Hz
   * @param {number} attackTime - Attack time in seconds
   * @param {number} decayTime - Decay time in seconds
   * @param {number} punchAmount - Amount of punch (0.0 to 1.0)
   * @private
   */
  #createMainBody(
    output,
    startTime,
    frequency,
    attackTime,
    decayTime,
    punchAmount
  ) {
    // Create the main oscillator
    const osc = this.context.createOscillator();
    osc.type = "sine";

    // Create envelope for frequency sweep
    const startFreq = frequency * 2;
    osc.frequency.setValueAtTime(startFreq, startTime);

    // Frequency pitch curve (the heart of a good kick sound)
    if (attackTime > 0) {
      osc.frequency.linearRampToValueAtTime(
        startFreq,
        startTime + attackTime * 0.1
      );
    }

    // Exponential decay from initial pitch to target frequency
    osc.frequency.exponentialRampToValueAtTime(
      frequency,
      startTime + attackTime + decayTime * 0.5
    );

    // Create gain node for amplitude envelope
    const gainNode = this.context.createGain();

    // Amplitude envelope with optional attack
    if (attackTime > 0) {
      gainNode.gain.setValueAtTime(0.001, startTime);
      gainNode.gain.linearRampToValueAtTime(1.0, startTime + attackTime);
    } else {
      gainNode.gain.setValueAtTime(1.0, startTime);
    }

    // Add punch (slight initial boost that quickly decays)
    if (punchAmount > 0) {
      gainNode.gain.linearRampToValueAtTime(
        1.0 + punchAmount,
        startTime + attackTime + 0.008
      );
    }

    // Main decay
    gainNode.gain.exponentialRampToValueAtTime(
      0.001,
      startTime + attackTime + decayTime
    );

    // Connect nodes
    osc.connect(gainNode);
    gainNode.connect(output);

    // Start and stop
    osc.start(startTime);
    osc.stop(startTime + attackTime + decayTime + 0.1);
  }

  /**
   * Create the click/attack transient for the kick
   * @param {AudioNode} output - The output node to connect to
   * @param {number} startTime - When to start the sound
   * @param {number} frequency - Base frequency in Hz
   * @param {number} clickLevel - Amount of click sound (0.0 to 1.0)
   * @private
   */
  #createClickAttack(output, startTime, frequency, clickLevel) {
    if (clickLevel <= 0) return;

    // Create noise for the click
    const noise = this.context.createBufferSource();
    noise.buffer = this._noiseBuffer;

    // Create bandpass filter to shape the click
    const clickFilter = this.context.createBiquadFilter();
    clickFilter.type = "bandpass";
    clickFilter.frequency.value = frequency * 8;
    clickFilter.Q.value = 1.0;

    // Create gain node for click level
    const clickGain = this.context.createGain();
    clickGain.gain.setValueAtTime(clickLevel * 0.5, startTime);
    clickGain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.05);

    // Connect nodes
    noise.connect(clickFilter);
    clickFilter.connect(clickGain);
    clickGain.connect(output);

    // Start and stop the noise
    noise.start(startTime);
    noise.stop(startTime + 0.1);

    // Also add a short sine sweep for the beater sound
    const clickOsc = this.context.createOscillator();
    clickOsc.type = "triangle";
    clickOsc.frequency.setValueAtTime(frequency * 6, startTime);
    clickOsc.frequency.exponentialRampToValueAtTime(
      frequency * 2,
      startTime + 0.02
    );

    const clickOscGain = this.context.createGain();
    clickOscGain.gain.setValueAtTime(clickLevel * 0.7, startTime);
    clickOscGain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.03);

    clickOsc.connect(clickOscGain);
    clickOscGain.connect(output);

    clickOsc.start(startTime);
    clickOsc.stop(startTime + 0.05);
  }

  /**
   * Create sub bass layer for added depth
   * @param {AudioNode} output - The output node to connect to
   * @param {number} startTime - When to start the sound
   * @param {number} frequency - Base frequency in Hz
   * @param {number} decayTime - Decay time in seconds
   * @param {number} subLevel - Amount of sub bass (0.0 to 1.0)
   * @private
   */
  #createSubBass(output, startTime, frequency, decayTime, subLevel) {
    if (subLevel <= 0) return;

    // Create sub oscillator (one octave below main frequency)
    const subOsc = this.context.createOscillator();
    subOsc.type = "sine";
    subOsc.frequency.setValueAtTime(frequency * 0.5, startTime);

    // Create gain node for sub level
    const subGain = this.context.createGain();
    subGain.gain.setValueAtTime(0.001, startTime);
    subGain.gain.linearRampToValueAtTime(subLevel * 0.8, startTime + 0.01);
    subGain.gain.exponentialRampToValueAtTime(
      0.001,
      startTime + decayTime * 1.2
    );

    // Connect nodes
    subOsc.connect(subGain);
    subGain.connect(output);

    // Start and stop
    subOsc.start(startTime);
    subOsc.stop(startTime + decayTime * 1.5);
  }

  /**
   * Create a noise buffer for the click component
   * @param {number} duration - Duration of the noise buffer in seconds
   * @returns {AudioBuffer} - The generated noise buffer
   * @private
   */
  #createNoiseBuffer(duration = 0.1) {
    const bufferSize = this.context.sampleRate * duration;
    const buffer = this.context.createBuffer(
      1,
      bufferSize,
      this.context.sampleRate
    );
    const output = buffer.getChannelData(0);

    // Generate white noise
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }

    return buffer;
  }

  /**
   * Add warmth and saturation
   * @param {AudioNode} input - The input node to process
   * @param {number} startTime - When to start the effect
   * @param {number} amount - Amount of warmth (0.0 to 1.0)
   * @private
   */
  #addWarmth(input, startTime, amount) {
    if (amount <= 0) return;

    const distortion = this.context.createWaveShaper();
    distortion.curve = this._distortionCurve;
    distortion.oversample = "4x";

    const warmthGain = this.context.createGain();
    warmthGain.gain.value = amount;

    input.connect(distortion);
    distortion.connect(warmthGain);
    warmthGain.connect(this.context.destination);
  }

  /**
   * Get the analyzer node for visualization
   * @returns {AnalyserNode} - The analyzer node
   */
  getAnalyzer() {
    return this.analyzer;
  }

  /**
   * Get the current audio context
   * @returns {AudioContext} - The audio context
   */
  getContext() {
    return this.context;
  }
}

export default KickDrum;
