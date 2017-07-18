const distanceBetween = (x1, y1, x2, y2) => Math.sqrt((x1 - x2) * (x1 - x2) + (y1 - y2) * (y1 - y2));

class Spring {
	constructor(x, y, k, damp) {
		this.x = x;
		this.y = y;

		this.k = k;
		this.damp = damp;

		this.velX = 0;
		this.velY = 0;

		this.length = 1;
	}

	update(destX, destY) {
		this.velX += -this.k * (this.x - destX);
		this.velX *= this.damp;

		this.velY += -this.k * (this.y - destY);
		this.velY *= this.damp;

		let newX = this.x + this.velX;
		let newY = this.y + this.velY;

		this.length = distanceBetween(this.x, this.y, newX, newY);

		this.x = newX;
		this.y = newY;
	}
}

const canvas = document.createElement('canvas');
const ctx = canvas.getContext('2d');

// all set in `setStage`
let canvasWidth;
let canvasHeight;
let canvasMidX;
let canvasMidY;

let rafId = null;

let destination = {
	x: 0,
	y: 0
};

let springs = [];
let mouseDown = false;

const setStage = () => {
	canvasWidth = window.innerWidth;
	canvasHeight = window.innerHeight;
	canvasMidX = canvasWidth >> 1;
	canvasMidY = canvasHeight >> 1;

	canvas.width = canvasWidth;
	canvas.height = canvasHeight;
}

const updateDestination = (e) => {
	destination.x = e.offsetX;
	destination.y = e.offsetY;
}

const createSprings = () => {
	springs = [];

	let numSprings = 2;
	let damp = 0.88;

	while (numSprings--) {
		const x = canvasMidX;
		const y = canvasMidY;
		const k = 0.05; //Math.random() * (0.04) + 0.01; //0.01 - 0.04;
		// const damp = Math.random() * (0.05) + 0.85; // 0.85 - 0.9;

		springs.push(new Spring(canvasMidX, canvasMidY, k, damp));

		damp += 0.025
	}
}

const loop = () => {
	if (!mouseDown) {
		rafId = requestAnimationFrame(loop);

		return;
	}

	ctx.beginPath();
	ctx.fillStyle = 'rgba(0, 0, 0, 1)';
	const firstPoint = {
		x: springs[0].x,
		y: springs[0].y
	};
	springs.forEach((spring, index) => {
		if (index === 0) {
			ctx.moveTo(spring.x, spring.y);
		} else {
			ctx.lineTo(spring.x, spring.y);
		}
	})

	springs.forEach(spring => {
		spring.update(destination.x, destination.y);
	})

	springs.reverse();

	springs.forEach((spring, index) => {
		ctx.lineTo(spring.x, spring.y);
	})

	ctx.lineTo(firstPoint.x, firstPoint.y);

	springs.reverse();

	ctx.fill();
	ctx.stroke();
	ctx.closePath();

	// springs.forEach((spring) => {
	// 	ctx.beginPath();
	// 	ctx.lineWidth = (spring.length * 0.05);
	// 	ctx.moveTo(spring.x, spring.y);

	// 	spring.update(destination.x, destination.y);

	// 	ctx.lineTo(spring.x, spring.y);
	// 	ctx.stroke();
	// 	ctx.closePath();
	// });

	rafId = requestAnimationFrame(loop);
}

canvas.classList.add('canvas');
canvas.addEventListener('mousemove', updateDestination);
canvas.addEventListener('mousedown', (e) => {
	springs.forEach((spring) => {
		spring.x = e.offsetX;
		spring.y = e.offsetY;

		spring.velX = 0;
		spring.velY = 0;
	});

	mouseDown = true;
});

canvas.addEventListener('mouseup', (e) => {
	mouseDown = false;
});
document.body.appendChild(canvas);

setStage();
createSprings();
loop();
