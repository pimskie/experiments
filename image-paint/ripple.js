const canvasImage = document.createElement('canvas')
const ctxImage = canvasImage.getContext('2d');

const canvasPaint = document.querySelector('.js-canvas-paint');
const ctxPaint = canvasPaint.getContext('2d');

// document.body.appendChild(canvasImage);

let drops = [];

let width;
let height;

let rafId = null;
let frame = 0;

const imageLoaded = () => {
	[ width, height ] = [ image.width * 0.5, image.height * 0.5 ];

	canvasPaint.width = width;
	canvasPaint.height = height;

	canvasImage.width = width;
	canvasImage.height = height;

	ctxImage.drawImage(image, 0, 0, width, height);

	canvasPaint.addEventListener('mousemove', (e) => { 
		addDrop(e);
		if (frame % 10 === 0) {
		}
	});
	// addDrop();

	loop();
}

const addDrop = (e) => {
	const [x, y] = [e.clientX, e.clientY];

	let radius = 5;
	let width = 10;
	const speed = (Math.random() * 3);
	const decay = 0.97;
	const alpha = 1;

	drops.push({
		x,
		y,
		radius,
		width,
		speed,
		decay,
		alpha
	});

	radius += 5;
	width += 1;
}

const loop = () => { 
	ctxPaint.clearRect(0, 0, width, height);
	
	drops.forEach((drop) => { 
		ctxPaint.beginPath();
		ctxPaint.lineWidth = drop.width;
		ctxPaint.strokeStyle = `rgba(255, 0, 0, ${drop.alpha})`;
		ctxPaint.arc(drop.x, drop.y, drop.radius, 0, Math.PI * 2);
		ctxPaint.stroke();
		ctxPaint.closePath();

		drop.radius += drop.speed;
		drop.speed *= drop.decay;
		drop.alpha *= drop.decay;
		drop.width *= drop.decay;
	});

	drops = drops.filter(d =>d.alpha > 0.1);
	
	const scale = 1.1;
	const scaleWidth = width * scale;
	const scaleHeight = height * scale;
	const offsetX = (scaleWidth - width) >> 1;
	const offsetY = (scaleHeight - height) >> 1;

	ctxPaint.globalCompositeOperation = 'source-in';
	ctxPaint.drawImage(image, -offsetX, -offsetY, width * 1.1, height * 1.1);

	ctxPaint.globalCompositeOperation = 'darken';
	ctxPaint.drawImage(image, 0, 0, width, height);

	ctxPaint.globalCompositeOperation = 'source-over';

	frame++;

	rafId = requestAnimationFrame(loop);
}

const image = document.createElement('img');
image.addEventListener('load', imageLoaded);
image.src = '1.jpg';