/**
 * Custom hook for managing the Web Audio API context
 */

let audioContext = null;
let initialized = false;
const initCallbacks = [];

/**
 * Initialize the audio context on user interaction
 */
const initializeOnInteraction = () => {
	if (initialized) return;

	document.addEventListener(
		"click",
		() => {
			if (!audioContext) {
				audioContext = new (window.AudioContext || window.webkitAudioContext)();
				initialized = true;

				// Call any pending callbacks
				initCallbacks.forEach((callback) => callback(audioContext));
				initCallbacks.length = 0;
			}
		},
		{ once: true }
	);
};

// Initialize the event listener
initializeOnInteraction();

/**
 * Get or create the audio context
 * @returns {AudioContext} - The audio context
 */
export const useAudioContext = () => {
	if (!audioContext) {
		audioContext = new (window.AudioContext || window.webkitAudioContext)();
		initialized = true;
	}

	return audioContext;
};

/**
 * Register a callback to be called when the audio context is initialized
 * @param {Function} callback - Function to call with the audio context
 */
export const onAudioContextReady = (callback) => {
	if (initialized && audioContext) {
		callback(audioContext);
	} else {
		initCallbacks.push(callback);
	}
};

export default useAudioContext;
