import { BaseComponent } from "./BaseComponent.js";
import { createElement, addEvent } from "../utils/dom.js";

/**
 * Delay effect component
 */
export class DelayComponent extends BaseComponent {
	constructor(options = {}) {
		super(options);
		this.className = "component delay";
	}

	init() {
		super.init();
		this.setupAudioControls();
	}

	setupAudioControls() {
		// Create delay node
		const delay = this.options.soundCtx.createDelay();
		delay.delayTime.value = 0;

		// Create volume node for delay output
		const volume = this.options.soundCtx.createGain();
		volume.gain.value = 1;
		delay.connect(volume);

		this.controls = {
			input: delay,
			output: volume,
		};
	}

	render() {
		this.element.className = this.className;

		const template = `
            <div class="input"></div>
            <div class="drag"></div>
            <div class="close">×</div>
            <h3>Delay</h3>
            <input type="range" min="0" max="200" step="1" value="0" class="delayTime" />
            <input type="range" min="0" max="100" step="1" value="100" class="delayVolume" />
            <div class="output"></div>
        `;

		this.element.innerHTML = template;

		// Add event listeners for controls
		const delayTimeSlider = this.element.querySelector(".delayTime");
		const delayVolumeSlider = this.element.querySelector(".delayVolume");

		addEvent(delayTimeSlider, "input", (e) => {
			this.updateDelay(e);
		});

		addEvent(delayVolumeSlider, "input", (e) => {
			this.updateVolume(e);
		});

		return this;
	}

	updateDelay(e) {
		const val = e.target.value / 100;
		this.controls.input.delayTime.value = val;
	}

	updateVolume(e) {
		const val = e.target.value / 100;
		this.controls.output.gain.value = val;
	}
}

