let simplex = new SimplexNoise(Math.random());

const TAU = Math.PI * 2;

const canvasDraw = document.createElement('canvas');
const ctxDraw = canvasDraw.getContext('2d');

const canvasImage = document.createElement('canvas');
const ctxImage = canvasImage.getContext('2d');
document.body.appendChild(canvasDraw);

const btnCamera = document.querySelector('.js-camera');
const btnCapture = document.querySelector('.js-capture');
const btnCancel = document.querySelector('.js-cancel');
const video = document.querySelector('.js-video');

const width = 500;
const height = 500;

const midX = width * 0.5;
const midY = height * 0.5;

const painters = [];

let phase = 0;
let rafId;

let pixelData;


canvasDraw.width = width;
canvasDraw.height = height;

canvasImage.width = width;
canvasImage.height = height;

class Painter {
	constructor(radius, angle, speed) {
		this.radius = radius;
		this.radiusBase = this.radius;

		this.angle = angle;
		this.speed = speed;

		this.width = 1;
		this.position = { x: 0, y: 0 };

		this.setPosition();
	}

	setPosition() {
		this.position.x = Math.cos(this.angle) * this.radius;
		this.position.y = Math.sin(this.angle) * this.radius;
	}

	get positionClean() {
		const x = Math.cos(this.angle) * this.radiusBase;
		const y = Math.sin(this.angle) * this.radiusBase;

		return { x, y };
	}

	getNoiseValue(frame) {
		const scale = 0.01;
		const { position } = this;
		const z = frame * scale;

		return simplex.noise2D(position.x * scale, position.y * scale);
		// return simplex.noise3D(position.x * scale, position.y * scale, z);
	}

	update(frame = 1) {
		const noiseValue = this.getNoiseValue(frame);

		this.angle += this.speed;
		this.radius = this.radiusBase + (20 * noiseValue);
		this.width = 1; //4 + (2 * noiseValue);

		this.setPosition();
	}
}

const getPixelIndex = (x, y, imageData) => (~~x + ~~y * imageData.width) * 4;
const map = (value, start1, stop1, start2, stop2) => ((value - start1) / (stop1 - start1)) * (stop2 - start2) + start2;

const getColor = (position, ctx) => {
	const pixelIndex = getPixelIndex(position.x, position.y, pixelData);

	const r = pixelData.data[pixelIndex] || 0;
	const g = pixelData.data[pixelIndex + 1] || 0;
	const b = pixelData.data[pixelIndex + 2] || 0;

	const sum = r + g + b;
	const a = sum <= 50 ? 0 : 1;
	const color = `rgba(${r}, ${g}, ${b}, ${a})`;

	return { sum, color };
}

const gogogo = (source) => {
	simplex = new SimplexNoise(Math.random());

	cancelAnimationFrame(rafId);

	painters.splice(0, painters.length);
	ctxImage.drawImage(source, 0, 0);
	ctxDraw.drawImage(source, 0, 0);

	pixelData = ctxImage.getImageData(0, 0, width, height);

	const numBrushes = 2000;

	for (let i = 0; i < numBrushes; i++) {
		const r = Math.random() * (source.width);
		const a = Math.random() * TAU;
		const s = -0.02 + (Math.random() * 0.04);

		painters.push(new Painter(r, a, s));
	}

	loop();
};

const loop = () => {
	painters.forEach((p, i) => {
		const { x: x1, y: y1 } = p.position;

		p.update(phase);

		const { x: x2, y: y2 } = p.position;

		const colorData = getColor({ x: midX + p.positionClean.x, y: midY + p.positionClean.y, }, ctxImage)
		const colorTo = colorData.color;
		const brightness = map(colorData.sum, 0, 600, -10, 20);

		const colorAverage = tinycolor(colorTo)
			.brighten(brightness)
			.toHexString();

		ctxDraw.beginPath();
		ctxDraw.strokeStyle = colorAverage;
		ctxDraw.lineWidth = p.width;

		ctxDraw.moveTo(midX + x1, midY + y1);
		ctxDraw.lineTo(midX + x2, midY + y2);

		ctxDraw.stroke();
		ctxDraw.closePath();
	});

	phase += 1;
	rafId = requestAnimationFrame(loop);
};

const img = document.createElement('img');

img.crossOrigin = 'Anonymous';
img.addEventListener('load', () => {
	gogogo(img);

	canvasDraw.addEventListener('mouseup', () => gogogo(img));
});

img.src = 'https://pimskie.dev/public/assets/mona-lisa-500.jpg';

const toggleVideo = (isRecording) => {
	video.classList.toggle('is-hidden', !isRecording);
	btnCapture.classList.toggle('is-hidden', !isRecording);
	btnCancel.classList.toggle('is-hidden', !isRecording);
	btnCamera.classList.toggle('is-hidden', isRecording);
};

const stopRecording = (stream) => {
	stream.getTracks().forEach(track => track.stop());
};

btnCamera.addEventListener('click', () => {
	const constraints = { video: { width: 500, height: 500 }, audio: false };

	navigator.mediaDevices.getUserMedia(constraints)
		.then(function (stream) {
			toggleVideo(true);

			video.srcObject = stream;

			video.onloadedmetadata = function (e) {
				video.play();
			};

			btnCancel.addEventListener('click', () => {
				stopRecording(stream);
				toggleVideo(false);
			});

			btnCapture.addEventListener('click', () => {
				gogogo(video);

				stopRecording(stream);
				toggleVideo(false);
			});
		})
		.catch(function (err) {
			console.log(err.name + ": " + err.message);
		});

});
