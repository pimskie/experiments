import * as Utils from 'https://rawgit.com/pimskie/utils/master/utils.js';

const canvas = Utils.qs('canvas');
const ctx = canvas.getContext('2d');

ctx.globalCompositeOperation = 'lighter';

const W = 500;
const H = 500;
const MID_X = W * 0.5;
const MID_Y = H * 0.5;
const RADIUS = MID_X - 25;

ctx.canvas.width = W;
ctx.canvas.height = H;

const ANIM_DURATION = 7000;

let phase = 0;
let startTime = performance.now();

const minimumPoints = 4;
const maxPoints = 10;
const angleStepMinumum = Math.PI * 2 / minimumPoints;
const angleStep = Math.PI * 2 / maxPoints;
const angleStepDiff = angleStep - angleStepMinumum;

//https://gist.github.com/gre/1650294
const easeInOutCubic = t => t < .5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1;

(() => {
	const loop = () => {
		ctx.fillStyle = 'rgba(255, 255, 255, 1)';
		ctx.fillRect(0, 0, W, H);

		const now = performance.now();

		const percent = Utils.map(Math.sin(phase) * 100, -100, 100, 0, 1);
		const radiusModifier = Utils.map(Math.cos(phase) * 100, -100, 100, -25, 25);

		const points = new Array(maxPoints).fill().map((_, i) => {
			let angle = (i * angleStepMinumum + (angleStepDiff * i * percent)) % (Math.PI * 2);

			const x = MID_X + Math.cos(angle) * (RADIUS + radiusModifier);
			const y = MID_Y + Math.sin(angle) * (RADIUS + radiusModifier);

			return { x, y, angle };
		}).sort((a, b) => a.angle > b.angle ? 1 : a.angle < b.angle ? -1 : 0);

		ctx.beginPath();

		points.forEach((point, i) => {
			const { x, y } = point;

			if (i === 0) {
				ctx.moveTo(x, y);
			} else {
				ctx.lineTo(x, y);
			}
		});

		ctx.closePath();
		ctx.stroke();

		points.forEach((point, i) => {
			const { x, y } = point;

			ctx.beginPath();
			ctx.fillStyle = '#000';
			ctx.arc(x, y, 2, 0, Math.PI * 2, false);
			ctx.fill();
			ctx.closePath();
		});


		if (now - startTime >= ANIM_DURATION) {
			startTime += ANIM_DURATION;
		}

		phase += 0.01;
		requestAnimationFrame(loop);
	};

	loop();
})();

const onPointerMove = (e) => {
	const event = (e.touches && e.touches.length) ? e.touches[0] : e;
	const { clientX, clientY } = event;

	const x = clientX - e.target.offsetLeft;
	const y = clientY - e.target.offsetTop;

	const percentX = x / canvas.width;
	const percentY = y / canvas.height;
};

canvas.addEventListener('mousemove', onPointerMove);
canvas.addEventListener('touchmove', onPointerMove);
