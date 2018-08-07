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
let circles;
let angleInc;
let phase = 0;

const clear = () => ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

const loop = () => {
	clear();

	for (let i = 0; i < circles.length; i++) {
		const { x, y, r, angle } = circles[i];

		ctx.save();
		ctx.translate(midX, midY);

		ctx.beginPath();
		ctx.strokeStyle = '#fff';
		ctx.arc(x, y, r, 0, PI2, false);
		ctx.stroke();
		ctx.fill();
		ctx.closePath();
		ctx.restore();
	}

	phase += 0.01;
	rafId = requestAnimationFrame(loop);
};

const init = () => {
	cancelAnimationFrame(rafId);

	let ringRadius = 10;
	const numRings = 10;
	const ringRadiusInc = 30;

	let angle = 0;
	const numCirclesOnRing = 10;
	const angleInc = PI2 / numCirclesOnRing;

	circles = [];

	maxRadius = ringRadius + (options.ringRadiusIncrease * options.numRings);

	for (let i = 0; i < numRings; i++) {
		for (let q = 0; q < numCirclesOnRing; q++) {
			const x = Math.cos(angle) * ringRadius;
			const y = Math.sin(angle) * ringRadius;
			const r = 20;
			const distance = Math.hypot(x, y);
			const p = distance / 250;
			const circle = { x, y, r: r * p, p, angle };

			circles.push(circle);

			angle += angleInc;

			const delay = i * 0.1;

			TweenMax.to(circle, 0.5, {
				r: circle.r + 10,
				delay,
				repeatDelay: 0.5,
				yoyo: true,
				repeat: -1,
				ease: Cubic.easeInOut,
			});
		}

		ringRadius += ringRadiusInc;

		angle += (angleInc * 1.5);
	}


	loop();
};

const gui = new dat.GUI();
gui.add(options, 'circlesOnRing', 10, 30).step(1).onChange(init);
gui.add(options, 'circleRadius', 10, 30).step(1).onChange(init);
gui.add(options, 'ringRadiusIncrease', 10, 60).step(1).onChange(init);
gui.add(options, 'meta');
document.querySelector('.js-gui').appendChild(gui.domElement);


init();



