const simplex = new SimplexNoise(Math.random());

const q = sel => document.querySelector(sel);

const map = (value, start1, stop1, start2, stop2) => ((value - start1) / (stop1 - start1)) * (stop2 - start2) + start2;

const canvasSketch = q('.js-canvas-sketch');
const ctxScetch = canvasSketch.getContext('2d');

const canvas = q('.js-canvas');
const ctx = canvas.getContext('2d');

const scetchSize = 100;
const canvasSize = 600;
const scale = 100;

let time = 0;

canvasSketch.width = scetchSize;
canvasSketch.height = scetchSize;

canvas.width = canvasSize;
canvas.height = canvasSize;

const MAX = Number.MAX_VALUE;
const pointer = { x: MAX, y: MAX, distance: 1 };

const getCoordsByIndex = (index, width) => {
	const x = (index / 4) % width;
	const y = Math.floor((index / 4) / width);

	return { x, y };
};

const distort = (tick) => {
	const noiseScale = 1;

	const cols = (canvasSize / scale);
	const rows = (canvasSize / scale);

	for (let y = 0; y < rows; y++) {
		for (let x = 0; x < cols; x++) {
			const noise = simplex.noise3D(x * noiseScale, y * noiseScale, tick);
			const alpha = noise > 0.5 ? 1 : 0;

			// if (alpha === 1) {
			// 	ctx.beginPath();
			// 	ctx.fillStyle = `rgba(0, 0, 0, ${alpha})`;
			// 	ctx.arc(x * scale, y * scale, scale, 0, Math.PI * 2);
			// 	ctx.closePath();
			// 	ctx.fill();
			// }

			ctx.beginPath();
			ctx.fillStyle = `rgba(0, 0, 0, ${alpha})`;
			ctx.arc(x * scale, y * scale, scale, 0, Math.PI * 2);
			ctx.closePath();
			ctx.stroke();
			ctx.fill();
		}
	}


	// for (let i = 0; i < numPixels; i += 4) {
	// 	const { x, y } = getCoordsByIndex(i, width);
	// 	const noiseValue = noise.simplex3(x * noiseScale, y * noiseScale, tick);
	// 	const alpha = noiseValue > 0 ? 1 : 0;

	// 	data[i] = 0;
	// 	data[i + 1] = 0;
	// 	data[i + 2] = 0;
	// 	data[i + 3] = 255 * alpha;

	// 	if (alpha === 1) {
	// 		ctx.beginPath();
	// 		ctx.fillStyle = `rgba(0, 0, 0, ${alpha})`;
	// 		ctx.arc(x * scale, y * scale, scale, 0, Math.PI * 2);
	// 		ctx.closePath();
	// 		ctx.fill();
	// 	}
	// }


	// ctx.save();
	// ctx.translate(canvasSize, 0);
	// ctx.scale(-1, 1);
	// ctx.drawImage(ctx.canvas, 0, 0);
	// ctx.restore();

	// ctx.save();
	// ctx.translate(0, canvasSize);
	// ctx.scale(1, -1);
	// ctx.drawImage(ctx.canvas, 0, 0);
	// ctx.restore();
};

const clear = () => {
	ctxScetch.clearRect(0, 0, scetchSize, scetchSize);
	ctx.clearRect(0, 0, canvasSize, canvasSize);
};

const loop = () => {
	time += 0.01;

	clear();

	distort(time);

	requestAnimationFrame(loop);
};

loop();
