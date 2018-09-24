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
		.then(pi => pi.split('.')[1].split('').map(num => parseInt(num, 10)))


	const getDecimal = () => parseInt(DECIMALS.shift(), 10);
	const getAngle = decimal => TAU * (decimal * 0.1);

	let fromValue = 0;
	let toValue = getDecimal();

	let startTime = performance.now();
	let duration = 100;
	let hue = 0;

	const particle = new Vector(MID_X, MID_Y);
	const velocity = new Vector();
	velocity.angle = 0;

	const draw = () => {
		const changeInValue = toValue - fromValue;
		const percent = (performance.now() - startTime) / duration;
		const newValue = fromValue + (changeInValue * percent);

		const radians = getAngle(newValue);
		const degrees = radians * 180 / Math.PI;

		hue += (degrees - hue) / 100;

		ctx.beginPath();
		ctx.strokeStyle = `hsla(${hue}, 100%, 0%, 1)`;
		ctx.lineWidth = 1;
		ctx.moveTo(particle.x, particle.y);

		velocity.angle = radians;
		velocity.length = Utils.clamp(Math.abs(changeInValue), 0.5, 3);

		particle.addSelf(velocity);

		ctx.lineTo(particle.x, particle.y);
		ctx.stroke();
		ctx.closePath();

		if (percent >= 1) {
			startTime = performance.now();

			fromValue = toValue;
			toValue = getDecimal();
		}

		Utils.wrappBBox(particle, W, H);
	};

	const loop = () => {
		draw();
		draw();

		requestAnimationFrame(loop);
	};

	loop();

})();
