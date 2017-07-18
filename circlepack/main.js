// https://www.youtube.com/watch?v=QHEQuoIKgNE

const canvas = document.createElement('canvas');
const ctx = canvas.getContext('2d');
const PI2 = Math.PI * 2;

// const IMAGE_URL = 'logo-af-large.jpg';
const IMAGE_URL = 'manmanman.jpg';
// const IMAGE_URL = 'coby.jpg';

let attempts = 0;

class Circle {
	constructor({ x = 0, y = 0, speed = 1, radius = 2, color = {r: 0, g: 0, b: 0}} = {}) {
		Object.assign(this, { x, y, speed, radius, color });

		this.startRadius = this.radius;
		this.colorString = `rgb(${this.color.r}, ${this.color.g}, ${this.color.b})`;
		this.alive = true;
	}

	update(w, h, circles) { 
		this.collides(w, h, circles);

		if (!this.alive) {
			return;
		}

		this.radius += this.speed;
		// this.radius = Calc.clamp(this.radius, 1, 10);
	}

	collides(w, h, circles) {
		const outBounds = this.x - this.radius < 0 ||
			this.x + this.radius > w ||
			this.y - this.radius < 0 ||
			this.y + this.radius > h;

		if (outBounds) {
			this.alive = false;
		}

		if (!this.alive) {
			return;
		}

		for (let i = 0; i < circles.length; i++) {
			const c = circles[i];
			const dist = Calc.distanceBetween(this.x, this.y, c.x, c.y);
			const distance = c.radius + this.radius;

			if (c !== this && dist < distance) {
				this.alive = false;
				i = circles.length;
			}
		}
	}
}

let w;
let h;

let rafId = null;

let points;
let circles;

const clear = () => {
	ctx.clearRect(0, 0, w, h);
}

const loadImage = () => {
	image = document.createElement('img');

	image.crossOrigin = '';
	image.src = IMAGE_URL;

	return new Promise(function(resolve, reject) {
		image.addEventListener('load', function() {
			resolve(image);
		});
	});
}


const loop = () => {
	if (!points.length) {
		return;
	}

	clear();
		
	let num = 20;

	while (num--) {
		createCircle();
	}

	circles.forEach((c, i) => { 
		c.update(w, h, circles);

		ctx.beginPath();
		ctx.fillStyle = c.colorString;
		ctx.arc(c.x, c.y, c.radius, 0, PI2);
		ctx.fill();
		ctx.closePath();
	});

	rafId = requestAnimationFrame(loop);
}

const createCircle = () => { 
	const index = Math.floor(Math.random() * points.length);
	const point = points[index];
	const { pos, color } = point;

	if (isColliding(pos)) {
		return;
	}
		
	circles.push(new Circle({
		x: pos.x,
		y: pos.y,
		radius: 1,
		speed: 0.5,
		color,
	}));

	points.splice(index, 1);
}

const isColliding = (pos) => { 
	return circles.some((c) => { 
		const dist = Calc.distanceBetween(pos.x, pos.y, c.x, c.y);

		return dist - 2 < c.radius;
	});
}

document.body.appendChild(canvas);

loadImage().then((img) => {
	[w, h] = [img.width, img.height];

	canvas.width = w;
	canvas.height = h;

	ctx.drawImage(img, 0, 0, w, h);

	const imageData = ctx.getImageData(0, 0, w, h).data;

	circles = [];
	points = [];

	for (let i = 0; i < imageData.length; i += 4) {
		const colorTotal = imageData[i] + imageData[i + 1] + imageData[i + 2];
		const alpha = imageData[i + 3];

		// magic number
		if (alpha > 100) {
			const x = (i / 4) % w;
			const y = Math.floor((i / 4) / w);

			points.push({
				pos: { x, y },
				color: {
					r: imageData[i],
					g: imageData[i + 1],
					b: imageData[i + 2],
				},
			});
		}
	}

	clear();

}).then(loop);