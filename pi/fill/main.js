import * as Utils from 'https://rawgit.com/pimskie/utils/master/utils.js';

const ctx = Utils.qs('canvas').getContext('2d');

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
const ANIM_DURATION = 100;
const SEGMENT_ANGLE = Math.PI * 2 / 10;

let iteration = 0;
let startTime = performance.now();

let decimal = 3;

let points = [];

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

	const fill = (trianglePoints) => {
		const [a, b, c] = trianglePoints;
		const avg = (a.decimal + b.decimal + c.decimal) / 3;
		const hue = 360 * (avg * 0.1);

		ctx.fillStyle = `hsla(${hue}, 100%, 60%, 0.1)`;
		ctx.strokeStyle = `hsla(${hue}, 100%, 50%, 0.3)`;
		ctx.beginPath();
		ctx.moveTo(a.position.x, a.position.y);
		ctx.lineTo(b.position.x, b.position.y);
		ctx.lineTo(c.position.x, c.position.y);
		ctx.closePath();
		ctx.stroke();
	}


	const loop = () => {
		ctx.globalCompositeOperation = 'destination-out';
		ctx.fillStyle = 'hsla(0, 0%, 100%, 0.005)';
		ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
		ctx.globalCompositeOperation = 'lighter';

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
			points.push({
				decimal,
				position: position.clone(),
			});

			startTime += ANIM_DURATION;
			iteration++;

			decimal = next(iteration);
		}

		if (points.length === 3) {
			fill(points);

			points = [];
		}

		requestAnimationFrame(loop);
	};

	decimal = next(iteration);
	loop();
})();
