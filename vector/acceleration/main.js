/* globals Vector: false, */

const canvas = document.createElement('canvas');
const ctx = canvas.getContext('2d');
canvas.classList.add('canvas');

const PI2 = Math.PI * 2;

// all set in `setStage`
let canvasWidth = 500;
let canvasHeight = 500;
let midX = canvasWidth >> 1;
let midY = canvasHeight >> 1;

canvas.width = canvasWidth;
canvas.height = canvasHeight;

const clear = () => {
	ctx.globalCompositeOperation = 'destination-out';
	ctx.fillStyle = 'hsla(0, 0%, 0%, 0.5)';
	ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
	ctx.globalCompositeOperation = 'lighter';
};

const position = new Vector(midX, midY);
const velocity = new Vector(0, 1);
const acceleration = new Vector();
const wind = new Vector(0, 0);
const gravity = new Vector(0, 0.2);

const loop = () => {
	clear();

	acceleration.addSelf(wind);
	acceleration.addSelf(gravity);
	velocity.addSelf(acceleration);
	position.addSelf(velocity);
	acceleration.multiplySelf(0);

	ctx.beginPath();
	ctx.arc(position.x, position.y, 3, 0, PI2);
	ctx.fill();
	ctx.closePath();

	if (position.y > canvasHeight) {
		position.y = canvasHeight;

		velocity.y *= -1;
		velocity.multiplySelf(0.7);
	}

	requestAnimationFrame(loop);
};

document.body.appendChild(canvas);

loop();
