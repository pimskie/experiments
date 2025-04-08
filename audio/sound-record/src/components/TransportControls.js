/**
 * TransportControls component
 */
import { createElement } from "../utils/dom.js";
import recordingService from "../services/RecordingService.js";
import useAudioContext from "../hooks/useAudioContext.js";

class TransportControls {
	/**
	 * Create transport controls
	 * @param {Function} onPlayback - Callback to handle playback
	 */
	constructor(onPlayback) {
		this.onPlayback = onPlayback;
		this.element = null;
		this.recordButton = null;
		this.playButton = null;

		// Bind methods
		this.handleRecordingStarted = this.handleRecordingStarted.bind(this);
		this.handleRecordingStopped = this.handleRecordingStopped.bind(this);
		this.handlePlaybackStarted = this.handlePlaybackStarted.bind(this);
		this.handlePlaybackCompleted = this.handlePlaybackCompleted.bind(this);
	}

	/**
	 * Initialize event listeners
	 */
	initEventListeners() {
		recordingService.on("recordingStarted", this.handleRecordingStarted);
		recordingService.on("recordingStopped", this.handleRecordingStopped);
		recordingService.on("playbackStarted", this.handlePlaybackStarted);
		recordingService.on("playbackCompleted", this.handlePlaybackCompleted);
	}

	/**
	 * Remove event listeners
	 */
	removeEventListeners() {
		recordingService.off("recordingStarted", this.handleRecordingStarted);
		recordingService.off("recordingStopped", this.handleRecordingStopped);
		recordingService.off("playbackStarted", this.handlePlaybackStarted);
		recordingService.off("playbackCompleted", this.handlePlaybackCompleted);
	}

	/**
	 * Handle recording started event
	 */
	handleRecordingStarted() {
		if (this.recordButton) {
			this.recordButton.textContent = "Stop Recording";
			this.recordButton.classList.add("recording");
		}

		if (this.playButton) {
			this.playButton.disabled = true;
		}
	}

	/**
	 * Handle recording stopped event
	 */
	handleRecordingStopped() {
		if (this.recordButton) {
			this.recordButton.textContent = "Record";
			this.recordButton.classList.remove("recording");
		}

		if (this.playButton) {
			this.playButton.disabled = false;
		}
	}

	/**
	 * Handle playback started event
	 */
	handlePlaybackStarted() {
		if (this.playButton) {
			this.playButton.disabled = true;
		}

		if (this.recordButton) {
			this.recordButton.disabled = true;
		}
	}

	/**
	 * Handle playback completed event
	 */
	handlePlaybackCompleted() {
		if (this.playButton) {
			this.playButton.disabled = false;
		}

		if (this.recordButton) {
			this.recordButton.disabled = false;
		}
	}

	/**
	 * Toggle recording
	 */
	toggleRecording() {
		recordingService.toggleRecording();
	}

	/**
	 * Start playback
	 */
	startPlayback() {
		try {
			this.onPlayback();
		} catch (error) {
			console.error("Playback error:", error);
			alert(error.message);
		}
	}

	/**
	 * Render the transport controls
	 * @param {HTMLElement} container - Container element
	 * @returns {HTMLElement} - The created element
	 */
	render(container) {
		this.element = createElement("div", {
			className: "transport-controls",
		});

		// Record button
		this.recordButton = createElement("button", {
			className: "transport-button record-button",
			id: "recordButton",
			textContent: "Record",
			onClick: () => this.toggleRecording(),
		});

		// Playback button
		this.playButton = createElement("button", {
			className: "transport-button play-button",
			id: "playbackButton",
			textContent: "Play Recording",
			disabled: true,
			onClick: () => this.startPlayback(),
		});

		this.element.appendChild(this.recordButton);
		this.element.appendChild(this.playButton);

		container.appendChild(this.element);

		// Initialize event listeners
		this.initEventListeners();

		return this.element;
	}

	/**
	 * Clean up resources
	 */
	destroy() {
		this.removeEventListeners();
	}
}

export default TransportControls;
