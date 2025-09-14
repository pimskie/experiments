import { App } from "./app.js";
import { ConnectionManager } from "./managers/ConnectionManager.js";
import { DragManager } from "./managers/DragManager.js";

/**
 * Main entry point for the modern audio effects mixer
 */
class Main {
	constructor() {
		this.app = null;
		this.connectionManager = null;
		this.dragManager = null;

		this.init();
	}

	init() {
		console.log("Modern Audio Effects Mixer starting...");

		// Initialize managers
		this.connectionManager = new ConnectionManager();
		this.dragManager = new DragManager();

		// Make connection manager globally available for components
		window.connectionManager = this.connectionManager;

		// Initialize the main app
		this.app = new App();

		console.log("Modern Audio Effects Mixer initialized successfully!");
	}
}

// Start the application when DOM is ready
if (document.readyState === "loading") {
	document.addEventListener("DOMContentLoaded", () => {
		new Main();
	});
} else {
	new Main();
}

