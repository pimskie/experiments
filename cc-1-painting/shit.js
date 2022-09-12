
let imageData;

const getImageData = (ctxDest, image) => {
	ctxDest.drawImage(image, 0, 0, ctxDest.canvas.width, ctxDest.canvas.height);

	return ctxDest.getImageData(0, 0, W, H);
};

const getPixelIndex = (x, y, imageData) => (Math.floor(x) + Math.floor(y) * imageData.width) * 4;

const getColor = ({ x, y },) => {
	const pixelIndex = getPixelIndex(x, y, imageData);

	return {
		r: imageData.data[pixelIndex],
		g: imageData.data[pixelIndex + 1],
		b: imageData.data[pixelIndex + 2],
	};
};


// IN START
imageData = getImageData(ctxGhost, image);
