/**
 * Time utility functions
 */

/**
 * Format time in seconds to MM:SS format
 * @param {number} seconds - Time in seconds
 * @returns {string} - Formatted time
 */
export const formatTime = (seconds) => {
	const minutes = Math.floor(seconds / 60);
	const remainingSeconds = Math.floor(seconds % 60);
	return `${minutes.toString().padStart(2, "0")}:${remainingSeconds
		.toString()
		.padStart(2, "0")}`;
};

/**
 * Create a timeout promise
 * @param {number} ms - Milliseconds to wait
 * @returns {Promise} - Promise that resolves after ms milliseconds
 */
export const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
