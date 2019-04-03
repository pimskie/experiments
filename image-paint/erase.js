const canvasPaint = document.querySelector('.js-canvas-paint');
const ctxPaint = canvasPaint.getContext('2d');

let drops = [];
const erasers = [];

let width;
let height;

let erase = false;
let rafId = null;

const imageLoaded = () => {
	[width, height] = [image.width , image.height ];

	canvasPaint.width = width;
	canvasPaint.height = height;

	canvasPaint.addEventListener('mousedown', () => erase = true);
	canvasPaint.addEventListener('mouseup', () => erase = false);
	canvasPaint.addEventListener('mousemove', addDrop);

	ctxPaint.drawImage(image, 0, 0, width, height);

	loop();
}

const addDrop = (e) => {
	const [x, y] = [e.clientX, e.clientY];

	drops.push({
		x: x,
		y: y,
		radius: Math.random() * 5,
		speed: Math.random() * 2,
		decay: 0.98
	});
}

const loop = () => {
	// ctxPaint.clearRect(0, 0, width, height);

	ctxPaint.globalCompositeOperation = 'destination-out';

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

	if (erase) {
		//
	} else {
		// ctxPaint.globalCompositeOperation = 'source-in';
		// ctxPaint.drawImage(image, 0, 0, width, height);
		// ctxPaint.globalCompositeOperation = 'source-over';
	}

	rafId = requestAnimationFrame(loop);

}

const image = document.createElement('img');
image.addEventListener('load', imageLoaded);
// image.src = 'https://s29.postimg.org/kg6igp05j/image.jpg';
image.src = '2.png';
