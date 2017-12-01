/* global noise: false, */

noise.seed(Math.random());

const q = (sel) => document.querySelector(sel);

const canvas = q('canvas');
const ctx = canvas.getContext('2d');
const dim = 200;

let time = 0;

canvas.width = dim;
canvas.height = dim;

const pointer = {
	x: Number.MAX_VALUE,
	y: Number.MAX_VALUE,
	distance: 1,
};

const getCoordsByIndex = (index, width) => {
	const x = (index / 4) % width;
	const y = Math.floor((index / 4) / width);

	return { x, y };
};

const map = (value, start1, stop1, start2, stop2) => ((value - start1) / (stop1 - start1)) * (stop2 - start2) + start2;
const distanceBetween = (v1, v2) => Math.sqrt((v1.x - v2.x) * (v1.x - v2.x) + (v1.y - v2.y) * (v1.y - v2.y));

const distort = (tick, scale = 0.03) => {
	const imagedata = ctx.getImageData(0, 0, dim >> 1, dim >> 1);
	const { width, data, data: { length: numPixels } } = imagedata;

	for (let i = 0; i < numPixels; i += 4) {
		const coords = getCoordsByIndex(i, width);
		const distance = map(distanceBetween(pointer, coords), 0, dim >> 1, 0, 0.5);

		const noiseValue = noise.simplex3(coords.x * scale, coords.y * scale, tick);
		const noiseValueMapped = noiseValue > 0 ? 1 : 0;

		data[i] = 255 * noiseValueMapped;
		data[i + 1] = 255 * noiseValueMapped;
		data[i + 2] = 255 * noiseValueMapped;
		data[i + 3] = 255 * noiseValueMapped;
	}

	ctx.putImageData(imagedata, 0, 0);

	ctx.save();
	ctx.translate(dim, 0);
	ctx.scale(-1, 1);
	ctx.drawImage(ctx.canvas, 0, 0);
	ctx.restore();

	ctx.save();
	ctx.translate(0, dim);
	ctx.scale(1, -1);
	ctx.drawImage(ctx.canvas, 0, 0);
	ctx.restore();
};

const clear = () => {
	ctx.clearRect(0, 0, dim,dim);
};

const loop = () => {
	time += 0.01;

	clear();

	distort(time);

	requestAnimationFrame(loop);
};

loop();


const onPointerMove = (e) => {
	const target = (e.touches && e.touches.length) ? e.touches[0] : e;
	const { offsetX: x, offsetY: y } = target;

	pointer.x = x;
	pointer.y = y;
	pointer.distance = distanceBetween(dim >> 1, dim >> 1, pointer.x, pointer.y);
};

canvas.addEventListener('mousemove', onPointerMove);
canvas.addEventListener('touchmove', onPointerMove);
