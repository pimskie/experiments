import * as Utils from 'https://rawgit.com/pimskie/utils/master/utils.js';

const ctx = Utils.qs('canvas').getContext('2d');
const TAU = Math.PI * 2;

const W = 500;
const H = 500;
const MID_X = W * 0.5;
const MID_Y = H * 0.5;

ctx.canvas.width = W;
ctx.canvas.height = H;

(async () => {
	const DECIMALS = await fetch('https://api.pi.delivery/v1/pi?numberOfDigits=1000')
		.then(res => res.json())
		.then(res => res.content)
		.then(pi => pi.split('.')[1].split('').map(num => parseInt(num, 10)));


	const getDecimal = () => parseInt(DECIMALS.shift(), 10);
	const getAngle = decimal => TAU * (decimal * 0.1);
	const getDestination = angle => new Vector(
		MID_X + Math.cos(angle) * MID_X,
		MID_Y + Math.sin(angle) * MID_Y
	);

	const angle = getAngle(getDecimal());
	let destination = getDestination(angle);
	const particle = new Vector(MID_X, MID_Y);

	const velocity = new Vector();
	velocity.length = 4;
	velocity.angle = angle;

	const draw = () => {
		ctx.beginPath();

		ctx.moveTo(particle.x, particle.y);

		particle.addSelf(velocity);

		ctx.lineTo(particle.x, particle.y);

		ctx.stroke();
		ctx.closePath();
	};

	const loop = () => {
		draw();

		const distance = particle.subtract(destination).length;

		if (distance <= 2) {
			const decimal = getDecimal();
			console.log(decimal);

			const angleTo = getAngle(decimal);

			destination = getDestination(angleTo);
			velocity.angle = destination.subtract(particle).angle;
		}


		requestAnimationFrame(loop);
	};

	loop();

})();
