import * as Utils from 'https://rawgit.com/pimskie/utils/master/utils.js';

const ctx = Utils.qs('canvas').getContext('2d');

const PI = Math.PI;
const TAU = PI * 2;

const W = window.innerWidth;
const H = window.innerHeight;
const MID_X = W * 0.5;
const MID_Y = H * 0.5;

ctx.canvas.width = W;
ctx.canvas.height = H;

const wheel = {
	position: {
		x: 200,
		y: MID_Y,
	},

	r: 100,
	angle: 0,

	arm: {
		length: 450,

		through: {
			angle: 0,
			distance: 200,
		},

		to: {
			x: 0,
			y: 0,
		},
	},
};

const arm = {
	angle: -(PI / 2),
	from: wheel.arm.to,
	length: 100,
	to: {
		x: 0,
		y: 0,
	},
};

const update = (wheel) => {
	wheel.angle += 0.02;
};

const draw = (wheel) => {
	// wheel
	ctx.beginPath();
	ctx.arc(wheel.position.x, wheel.position.y, wheel.r, 0, TAU, false);
	ctx.stroke();
	ctx.closePath();

	// dot (?)
	const dotX = wheel.position.x + (Math.cos(wheel.angle) * wheel.r);
	const dotY = wheel.position.y + (Math.sin(wheel.angle) * wheel.r);

	ctx.beginPath();
	ctx.arc(dotX, dotY, 3, 0, TAU, false);
	ctx.fill();
	ctx.closePath();

	// anchor
	const anchorX = wheel.position.x + (Math.cos(wheel.arm.through.angle) * wheel.arm.through.distance);
	const anchorY = wheel.position.y + (Math.sin(wheel.arm.through.angle) * wheel.arm.through.distance);

	ctx.beginPath();
	ctx.arc(anchorX, anchorY, 5, 0, TAU, false);
	ctx.fill();
	ctx.closePath();

	// wheel arm
	const connectAngle = Utils.angleBetween({ x: dotX, y: dotY }, { x: anchorX, y: anchorY });

	wheel.arm.to.x = dotX + (Math.cos(connectAngle) * wheel.arm.length);
	wheel.arm.to.y = dotY + (Math.sin(connectAngle) * wheel.arm.length);

	ctx.beginPath();
	ctx.moveTo(dotX, dotY);
	ctx.lineTo(wheel.arm.to.x, wheel.arm.to.y);
	ctx.stroke();
	ctx.closePath();

	// other arm
	arm.to.x = arm.from.x + (Math.cos(arm.angle) * arm.length);
	arm.to.y = arm.from.y + (Math.sin(arm.angle) * arm.length);

	ctx.beginPath();
	ctx.moveTo(arm.from.x, arm.from.y);
	ctx.lineTo(arm.to.x, arm.to.y);
	ctx.stroke();
	ctx.closePath();
};

const clear = () => {
	ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
};

const loop = () => {
	clear();

	update(wheel);
	draw(wheel);

	requestAnimationFrame(loop);
};

loop();
