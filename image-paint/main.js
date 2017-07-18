const canvasImage = document.createElement('canvas')
const ctxImage = canvasImage.getContext('2d');

const canvasPaint = document.querySelector('.js-canvas-paint');
const ctxPaint = canvasPaint.getContext('2d');

const drops = [];

let width;
let height;

let rafId = null;
let frame = 0;

const imageLoaded = () => {
	[width, height] = [image.width * 0.5, image.height * 0.5];

	canvasPaint.width = width;
	canvasPaint.height = height;

	ctxImage.drawImage(image, 0, 0, width, height);

	addDrop();

	loop();
}

const addDrop = () => { 
	console.log('add');

	drops.push({
		x: Math.random() * width,
		y: Math.random() * height,
		radius: Math.random() * 10,
		speed: Math.random() * 5,
		decay: 0.98
	});
}

const loop = () => { 
	ctxPaint.clearRect(0, 0, width, height);

	drops.forEach((drop) => { 
		const gradient = ctxPaint.createRadialGradient(
			drop.x,
			drop.y,
			0,
			drop.x,
			drop.y,
			drop.radius
		);


		gradient.addColorStop(0, 'white');
		gradient.addColorStop(0.9, 'rgba(0, 0, 0, 0)');
		
		ctxPaint.beginPath();
		ctxPaint.fillStyle = gradient;
		ctxPaint.arc(drop.x, drop.y, drop.radius, 0, Math.PI * 2);
		ctxPaint.fill();
		ctxPaint.closePath();

		drop.radius += drop.speed;
		drop.speed *= drop.decay;
	});

	ctxPaint.globalCompositeOperation = 'source-in'; // overlay
	ctxPaint.drawImage(image, 0, 0, width, height);

	ctxPaint.globalCompositeOperation = 'source-over';

	frame++;

	if (frame % 10 === 0) {
		addDrop();
	}

	rafId = requestAnimationFrame(loop);
}

const image = document.createElement('img');
image.addEventListener('load', imageLoaded);
image.src = '1.jpg';