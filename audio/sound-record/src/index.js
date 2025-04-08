/**
 * Application entry point
 */
import DrumMachineApp from "./app.js";

// Initialize when the DOM is ready
document.addEventListener("DOMContentLoaded", () => {
	// Create and initialize the drum machine app
	const app = new DrumMachineApp();
	app.init();

	// Store app instance on window for debugging
	window.drumMachineApp = app;
});

