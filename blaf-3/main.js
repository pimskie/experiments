// import * as Utils from 'https://rawgit.com/pimskie/utils/master/utils.js';

// t: current time, b: beginning value, c: change in value, d: duration
const easeOutQuad = (t, b, c, d) => -c * (t /= d) * (t - 2) + b;

const easeInOutQuad = (t, b, c, d) => {
	if ((t /= d / 2) < 1) return c / 2 * t * t + b;
	return -c / 2 * ((--t) * (t - 2) - 1) + b;
}

const easeOutSine = (t, b, c, d) => {
	return c * Math.sin(t / d * (Math.PI / 2)) + b;
}

const ctx = document.querySelector('canvas').getContext('2d');
const PI = Math.PI;
const TAU = PI * 2;

const W = 500;
const H = 500;
const MID_X = W * 0.5;
const MID_Y = H * 0.5;

ctx.canvas.width = W;
ctx.canvas.height = H;

let time = 0;
const speed = 0.05;

const lines = [
	{
		start: { x: MID_X, y: MID_Y },
		end: {},
		angle: -PI / 2,
		length: 0,
		lengthEnd: 100,
		alive: true,
		time,
		duration: 1,
	},
];

const drawLine = (line) => {
	line.end.x = line.alive ? line.start.x + Math.cos(line.angle) * line.length : line.end.x;
	line.end.y = line.alive ? line.start.y + Math.sin(line.angle) * line.length : line.end.y;

	ctx.beginPath();
	ctx.moveTo(line.start.x, line.start.y);
	ctx.lineTo(line.end.x, line.end.y);
	ctx.stroke();
	ctx.closePath();
};

const clear = () => {
	ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
};

const easing = easeOutSine;

const loop = () => {
	clear();

	lines.forEach((line) => {
		drawLine(line);

		if (line.time <= line.duration) {
			line.length = easing(line.time, 0, line.lengthEnd - line.length, line.duration);
			line.time += speed;

		} else if (line.alive) {
			line.alive = false;


			if (lines.length >= 1500) {
				return;
			}

			const angleDiff = PI / 2;
			const newEndLength = line.lengthEnd * 1;

			lines.push({
				start: line.end,
				end: {},
				angle: line.angle -angleDiff,
				length: 0,
				lengthEnd: newEndLength,
				alive: true,
				time: 0,
				duration: 1,
			});

			lines.push({
				start: line.end,
				end: {},
				angle: line.angle +angleDiff,
				length: 0,
				lengthEnd: newEndLength,
				alive: true,
				time: 0,
				duration: 1,
			});
		}
	});


	requestAnimationFrame(loop);
};

loop();
