import * as Utils from 'https://rawgit.com/pimskie/utils/master/utils.js';

const ctx = Utils.qs('canvas').getContext('2d');

ctx.globalCompositeOperation = 'lighter';

const W = 500;
const H = 500;
const MID_X = W * 0.5;
const MID_Y = H * 0.5;

ctx.canvas.width = W;
ctx.canvas.height = H;

let position = new Vector(MID_X, MID_Y);

let from = {};
let to = {};
let distance = {};

const NUM_DECIMALS = 500;
const ANIM_DURATION = 250;
const SEGMENT_ANGLE = Math.PI * 2 / 10;

let iteration = 0;
let startTime = performance.now();

let decimal = 3;

//https://gist.github.com/gre/1650294
const easeInOutCubic = t => t < .5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1;

const getDecimal = (decimalArr) => parseInt(decimalArr.shift(), 10);
const getAngle = decimal => Math.PI * 2 * (decimal * 0.1);

(async () => {
	const DECIMALS = await fetch(`https://api.pi.delivery/v1/pi?numberOfDigits=${NUM_DECIMALS}`)
		.then(res => res.json())
		.then(res => res.content)
		.then(pi => pi.split('.')[1].split('').map(num => parseInt(num, 10)));

	const next = (i) => {
		const progress = i / NUM_DECIMALS;

		const decimal = getDecimal(DECIMALS);
		const decimalAngle = getAngle(decimal);
		const angle = (decimalAngle - (SEGMENT_ANGLE / 2)) + (SEGMENT_ANGLE * progress);

		from = position.clone();

		to = new Vector(
			MID_X + Math.cos(angle) * MID_X,
			MID_Y + Math.sin(angle) * MID_Y
		);

		distance = to.subtract(from);

		return decimal;
	};

	const loop = () => {
		ctx.fillStyle = 'rgba(0, 0, 0, 0.01)';
		ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);

		const now = performance.now();
		const percent = easeInOutCubic((now - startTime) / ANIM_DURATION);
		const hue = 180 * (decimal * 0.1);

		ctx.beginPath();
		ctx.strokeStyle = `hsl(${hue}, 100%, 70%)`;
		ctx.moveTo(position.x, position.y);

		position.x = from.x + (distance.x * percent);
		position.y = from.y + (distance.y * percent);

		ctx.lineTo(position.x, position.y);
		ctx.stroke();
		ctx.closePath();

		if (now - startTime >= ANIM_DURATION) {
			startTime += ANIM_DURATION;
			iteration++;

			decimal = next(iteration);
		}

		requestAnimationFrame(loop);
	};

	decimal = next(iteration);
	loop();
})();
