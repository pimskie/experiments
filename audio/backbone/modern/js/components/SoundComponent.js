import { BaseComponent } from "./BaseComponent.js";
import { createElement } from "../utils/dom.js";

/**
 * Sound source component - represents the audio input
 */
export class SoundComponent extends BaseComponent {
	constructor(options = {}) {
		super(options);
		this.className = "component sound";
	}

	init() {
		super.init();
		this.setupAudioControls();
	}

	setupAudioControls() {
		// Sound source is the input/output
		this.controls = {
			input: this.options.soundSource,
			output: this.options.soundSource,
		};
	}

	render() {
		this.element.className = this.className;

		const template = `
            <h3>Sound</h3>
            <div class="output"></div>
        `;

		this.element.innerHTML = template;
		return this;
	}
}

