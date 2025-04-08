/**
 * DrumPad component
 */
import { createElement } from "../utils/dom.js";
import InstrumentRegistry from "../instruments/InstrumentRegistry.js";
import useAudioContext from "../hooks/useAudioContext.js";
import recordingService from "../services/RecordingService.js";

class DrumPad {
	/**
	 * Create a new DrumPad
	 * @param {string} type - Instrument type
	 * @param {Function} onPlay - Callback when pad is played
	 */
	constructor(type, onPlay) {
		this.type = type;
		this.onPlay = onPlay;
		this.element = null;
		this.context = useAudioContext();
		this.instrument = InstrumentRegistry.getInstrument(this.type, this.context);
	}

	/**
	 * Play the instrument
	 */
	play() {
		this.instrument.play({});

		// Add visual feedback
		this.element.classList.add("active");
		setTimeout(() => {
			this.element.classList.remove("active");
		}, 100);

		// Call callback
		if (this.onPlay) {
			this.onPlay(this.type);
		}

		// Record if in recording mode
		recordingService.recordBeat(this.type);
	}

	/**
	 * Scheduled play at specific time
	 * @param {number} time - Time to play
	 */
	playAt(time) {
		this.instrument.play({ time });
	}

	/**
	 * Render the drum pad
	 * @param {HTMLElement} container - Container element
	 * @returns {HTMLElement} - The created element
	 */
	render(container) {
		const name = InstrumentRegistry.getInstrumentName(this.type);

		this.element = createElement(
			"button",
			{
				className: `drum-pad ${this.type}`,
				id: `play-${this.type}`,
				onClick: () => this.play(),
			},
			name
		);

		// Add mousedown/mouseup effects
		this.element.addEventListener("mousedown", () => {
			this.element.style.transform = "scale(0.95)";
		});

		this.element.addEventListener("mouseup", () => {
			this.element.style.transform = "scale(1)";
		});

		container.appendChild(this.element);
		return this.element;
	}
}

export default DrumPad;
