import {
	createElement,
	addEvent,
	removeClass,
	addClass,
	hasClass,
} from "../utils/dom.js";

/**
 * Base component class for all audio effect components
 */
export class BaseComponent {
	constructor(options = {}) {
		this.options = options;
		this.element = null;
		this.connectedViewIn = null;
		this.connectedViewOut = null;
		this.controls = {};
		this.id = Math.random().toString(36).substr(2, 9);

		this.init();
	}

	init() {
		this.createElement();
		this.setupEventListeners();
	}

	createElement() {
		this.element = createElement("div", "component");
		this.element.dataset.componentId = this.id;
	}

	setupEventListeners() {
		// Base event listeners for all components
		addEvent(this.element, "click", (e) => {
			if (e.target.classList.contains("input")) {
				this.toggleConnect(e, "input");
			} else if (e.target.classList.contains("output")) {
				this.toggleConnect(e, "output");
			} else if (e.target.classList.contains("close")) {
				this.removeView();
			}
		});
	}

	toggleConnect(e, direction) {
		const target = e.target;

		if (hasClass(target, "connected")) {
			// Disconnect
			this.disconnect(direction);
		} else {
			// Connect
			addClass(target, "active");
			this.connect(direction);
		}
	}

	connect(direction) {
		// This will be handled by the ConnectionManager
		if (window.connectionManager) {
			window.connectionManager.connect(this, direction);
		}
	}

	disconnect(direction) {
		// This will be handled by the ConnectionManager
		if (window.connectionManager) {
			window.connectionManager.disconnect(this, direction);
		}
	}

	removeView() {
		// Disconnect all connections
		if (window.connectionManager) {
			window.connectionManager.disconnect(this);
		}

		// Remove from DOM
		if (this.element && this.element.parentNode) {
			this.element.parentNode.removeChild(this.element);
		}
	}

	render() {
		return this;
	}

	getElement() {
		return this.element;
	}
}

