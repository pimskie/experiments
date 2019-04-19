/*
https://natureofcode.com/book/chapter-3-oscillation/

sine(θ) = Fp / Fg
Fp = Fg * sine(θ)

angular velocity = angular velocity + angular acceleration
angle = angle + angular velocity

A = F / M

angular acceleration = gravity * sine(θ)
*/

const TAU = Math.PI * 2;

const W = 500;
const H = 500;

class Stage {
	constructor(canvas, width, height) {
		this.canvas = canvas;
		this.ctx = this.canvas.getContext('2d');

		this.width = width;
		this.height = height;
	}

	get width() {
		return this.canvas.width;
	}

	get height() {
		return this.canvas.height;
	}

	set width(w) {
		this.canvas.width = w;
	}

	set height(h) {
		this.canvas.height = h;
	}

	clear() {
		this.ctx.clearRect(0, 0, this.width, this.height);
	}
}

class Pendulum {
	constructor(position, length, angle, gravity = 0.4) {
		this.position = position;
		this.length = length;
		this.angle = angle - (Math.PI / 2);
		this.gravity = gravity;

		this.velocity = 0;
		this.acceleration = 0;
	}

	update() {
		this.acceleration = (-1 * this.gravity * Math.sin(this.angle)) / this.length;
		this.velocity += this.acceleration;
		this.angle += this.velocity;

		this.velocity *= 0.99;
	}

	draw(ctx) {
		const { position: from, length } = this;

		const to = {
			x: from.x + Math.cos(this.angle + (Math.PI / 2)) * length,
			y: from.y + Math.sin(this.angle + (Math.PI / 2)) * length,
		};

		ctx.beginPath();
		ctx.moveTo(from.x, from.y);
		ctx.lineTo(to.x, to.y);
		ctx.stroke();
		ctx.closePath();
	}
}

const stage = new Stage(document.querySelector('canvas'), 500, 500);
const pendulum = new Pendulum(
	{ x: stage.width * 0.5,y: stage.height * 0.5 },
	100,
	0,
	0.4
);

const loop = () => {
	stage.clear();

	pendulum.update();
	pendulum.draw(stage.ctx);

	requestAnimationFrame(loop);
};


loop();
