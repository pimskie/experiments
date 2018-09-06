import * as Utils from './utils.js';
import Wheel from './Wheel.js';
import Arm from './Arm.js';

const ctx = Utils.qs('.js-canvas').getContext('2d');
const ctxTrail = Utils.qs('.js-canvas-trail').getContext('2d');

const TAU = Math.PI * 2;

const W = window.innerWidth;
const H = window.innerHeight;

const MID_X = W * 0.5;
const MID_Y = H * 0.5;

ctx.canvas.width = ctxTrail.canvas.width = W;
ctx.canvas.height = ctxTrail.canvas.height = H;

// const wheel = new Wheel({
// 	position: { x: 100, y: MID_Y },
// 	r: 50,
// 	angle: -Math.PI / 2,
// })
// 	.addArms([
// 		new Arm({}, 200, null, { x: 200, y: MID_Y - 75 })
// 			.addWheels([
// 				new Wheel({
// 					position: {},
// 					r: 50,
// 					angle: -Math.PI/ 2,
// 					speed: 0.04,
// 				})
// 					.addArms([
// 						new Arm({}, 150, 0).addWheels([
// 							new Wheel({
// 								position: {},
// 								r: 100,
// 								angle: 0,
// 								speed: 0.04,
// 								yoyo: true,
// 							})
// 						]),
// 					])
// 			]),
// 	]);

const wheel = new Wheel({ position: { x: 100, y: MID_Y }, r: 80, angle: -Math.PI / 2, })
	.addArms([
		new Arm({ position: {}, length: 300, anchor: { x: 300, y: MID_Y - 10, } })
			.addWheels([
				new Wheel({ position: {}, r: 100, speed: -0.04, angle: -Math.PI / 4, yoyo: false, })
					.addArms([
						new Arm({ position: {}, length: 600, trombone: 0.5, anchor: { x: MID_X, y: MID_Y + 50 } }).addWheels([
							new Wheel({ position: {}, r: 50, yoyo: false }).addArms([
								new Arm({ position: {}, anchor: { x: 700, y: MID_Y - 100 }, length: 300 })
							])
						])
					]),
			]),
	]);


const loop = () => {
	ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

	ctxTrail.fillStyle = 'rgba(255, 255, 255, 0.005)';
	ctxTrail.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);

	wheel.update();
	wheel.draw(ctx, ctxTrail);

	requestAnimationFrame(loop);
};

loop();
