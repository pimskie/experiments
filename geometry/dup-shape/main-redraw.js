const q = (sel) => document.querySelector(sel);

const canvas = q('.js-canvas');
const ctx = canvas.getContext('2d');

const canvasW = 500;
const canvasH = 500;
const midX = canvasW >> 1;
const midY = canvasH >> 1;


const rectangleSlider = q('.js-rectangle');
const rotationSlider = q('.js-rotation');
const iterationSlider = q('.js-iterations');
const scaleXSlider = q('.js-scale-x');
const scaleYSlider = q('.js-scale-y');
const lockScale = q('.js-scale-lock');

let previousScaleX = 1;
let previousScaleY = 1;
let previousRotation = 0;

const iterate = (iteration, totalIterations, rectangleWidth, rotationStep, scaleStepX, scaleStepY) => {
	const scaleX = iteration > 0 ? previousScaleX * scaleStepX : 1;
	const scaleY = iteration > 0 ? previousScaleY * scaleStepY : 1;
	const rotation = iteration > 0 ? previousRotation + ((360 / 100) * rotationStep) : 0;

	ctx.save();
	ctx.translate(midX, midY);

	ctx.scale(scaleX, scaleY);
	ctx.rotate(rotation * (Math.PI / 180));

	ctx.beginPath();
	ctx.strokeStyle = '#000';

	ctx.rect(-rectangleWidth * 0.5, -rectangleWidth * 0.5, rectangleWidth, rectangleWidth);

	ctx.stroke();
	ctx.closePath();
	ctx.restore();

	previousScaleX = scaleX;
	previousScaleY = scaleY;
	previousRotation = rotation;
};

const draw = () => {
	const then = performance.now();

	ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

	previousScaleX = 1;
	previousScaleY = 1;
	previousRotation = 0;

	const width = rectangleSlider.value;
	const rotation = rotationSlider.value;
	const iterations = iterationSlider.value;
	const scaleX = scaleXSlider.value;
	const scaleY = scaleYSlider.value;

	console.log(iterations, scaleX, scaleY, rotation);

	for (let i = 0; i < iterations; i++) {
		iterate(i, iterations, width, rotation, scaleX * 0.01, scaleY * 0.01);
	}

	const now = performance.now();
	const elapsed = now - then;
};

// const onScaleChanged = (e) => {
// 	const scale = e.target.value;
// 	let rotation = 0;

// 	if (scale <= 98) {
// 		const diff = (100 - scale) - 1;
// 		rotation = diff * 0.2;
// 	}

// 	rotationSlider.value = rotation;

// 	draw();
// };

const onScaleChanged = (e) => {
	const isLocked = lockScale.checked;
	const scale = e.target.value;

	if (isLocked) {
		scaleXSlider.value = scale;
		scaleYSlider.value = scale;
	}

	draw();
};

rectangleSlider.addEventListener('input', draw);
rotationSlider.addEventListener('input', draw);
iterationSlider.addEventListener('input', draw);
scaleXSlider.addEventListener('input', onScaleChanged);
scaleYSlider.addEventListener('input', onScaleChanged);

draw();
