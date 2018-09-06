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

const wheel = new Wheel({ position: { x: 100, y: MID_Y }, r: 80, angle: 0, })
	.addArms([
		new Arm({ position: {}, length: 300, anchor: { x: 200, y: MID_Y + 150, } })
			.addWheels([
				new Wheel({ position: {}, r: 50, speed: -0.04, angle: Math.PI / 2, yoyo: false, })
					.addArms([
						new Arm({ position: {}, length: 800, trombone: 0.25, anchor: { x: MID_X + 100, y: MID_Y + 200 } }).addWheels([
							new Wheel({ position: {}, r: 50, yoyo: false }).addArms([
								new Arm({ position: {}, angle: -1.5, length: 300 }).addWheels([
									new Wheel({ position: {}, r: 100, speed: -0.04, angle: -Math.PI / 2, yoyo: false })
								])
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
