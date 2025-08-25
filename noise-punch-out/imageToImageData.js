/**
 * Converts an image to ImageData by drawing it on a canvas
 * @param {HTMLImageElement} img - The image element to convert
 * @param {number} imageWidth - The width to resize the image to
 * @param {number} imageHeight - The height to resize the image to
 * @returns {ImageData} The ImageData of the drawn image
 */
function imageToImageData(img, imageWidth, imageHeight) {
	// Create a canvas element
	const canvas = document.createElement("canvas");

	// Set the canvas size to match the desired image dimensions
	canvas.width = imageWidth;
	canvas.height = imageHeight;

	// Get the 2D context
	const ctx = canvas.getContext("2d");

	// Draw the image on the canvas, scaling it to fit the specified dimensions
	ctx.drawImage(img, 0, 0, imageWidth, imageHeight);

	// Get the ImageData from the canvas
	const imageData = ctx.getImageData(0, 0, imageWidth, imageHeight);

	return imageData;
}

// Example usage:
// const imageData = imageToImageData(myImage, 800, 600);
// console.log(imageData.data); // Uint8ClampedArray with RGBA values

export default imageToImageData;


