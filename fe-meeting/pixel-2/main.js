// const imgUrl = 'https://dl.dropboxusercontent.com/u/4792988/html5-logo-100.png';
// const imgUrl = 'https://dl.dropboxusercontent.com/u/4792988/html5-logo.png';
const imgUrl = 'https://dl.dropboxusercontent.com/u/4792988/ed.jpg';

const container = document.querySelector('.js-canvas-container');

const canvasDestination = document.createElement('canvas');
const ctxDestination = canvasDestination.getContext('2d');

const canvasReference = document.createElement('canvas');
const ctxReference = canvasReference.getContext('2d');

let imagePixels = [];
let destinationImageData;
let destinationPixels;

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

const getPixels = () => {
	// get all pixel data from the loaded image
	const imageData = ctxReference.getImageData(0, 0, canvasReference.width, canvasReference.height);
	const pixelData = imageData.data;

	// store all pixel data (x, y color) in an array
	for (let i = 0; i < pixelData.length; i += 4) {
		const colorTotal = pixelData[i] + pixelData[i + 1] + pixelData[i + 2];
		const alpha = pixelData[i + 3];

		if (colorTotal < (255 * 3) && alpha > 100) {
			const pos = getPixelCoords(i);
			const posDefault = getPixelCoords(i);
			const color = [
				pixelData[i],
				pixelData[i + 1],
				pixelData[i + 2],
				pixelData[i + 3]
			];

			imagePixels.push({ pos, posDefault, color });
		}
	}

	// create imageData for the destination canvas
	destinationImageData = ctxDestination.createImageData(
		canvasDestination.width,
		canvasDestination.height
	);

	destinationPixels = destinationImageData.data;
}

const fuckUp = (e) => {
	const mouseX = e.offsetX;
	const mouseY = e.offsetY;

	const midX = canvasDestination.width >> 1;
	const midY = canvasDestination.height >> 1;

	const maxDist = 100; // Calc.distanceBetween(0, 0, canvasDestination.width, canvasDestination.height);

	for (let i = 0; i < imagePixels.length; i++) {
		const p = imagePixels[i];
		let index = getParticleIndex(p);

		// 'erase' pixel by setting opacity to 0
		destinationPixels[index + 3] = 0;

		const angle = Calc.angleBetween(mouseX, mouseY, p.pos.x, p.pos.y);
		const dist = Calc.distanceBetween(mouseX, mouseY, p.pos.x, p.pos.y);

		let force = (dist / maxDist);
		force = force - 40;

			p.pos.x = p.posDefault.x - (Math.cos(angle) * force);
			p.pos.y = p.posDefault.y - (Math.sin(angle) * force);

		index = getParticleIndex(p);


		destinationPixels[index] = p.color[0];
		destinationPixels[index + 1] = p.color[1]
		destinationPixels[index + 2] = p.color[2];
		destinationPixels[index + 3] = p.color[3];
	}

	ctxDestination.putImageData(destinationImageData, 0, 0);
}

const getPixelCoords = (index) => {
	const x = (index / 4) % canvasDestination.width;
	const y = Math.floor((index / 4) / canvasDestination.width);

	return { x, y };
}

const getParticleIndex = (particle) => {
	return ((particle.pos.x | 0) + (particle.pos.y | 0) * canvasReference.width) * 4;
}

loadImage().then((img) => {
	canvasDestination.width = img.width;
	canvasDestination.height = img.height;

	canvasReference.width = img.width;
	canvasReference.height = img.height;

	ctxReference.drawImage(img, 0, 0);
	ctxDestination.drawImage(img, 0, 0);

	getPixels();

	canvasDestination.addEventListener('mousemove', fuckUp);
});


container.appendChild(canvasReference);
container.appendChild(canvasDestination);
