import { BaseComponent } from "./BaseComponent.js";
import { createElement, addEvent } from "../utils/dom.js";

/**
 * Bass filter component with high-pass and low-pass filters
 */
export class BassComponent extends BaseComponent {
	constructor(options = {}) {
		super(options);
		this.className = "component bass";
	}

	init() {
		super.init();
		this.setupAudioControls();
	}

	setupAudioControls() {
		// Create high-pass filter
		const highpassFilter = this.options.soundCtx.createBiquadFilter();
		highpassFilter.type = "highpass";
		highpassFilter.frequency.value = 90;

		// Create low-pass filter
		const lowpassFilter = this.options.soundCtx.createBiquadFilter();
		lowpassFilter.type = "lowpass";
		lowpassFilter.frequency.value = 40000;

		// Connect filters in series
		highpassFilter.connect(lowpassFilter);

		this.controls = {
			input: highpassFilter,
			output: lowpassFilter,
		};
	}

	render() {
		this.element.className = this.className;

		const template = `
            <div class="input"></div>
            <div class="drag"></div>
            <div class="close">×</div>
            <h3>Bass</h3>
            <input type="range" min="440" max="20000" step="1" value="90" class="highPass" />
            <input type="range" min="440" max="20000" step="1" value="20000" class="lowPass" />
            <div class="output"></div>
        `;

		this.element.innerHTML = template;

		// Add event listeners for controls
		const highPassSlider = this.element.querySelector(".highPass");
		const lowPassSlider = this.element.querySelector(".lowPass");

		addEvent(highPassSlider, "input", (e) => {
			this.updateHighpass(e);
		});

		addEvent(lowPassSlider, "input", (e) => {
			this.updateLowpass(e);
		});

		return this;
	}

	updateHighpass(e) {
		const val = parseFloat(e.target.value);
		this.controls.input.frequency.value = val;
	}

	updateLowpass(e) {
		const val = parseFloat(e.target.value);
		this.controls.output.frequency.value = val;
	}
}

