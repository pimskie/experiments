// https://two.js.org/examples/rubber-ball.html

import * as Utils from 'https://rawgit.com/pimskie/utils/master/utils.js';

const canvas = Utils.qs('canvas');
const ctx = canvas.getContext('2d');
const PI = Math.PI;
const TAU = PI * 2; // PIPI ^^

const W = window.innerWidth;
const H = window.innerHeight;
const MID_X = W * 0.5;
const MID_Y = H * 0.5;

ctx.canvas.width = W;
ctx.canvas.height = H;

const RADIUS = 50;
const NUM_VERTICES = 20;

const mouse = new Vector(MID_X, MID_Y);
const ballPosition = mouse.clone();
const ANGLE_FALLOFF = 90 * (PI / 180);

let angle = 0;
let distance = 0;

const drawBall = () => {
	const { x, y } = ballPosition;

	for (let i = 0; i < NUM_VERTICES; i++) {
		const vertexAngle = i * (TAU / NUM_VERTICES);
		const vertexX = x + (Math.cos(vertexAngle) * RADIUS);
		const vertexY = y + (Math.sin(vertexAngle) * RADIUS);

		const affected = Math.abs(vertexAngle) >= ANGLE_FALLOFF;
		const fill = affected ? 'red' : 'white';

		console.log(vertexAngle, affected, ANGLE_FALLOFF);

		ctx.beginPath();
		ctx.fillStyle = fill;
		ctx.arc(vertexX, vertexY, 5, 0, TAU, false);
		ctx.fill();
		ctx.stroke();
		ctx.closePath();
	}
};

const clear = () => {
	ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
};

const loop = () => {
	clear();

	// const smoothness = 7;

	// ballPosition.x += (mouse.x - ballPosition.x) / smoothness;
	// ballPosition.y += (mouse.y - ballPosition.y) / smoothness;

	drawBall();

	// requestAnimationFrame(loop);
};

const onPointerMove = (e) => {
	const event = (e.touches && e.touches.length) ? e.touches[0] : e;
	const { clientX, clientY } = event;

	mouse.x = clientX;
	mouse.y = clientY;

	angle = Utils.angleBetween(ballPosition, mouse);
};

canvas.addEventListener('mousemove', onPointerMove);
canvas.addEventListener('touchmove', onPointerMove);

loop();
