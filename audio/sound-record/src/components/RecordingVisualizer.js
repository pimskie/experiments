/**
 * RecordingVisualizer component
 */
import { createElement } from "../utils/dom.js";
import recordingService from "../services/RecordingService.js";
import InstrumentRegistry from "../instruments/InstrumentRegistry.js";

class RecordingVisualizer {
	constructor() {
		this.element = null;
		this.timelineElement = null;
		this.beatMarkers = new Map();

		// Bind event handlers
		this.handleBeatRecorded = this.handleBeatRecorded.bind(this);
		this.handleBeatPlayed = this.handleBeatPlayed.bind(this);
		this.handleRecordingStarted = this.handleRecordingStarted.bind(this);
		this.handleRecordingStopped = this.handleRecordingStopped.bind(this);
	}

	/**
	 * Initialize event listeners
	 */
	initEventListeners() {
		recordingService.on("beatRecorded", this.handleBeatRecorded);
		recordingService.on("beatPlayed", this.handleBeatPlayed);
		recordingService.on("recordingStarted", this.handleRecordingStarted);
		recordingService.on("recordingStopped", this.handleRecordingStopped);
	}

	/**
	 * Remove event listeners
	 */
	removeEventListeners() {
		recordingService.off("beatRecorded", this.handleBeatRecorded);
		recordingService.off("beatPlayed", this.handleBeatPlayed);
		recordingService.off("recordingStarted", this.handleRecordingStarted);
		recordingService.off("recordingStopped", this.handleRecordingStopped);
	}

	/**
	 * Handle beat recorded event
	 * @param {Object} beat - Beat object
	 */
	handleBeatRecorded(beat) {
		this.updateVisualization();
	}

	/**
	 * Handle beat played event
	 * @param {Object} beat - Beat object
	 */
	handleBeatPlayed(beat) {
		this.highlightBeat(beat);
	}

	/**
	 * Handle recording started event
	 */
	handleRecordingStarted() {
		this.clearVisualization();
		this.showVisualizer();
	}

	/**
	 * Handle recording stopped event
	 */
	handleRecordingStopped() {
		this.updateVisualization();
	}

	/**
	 * Update the visualization
	 */
	updateVisualization() {
		// Clear current visualization
		if (this.timelineElement) {
			this.timelineElement.innerHTML = "";
		}

		const recordedBeats = recordingService.getRecordedBeats();

		// If no beats, nothing to do
		if (recordedBeats.length === 0) return;

		// Calculate duration
		const duration = recordedBeats[recordedBeats.length - 1].time + 0.5;

		// Create or clear beat markers map
		this.beatMarkers = new Map();

		// Add beats to timeline
		recordedBeats.forEach((beat, index) => {
			const beatMarker = createElement("div", {
				className: `beat-marker ${beat.type}`,
				id: `beat-${index}`,
				style: {
					left: `${(beat.time / duration) * 100}%`,
				},
			});

			this.timelineElement.appendChild(beatMarker);
			this.beatMarkers.set(beat, beatMarker);
		});
	}

	/**
	 * Highlight a beat during playback
	 * @param {Object} beat - Beat object
	 */
	highlightBeat(beat) {
		const marker = this.beatMarkers.get(beat);

		if (marker) {
			// Flash effect
			marker.style.transform = "scaleY(1.2)";
			marker.style.opacity = "1";

			setTimeout(() => {
				marker.style.transform = "scaleY(1)";
				marker.style.opacity = "0.8";
			}, 100);
		}
	}

	/**
	 * Clear the visualization
	 */
	clearVisualization() {
		if (this.timelineElement) {
			this.timelineElement.innerHTML = "";
		}
		this.beatMarkers = new Map();
	}

	/**
	 * Show the visualizer
	 */
	showVisualizer() {
		if (this.element) {
			this.element.style.display = "block";
		}
	}

	/**
	 * Hide the visualizer
	 */
	hideVisualizer() {
		if (this.element) {
			this.element.style.display = "none";
		}
	}

	/**
	 * Render the visualizer
	 * @param {HTMLElement} container - Container element
	 * @returns {HTMLElement} - The created element
	 */
	render(container) {
		this.element = createElement("div", {
			className: "recording-visualizer",
			id: "recordingVisualizer",
		});

		this.timelineElement = createElement("div", {
			className: "timeline",
		});

		this.element.appendChild(this.timelineElement);
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

export default RecordingVisualizer;
