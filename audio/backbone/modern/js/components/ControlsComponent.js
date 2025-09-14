import {
	createElement,
	addEvent,
	getRandomPosition,
	setStyle,
} from "../utils/dom.js";
import { DelayComponent } from "./DelayComponent.js";
import { BassComponent } from "./BassComponent.js";

/**
 * Controls component for adding new effect components
 */
export class ControlsComponent {
	constructor(options = {}) {
		this.options = options;
		this.element = null;
		this.numComponents = 0;
		this.init();
	}

	init() {
		this.createElement();
		this.setupEventListeners();
	}

	createElement() {
		this.element = createElement("div", "component controls");
	}

	setupEventListeners() {
		addEvent(this.element, "click", (e) => {
			if (e.target.id === "add_delay") {
				this.addDelay();
			} else if (e.target.id === "add_bass") {
				this.addBass();
			}
		});
	}

	render() {
		const template = `
            <h3>Add Effects</h3>
            <div id="add_delay" class="add-button">Delay</div>
            <div id="add_bass" class="add-button">Bass</div>
        `;

		this.element.innerHTML = template;
		return this;
	}

	addDelay() {
		const options = { ...this.options };
		const delay = new DelayComponent(options);
		this.addComponent(delay);
	}

	addBass() {
		const options = { ...this.options };
		const bass = new BassComponent(options);
		this.addComponent(bass);
	}

	addComponent(component) {
		const el = component.render().getElement();
		const container = document.querySelector("#container");
		container.appendChild(el);

		// Position randomly
		const position = getRandomPosition(el);
		setStyle(el, {
			left: position.left + "px",
			top: position.top + "px",
		});

		this.numComponents += 1;
	}

	getElement() {
		return this.element;
	}
}

