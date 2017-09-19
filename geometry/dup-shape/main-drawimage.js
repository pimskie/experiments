const q = (sel) => document.querySelector(sel);

const canvas = q('.js-canvas');
const ctx = canvas.getContext('2d');

const canvasGhost = document.createElement('canvas');
const ctxGhost = canvasGhost.getContext('2d');

const canvasW = canvasGhost.width = 500;
const canvasH = canvasGhost.height = 500;
const midX = canvasW >> 1;
const midY = canvasH >> 1;

const rectangleSlider = q('.js-rectangle');
const rotationSlider = q('.js-rotation');
const iterationSlider = q('.js-iterations');
const scaleSlider = q('.js-scale');

let previousScale = 1;
let previousRotation = 0;

const iterate = (iteration, totalIterations, rectangleWidth, endRotation, endScale) => {
	const scale = iteration > 0 ? previousScale * endScale : 1;
	const rotation = iteration > 0 ? previousRotation + ((360 / 100) * endRotation) : 0;

	ctx.save();
	ctx.translate(midX, midY);

	ctx.scale(scale, scale);
	ctx.rotate(rotation * (Math.PI / 180));

	ctx.drawImage(canvasGhost, -rectangleWidth >> 1, -rectangleWidth >> 1);

	ctx.restore();

	previousScale = scale;
	previousRotation = rotation;
};

const draw = () => {
	const then = performance.now();

	ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
	ctxGhost.clearRect(0, 0, ctxGhost.canvas.width, ctxGhost.canvas.height);

	previousScale = 1;
	previousRotation = 0;

	const rectangleWidth = rectangleSlider.value;
	const rotation = rotationSlider.value;
	const iterations = iterationSlider.value;
	const scale = scaleSlider.value;

	ctxGhost.beginPath();
	ctxGhost.strokeStyle = '#000';

	// ctxGhost.rect(-rectangleWidth >> 1, -rectangleWidth >> 1, rectangleWidth, rectangleWidth);
	ctxGhost.rect(0, 0, rectangleWidth, rectangleWidth);

	ctxGhost.stroke();
	ctxGhost.closePath();

	for (let i = 0; i < iterations; i++) {
		iterate(i, iterations, rectangleWidth, rotation, scale * 0.01);
	}

	const now = performance.now();
	const elapsed = now - then;

	console.log('elapsed', elapsed);
};

const onSliderChanged = draw;

rectangleSlider.addEventListener('input', onSliderChanged);
rotationSlider.addEventListener('input', onSliderChanged);
iterationSlider.addEventListener('input', onSliderChanged);
scaleSlider.addEventListener('input', onSliderChanged);

draw();
