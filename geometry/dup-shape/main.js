// https://www.youtube.com/watch?v=kCwmEfCsPdw

const q = (sel) => document.querySelector(sel);

const canvas = q('.js-canvas');
const ctx = canvas.getContext('2d');

const canvasW = 500;
const canvasH = 500;
const midX = canvasW >> 1;
const midY = canvasH >> 1;

const rotationSlider = q('.js-rotation');
const iterationSlider = q('.js-iterations');
const scaleXSlider = q('.js-scale-x');
const scaleYSlider = q('.js-scale-y');
const lockScaleCheckbox = q('.js-scale-lock');
const shapeSelect = q('.js-shape');
const image = q('.js-image');

let previousScaleX = 1;
let previousScaleY = 1;
let previousRotation = 0;

const drawRectangle = (width, height) => {
	ctx.rect(-width * 0.5, -height * 0.5, width, height);
};

const drawEllipse = (width, height) => {
	ctx.ellipse(0, 0, width * 0.5, height * 0.5, 0, 0, Math.PI * 2, false);
};

const drawHexagon = (width) => {
	const radius = width >> 1;
	const length = ((radius * (Math.sqrt(3))) / 3) * 2;

	// https://codepen.io/gibatronic/pen/ogeOeY?editors=0010
	ctx.moveTo(length * Math.cos(0), length * Math.sin(0));

	for (let i = 1; i < 7; i++) {
		ctx.lineTo(length * Math.cos(i * 2 * Math.PI / 6), length * Math.sin(i * 2 * Math.PI / 6));
	}
};

const drawImage = () => {
	ctx.drawImage(image, -image.width * 0.5, -image.height * 0.5);
};

const iterate = (iteration, totalIterations, shapeWidth, rotationStep, scaleStepX, scaleStepY, shape) => {
	const scaleX = iteration > 0 ? previousScaleX * scaleStepX : 1;
	const scaleY = iteration > 0 ? previousScaleY * scaleStepY : 1;
	const rotation = iteration > 0 ? previousRotation + ((360 / 100) * rotationStep) : 0;

	ctx.save();
	ctx.translate(midX, midY);

	ctx.rotate(rotation * (Math.PI / 180));
	ctx.scale(scaleX, scaleY);

	ctx.beginPath();

  const grad = ctx.createLinearGradient(0, canvasH / 4, canvasW / 4, canvasH / 4);

  grad.addColorStop(0, '#fc1154');
  grad.addColorStop(1, '#81dfef');

	ctx.strokeStyle = grad;

	if (shape === 'rectangle') {
		drawRectangle(shapeWidth, shapeWidth);
	} else if (shape === 'ellipse') {
		drawEllipse(shapeWidth, shapeWidth);
	} else if (shape === 'hexagon') {
		drawHexagon(shapeWidth, shapeWidth);
	} else {
		drawImage();
	}

	ctx.stroke();
	ctx.closePath();
	ctx.restore();

	previousScaleX = scaleX;
	previousScaleY = scaleY;
	previousRotation = rotation;
};

const draw = () => {
	ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

	previousScaleX = 1;
	previousScaleY = 1;
	previousRotation = 0;

	const width = canvasW * 0.75;

	const rotation = rotationSlider.value;
	const iterations = iterationSlider.value;
	const scaleX = scaleXSlider.value * 0.01;
	const scaleY = scaleYSlider.value * 0.01;
	const shape = shapeSelect.value;

	for (let i = 0; i < iterations; i++) {
		iterate(i, iterations, width, rotation, scaleX, scaleY, shape);
	}
};

const onScaleChanged = (e) => {
	const isLocked = lockScaleCheckbox.checked;
	const scale = e.target.value;

	if (isLocked) {
		scaleXSlider.value = scale;
		scaleYSlider.value = scale;
	}

	draw();
};

const onScaleLockedChanged = () => {
	const isLocked = lockScaleCheckbox.checked;

	if (isLocked) {
		const scaleX = scaleXSlider.value;
		scaleYSlider.value = scaleX;
	}

	draw();
};


rotationSlider.addEventListener('input', draw);
iterationSlider.addEventListener('input', draw);
shapeSelect.addEventListener('change', draw);
scaleXSlider.addEventListener('input', onScaleChanged);
scaleYSlider.addEventListener('input', onScaleChanged);
lockScaleCheckbox.addEventListener('change', onScaleLockedChanged);

draw();
