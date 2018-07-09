// https://twitter.com/beesandbombs/status/1015021374572781578

// https://github.com/jaxgeller/ez.js/blob/master/ez.js
// t: current time, b: beginning value, c: change in value, d: duration.
const easeInOutSine = (t, b, c, d) => {
	return -c / 2 * (Math.cos(Math.PI * t / d) - 1) + b;
};

const tween = easeInOutSine;

const c = document.createElement('canvas');
const ctx = c.getContext('2d');

const PI2 = Math.PI * 2;

const w = 500;
const h = 500;
const r = w >> 1;
const midX = w >> 1;
const midY = h >> 1;

const hypo = Math.hypot(r, r);

c.width = w;
c.height = h;

document.body.appendChild(c);

const options = {
	numRings: 10,
	circlesOnRing: 20,
	circleRadius: 20,
	outlineWidth: 2,
	ringRadiusIncrease: 30,
	meta: false,
};

let rafId = null;

const ringRadius = 1;
let angleModifier = 0;

let maxRadius;
let rings;
let angleInc;
let phase = 0;

const clear = () => ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

const loop = () => {
	clear();

	let angle = 0;
	const circles = [];
	const duration = 0.5;

	for (let ringIndex = 0; ringIndex < rings.length; ringIndex++) {
		const ring = rings[ringIndex];

		for (let i = 0; i < options.circlesOnRing; i++) {
			const circleX = midX + (Math.cos(angle) * ring.r);
			const circleY = midY + (Math.sin(angle) * ring.r);

			const distance = Math.hypot(midX - circleX, midY - circleY);
			const percent = Math.min(distance / hypo, 1);

			const amplitude = 20 * percent;
			const ringPhase = phase + (ringIndex * duration);
			const mod = tween(ringPhase, 0, amplitude, duration);
			const circleR = (options.circleRadius * percent) + mod;

			// use fill for outline
			ctx.beginPath();
			ctx.fillStyle = '#fff';
			ctx.arc(circleX, circleY, circleR + options.outlineWidth, 0, PI2, false);
			ctx.fill();
			ctx.closePath();

			angle += angleInc;

			circles.push({ x: circleX, y: circleY, r: circleR });
		}

		if (options.meta) {
			for (let i = 0; i < circles.length; i++) {
				const { x, y, r } = circles[i];

				ctx.beginPath();
				ctx.fillStyle = '#000';
				ctx.arc(x, y, r, 0, PI2, false);
				ctx.fill();
				ctx.closePath();
			}
		}

		angle += (angleInc * 1.5);
		ring.r -= 0.5;

		if (ring.r <= 0) {
			ring.r = maxRadius;
		}
	}

	phase += 0.01;
	rafId = requestAnimationFrame(loop);
};

const init = () => {
	cancelAnimationFrame(rafId);

	options.numRings = Math.ceil(250 / (options.ringRadiusIncrease)) + 2;
	maxRadius = ringRadius + (options.ringRadiusIncrease * options.numRings);
	angleInc = PI2 / options.circlesOnRing;

	console.log(options.numRings);

	rings = rings = new Array(options.numRings).fill().map((_, i) => ({ r: (ringRadius + (i * options.ringRadiusIncrease)) }));

	loop();
};

const gui = new dat.GUI();
gui.add(options, 'circlesOnRing', 10, 30).step(1).onChange(init);
gui.add(options, 'circleRadius', 10, 30).step(1).onChange(init);
gui.add(options, 'ringRadiusIncrease', 10, 60).step(1).onChange(init);
gui.add(options, 'meta');
document.querySelector('.js-gui').appendChild(gui.domElement);


init();



