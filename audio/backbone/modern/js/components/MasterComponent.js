import { BaseComponent } from "./BaseComponent.js";
import { createElement, addEvent } from "../utils/dom.js";

/**
 * Master output component with volume control
 */
export class MasterComponent extends BaseComponent {
	constructor(options = {}) {
		super(options);
		this.className = "component master";
		this.volume = null;
	}

	init() {
		super.init();
		this.setupAudioControls();
	}

	setupAudioControls() {
		// Create gain node for volume control
		this.volume = this.options.soundCtx.createGain();
		this.volume.gain.value = 1;
		this.volume.connect(this.options.soundCtx.destination);

		this.controls = {
			input: this.volume,
			output: this.volume,
		};
	}

	render() {
		this.element.className = this.className;

		const template = `
            <div class="drag"></div>
            <div class="input"></div>
            <h3>Speaker</h3>
            <div class="column">
                <input type="range" value="100" min="0" max="100" id="volume" />
                <label class="bottom">Volume</label>
            </div>
        `;

		this.element.innerHTML = template;

		// Add volume control event listener
		const volumeSlider = this.element.querySelector("#volume");
		addEvent(volumeSlider, "input", (e) => {
			this.setVolume(e);
		});

		return this;
	}

	setVolume(e) {
		e.preventDefault();
		this.volume.gain.value = e.target.value / 100;
	}
}

