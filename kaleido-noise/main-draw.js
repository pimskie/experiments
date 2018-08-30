import * as Utils from 'https://rawgit.com/pimskie/utils/master/utils.js';

noise.seed(Math.random());


const canvasOutput = document.createElement('canvas');
const ctxOutput = canvasOutput.getContext('2d');

const canvasDraw = document.createElement('canvas');
const ctxDraw = canvasDraw.getContext('2d');
canvasDraw.classList.add('slice');

const TAU = Math.PI * 2;
const NUM_SLICES = 20;

const W = 250;
const H = 250;

const MID_X = W * 0.5;
const MID_Y = H * 0.5;

canvasOutput.width = canvasDraw.width = W;
canvasOutput.height = canvasDraw.height = H;

let paths = [];
let currentPath = [];

let isDrawing = false;

const clear = () => {
	ctxDraw.clearRect(0, 0, W, H);
	ctxOutput.clearRect(0, 0, W, H);
}

const drawSlice = () => {
	const r = MID_X;
	const angle = -(Math.PI / 2);
	const angleInc = TAU / NUM_SLICES;

	ctxDraw.save();

	ctxDraw.translate(MID_X, MID_Y);
	ctxDraw.rotate(angle - (angleInc / 2));

	ctxDraw.beginPath();
	ctxDraw.strokeStyle = 'rgba(0, 0, 0, 0.1)';
	ctxDraw.lineWidth = 0.5;

	ctxDraw.moveTo(0, 0);
	ctxDraw.lineTo(r, 0);
	ctxDraw.arc(0, 0, r, 0, angleInc);
	ctxDraw.lineTo(0, 0);

	ctxDraw.stroke();
	ctxDraw.closePath();

	ctxDraw.restore();
}

const drawDuplicates = () => {
	const angleInc = TAU / NUM_SLICES;

	for (let i = 1; i <= NUM_SLICES; i++) {
		const angle = i * angleInc;
		const scale = i % 2 === 0 ? 1 : -1;

		ctxOutput.save();
		ctxOutput.translate(MID_X, MID_Y);
		ctxOutput.scale(1, scale);
		ctxOutput.rotate(angle);

		ctxOutput.drawImage(canvasDraw, 0, 0, canvasOutput.width, canvasOutput.height, -MID_X - 0.5, -(MID_Y - 0.5), canvasOutput.width, canvasOutput.height);
		ctxOutput.restore();
	}
}

const loop = () => {
	clear();

	drawSlice();

	paths.forEach((path) => {
		ctxDraw.beginPath();
		ctxDraw.strokeStyle = '#000';
		ctxDraw.lineWidth = 2;

		path.forEach((coords, i) => {
			if (i === 0) {
				ctxDraw.moveTo(coords.x, coords.y);
			} else {
				ctxDraw.lineTo(coords.x, coords.y);
			}
		});

		ctxDraw.stroke();
		ctxDraw.closePath();
	});

	drawDuplicates();

	requestAnimationFrame(loop);
}


canvasDraw.addEventListener('mousedown', () => {
	isDrawing = true;
	currentPath = [];

	paths.push(currentPath);
});

canvasDraw.addEventListener('mousemove', (e) => {
	if (!isDrawing) {
		return;
	}

	const x = e.clientX;
	const y = e.clientY;


	currentPath.push({ x, y });
});

canvasDraw.addEventListener('mouseup', () => {
	isDrawing = false;
});


document.body.appendChild(canvasDraw);
document.body.appendChild(canvasOutput);

loop();
