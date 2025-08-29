/**
 * Loads an image from a URL and returns a Promise
 * @param {string} url - The URL of the image to load
 * @returns {Promise<HTMLImageElement>} A promise that resolves with the loaded image
 */
function loadImage(url) {
	return new Promise((resolve, reject) => {
		const img = new Image();

		img.onload = () => {
			resolve(img);
		};

		img.onerror = () => {
			reject(new Error(`Failed to load image from ${url}`));
		};

		img.src = url;
	});
}

// Example usage:
// const image = await loadImage('path/to/image.jpg');
// document.body.appendChild(image);

export default loadImage;

