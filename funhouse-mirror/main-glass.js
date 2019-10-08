const lerp = (norm, min, max) => (max - min) * norm + min;
const map = (value, start1, stop1, start2, stop2) => ((value - start1) / (stop1 - start1)) * (stop2 - start2) + start2;

const width = 500;
const height = 500;
const cx = width * 0.5;
const cy = height * 0.5;

const ctx = document.querySelector('.js-canvas').getContext('2d');
const { canvas } = ctx;

canvas.width = width;
canvas.height = height;

const drawImage = (img, radius, scale = 1, rotate, opacity, isOdd = false) => {
	const fillRule = isOdd ? 'evenodd' : 'nonzero';
	const offsetX = (width * scale) - (width);
	const offsetY = (width * scale) - (width);


	ctx.save();
	ctx.beginPath();
	ctx.arc(cx, cy, radius, 0, Math.PI * 2);
	ctx.closePath();

	ctx.clip(fillRule);

	ctx.translate(cx, cy);
	ctx.rotate(rotate);
	ctx.drawImage(img, -offsetX - cx, -offsetY - cy, width * scale, height * scale);
	ctx.restore();
};

const run = (e) => {
	let phase = 0;

	const img = e.target;
	const count = 100;

	const radiusEnd = cx * 0.1;
	const radiusStep = (cx - radiusEnd) / count;

	const scaleEnd = 5;
	const scaleStep = (scaleEnd - 1) / count;

	const rotation = 0;

	const loop = () => {
		ctx.clearRect(0, 0, width, height);

		const norm = map(Math.cos(phase), -1, 1, 0, 1);
		const scaleFactor = lerp(norm, 0.009, 0.07);

		for (let i = 0; i < count; i++) {
			const isEven = i % 2 === 0;
			const rotate = 0;
			// const rotate = i * 0.03 * norm * (isEven ? 1 : -1);

			drawImage(img, cx - (radiusStep * i), 1 + (Math.pow(scaleStep, i * scaleFactor)), rotate, 1, !isEven);
		}

		phase += 0.02;


		requestAnimationFrame(loop);
	};

	loop();
};

const image = new Image();
image.addEventListener('load', run);
image.src = 'img.jpg';
