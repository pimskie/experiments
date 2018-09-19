// https://codepen.io/anon/pen/MqObox

import * as Utils from './utils.js';
import Wheel from './instruments/Wheel.js';
import Arm from './instruments/Arm.js';

const ctx = Utils.qs('.js-canvas').getContext('2d');
const ctxTrail = Utils.qs('.js-canvas-trail').getContext('2d');

const TAU = Math.PI * 2;

const W = 750;
const H = 750;

const MID_X = W * 0.5;
const MID_Y = H * 0.5;

ctx.canvas.width = ctxTrail.canvas.width = W;
ctx.canvas.height = ctxTrail.canvas.height = H;


const wheel = new Wheel({ position: { x: MID_X, y: MID_Y }, r: 50 }).addInstruments([
	new Arm({ angle: 0, length: 100, speed: 0.08 }).addInstruments([
		new Wheel({  r: 20, half: true  })
	])
]);

let frame = 0;

const loop = () => {
	ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

	ctxTrail.fillStyle = 'rgba(255, 255, 255, 0.005)';
	ctxTrail.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);

	wheel.update();

	if (frame > 0) {
		wheel.draw(ctx, ctxTrail);
	}

	frame++;

	requestAnimationFrame(loop);
};

loop();
