/**
 * Service for managing recording sessions
 */

/**
 * Simple EventEmitter implementation for browser
 */
class EventEmitter {
	constructor() {
		this.events = {};
	}

	/**
	 * Register an event listener
	 * @param {string} event - Event name
	 * @param {Function} listener - Event handler
	 */
	on(event, listener) {
		if (!this.events[event]) {
			this.events[event] = [];
		}
		this.events[event].push(listener);
		return this;
	}

	/**
	 * Remove an event listener
	 * @param {string} event - Event name
	 * @param {Function} listener - Event handler to remove
	 */
	off(event, listener) {
		if (!this.events[event]) return this;

		const index = this.events[event].indexOf(listener);
		if (index > -1) {
			this.events[event].splice(index, 1);
		}
		return this;
	}

	/**
	 * Emit an event
	 * @param {string} event - Event name
	 * @param {...any} args - Arguments to pass to listeners
	 */
	emit(event, ...args) {
		if (!this.events[event]) return false;

		this.events[event].forEach((listener) => {
			listener.apply(this, args);
		});
		return true;
	}

	/**
	 * Register a one-time event listener
	 * @param {string} event - Event name
	 * @param {Function} listener - Event handler
	 */
	once(event, listener) {
		const onceWrapper = (...args) => {
			listener.apply(this, args);
			this.off(event, onceWrapper);
		};
		return this.on(event, onceWrapper);
	}
}

class RecordingService extends EventEmitter {
	constructor() {
		super();
		this.isRecording = false;
		this.recordingStartTime = 0;
		this.recordedBeats = [];
		this.audioContext = null;
	}

	/**
	 * Set the audio context
	 * @param {AudioContext} context - The audio context
	 */
	setAudioContext(context) {
		this.audioContext = context;
	}

	/**
	 * Start a new recording session
	 */
	startRecording() {
		if (!this.audioContext) {
			throw new Error("Audio context not set");
		}

		// Reset recording data
		this.recordedBeats = [];
		this.recordingStartTime = this.audioContext.currentTime;
		this.isRecording = true;

		// Emit event
		this.emit("recordingStarted");
	}

	/**
	 * Stop the current recording session
	 */
	stopRecording() {
		this.isRecording = false;

		// Sort recorded beats by time
		this.recordedBeats.sort((a, b) => a.time - b.time);

		// Emit event
		this.emit("recordingStopped", this.recordedBeats);

		return this.recordedBeats;
	}

	/**
	 * Toggle recording state
	 * @returns {boolean} - New recording state
	 */
	toggleRecording() {
		if (this.isRecording) {
			this.stopRecording();
		} else {
			this.startRecording();
		}

		return this.isRecording;
	}

	/**
	 * Record a beat
	 * @param {string} type - Instrument type
	 */
	recordBeat(type) {
		if (!this.isRecording) return;

		const currentTime = this.audioContext.currentTime;
		const relativeTime = currentTime - this.recordingStartTime;

		const beat = {
			type,
			time: relativeTime,
		};

		this.recordedBeats.push(beat);

		// Emit event
		this.emit("beatRecorded", beat);

		return beat;
	}

	/**
	 * Play back the recorded sequence
	 * @param {Function} playCallback - Function to call to play a beat
	 * @returns {Promise} - Promise that resolves when playback is complete
	 */
	async playbackRecording(playCallback) {
		if (!this.audioContext) {
			throw new Error("Audio context not set");
		}

		if (this.recordedBeats.length === 0) {
			throw new Error("No beats recorded");
		}

		// Emit event
		this.emit("playbackStarted");

		// Start time for playback
		const startTime = this.audioContext.currentTime;

		// Schedule all beats
		this.recordedBeats.forEach((beat) => {
			// Schedule this beat
			playCallback(beat.type, startTime + beat.time);

			// Emit event for each beat at the appropriate time
			setTimeout(() => {
				this.emit("beatPlayed", beat);
			}, beat.time * 1000);
		});

		// Calculate total duration
		const lastBeatTime = this.recordedBeats[this.recordedBeats.length - 1].time;

		// Wait for playback to complete
		await new Promise((resolve) => {
			setTimeout(() => {
				this.emit("playbackCompleted");
				resolve();
			}, (lastBeatTime + 0.5) * 1000);
		});
	}

	/**
	 * Get all recorded beats
	 * @returns {Array} - Array of beat objects
	 */
	getRecordedBeats() {
		return [...this.recordedBeats];
	}

	/**
	 * Check if recording is in progress
	 * @returns {boolean} - True if recording
	 */
	getIsRecording() {
		return this.isRecording;
	}
}

// Create and export a singleton instance
const recordingService = new RecordingService();
export default recordingService;
