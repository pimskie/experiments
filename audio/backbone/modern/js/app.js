import { SoundComponent } from "./components/SoundComponent.js";
import { MasterComponent } from "./components/MasterComponent.js";
import { ControlsComponent } from "./components/ControlsComponent.js";

/**
 * Main application class
 */
export class App {
	constructor() {
		this.soundCtx = null;
		this.soundSource = null;
		this.audioElement = null;
		this.defaultOptions = {};

		this.init();
	}

	init() {
		console.log("App init");
		this.initAudio();
		this.createSource();
		this.run();
	}

	initAudio() {
		// Create audio context
		if (typeof AudioContext !== "undefined") {
			this.soundCtx = new AudioContext();
		} else if (typeof webkitAudioContext !== "undefined") {
			this.soundCtx = new webkitAudioContext();
		} else {
			throw new Error("Audio Context not supported.");
		}

		// Create audio element
		this.audioElement = new Audio();
		this.audioElement.loop = true;
		this.audioElement.controls = false;
		this.audioElement.src = "sound/ring_of_fire.mp3";

		// Add to DOM (hidden)
		const audioContainer = document.querySelector("#audio-container");
		audioContainer.appendChild(this.audioElement);
	}

	createSource() {
		this.soundSource = this.soundCtx.createMediaElementSource(
			this.audioElement
		);
	}

	run() {
		this.defaultOptions = {
			soundSource: this.soundSource,
			soundCtx: this.soundCtx,
			audioElement: this.audioElement,
		};

		// Create controls component
		const controls = new ControlsComponent(this.defaultOptions);
		controls.render();
		document.querySelector("#container").appendChild(controls.getElement());

		// Create master component
		const master = new MasterComponent(this.defaultOptions);
		master.render();
		document.querySelector("#container").appendChild(master.getElement());

		// Create sound component
		const sound = new SoundComponent(this.defaultOptions);
		sound.render();
		document.querySelector("#container").appendChild(sound.getElement());

		// Start audio playback
		this.audioElement.play().catch((e) => {
			console.log("Audio play failed:", e);
			// Handle autoplay policy - user interaction required
			document.addEventListener(
				"click",
				() => {
					this.audioElement.play();
				},
				{ once: true }
			);
		});
	}
}

