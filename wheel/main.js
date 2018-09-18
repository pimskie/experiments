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

// const wheel = new Wheel({
// 	position: { x: 52, y: MID_Y }, r: 50,
// }).addInstruments([
// 	new Arm({ length: 250, anchor: { x: 200, y: MID_Y + 100 } }).addInstruments([
// 		new Arm({ length: 100, angle: -Math.PI / 2 }).addInstruments([
// 			new Wheel({ r: 40, half: false, speed: -0.04 }).addInstruments([
// 				new Arm({ length: 200, anchor: { x: 250, y: 300 } }).addInstruments([
// 					new Wheel({ r: 50, half: true }).addInstruments([
// 						new Arm({ angle: 0, length: 200 }).addInstruments([
// 							new Arm({ length: 300, trombone: 0.5, anchor: { x: MID_X + 75, y: MID_Y + 50 } }).addInstruments([
// 								new Wheel({ r: 50, yoyo: true }).addInstruments([
// 									new Arm({ length: 150, angle: 0 }).addInstruments([
// 										new Wheel({ r: 20, speed: -0.02 })
// 									])
// 								])
// 							])
// 						])
// 					]),
// 				])
// 			])
// 		])
// 	])
// ]);

const wheel = new Wheel({ position: { x: MID_X, y: MID_Y }, r: 100 }).addInstruments([
	new Arm({ angle: 0, length: 100 })
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
