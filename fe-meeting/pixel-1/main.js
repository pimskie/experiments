const imgUrl = 'https://dl.dropboxusercontent.com/u/4792988/html5-logo.png';

const container = document.querySelector('.js-canvas-container');
const c = document.createElement('canvas');
const ctx = c.getContext('2d');

const cImage = document.createElement('canvas');
const ctxImage = cImage.getContext('2d');

const loadImage = () => {
	image = document.createElement('img');

	image.crossOrigin = '';
	image.src = imgUrl;

	return new Promise(function(resolve, reject) {
		image.addEventListener('load', function() {
			resolve(image);
		});
	});
}

const invert = () => {
	const imageData = ctxImage.getImageData(0, 0, cImage.width, cImage.height);
	const pixelData = imageData.data;

	for (let i = 0; i < pixelData.length; i += 4) {
		pixelData[i] = 255 - pixelData[i];
		pixelData[i + 1] = 255 - pixelData[i + 1];
		pixelData[i + 2] = 255 - pixelData[i + 2];
	}

	ctx.putImageData(imageData, 0, 0);
}

const grayscale = () => {
	const imageData = ctxImage.getImageData(0, 0, cImage.width, cImage.height);
	const pixelData = imageData.data;

	for (let i = 0; i < pixelData.length; i += 4) {
		const brightness = (pixelData[i] + pixelData[i + 1] + pixelData[i + 2]) / 3;

		pixelData[i] = brightness;
		pixelData[i + 1] = brightness;
		pixelData[i + 2] = brightness;
	}

	ctx.putImageData(imageData, 0, 0);
}

const saturate = () => {
	const imageData = ctxImage.getImageData(0, 0, cImage.width, cImage.height);
	const pixelData = imageData.data;
	const saturation = 2;

	for (let i = 0; i < pixelData.length; i += 4) {
		pixelData[i] *= saturation;
		pixelData[i + 1] *= saturation
		pixelData[i + 2] *= saturation
	}

	ctx.putImageData(imageData, 0, 0);
}

loadImage().then((img) => {
	c.width = img.width;
	c.height = img.height;

	cImage.width = img.width;
	cImage.height = img.height;

	ctxImage.drawImage(img, 0, 0);
	ctx.drawImage(img, 0, 0);
});


container.appendChild(cImage);
container.appendChild(c);

document.querySelector('.js-invert').addEventListener('click', invert);
document.querySelector('.js-grayscale').addEventListener('click', grayscale);
document.querySelector('.js-saturate').addEventListener('click', saturate);
