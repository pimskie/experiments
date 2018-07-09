// https://twitter.com/beesandbombs/status/1015021374572781578

// https://github.com/jaxgeller/ez.js/blob/master/ez.js
// t: current time, b: beginning value, c: change in value, d: duration.
const easeInOutSine = (t, b, c, d) => {
  return -c/2 * (Math.cos(Math.PI*t/d) - 1) + b;
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

const numRings = 10;
const numCirclesOnRing = 20;
const ringRadius = 10;
const circleRadius = 10;
const ringRadiusInc = 30;
const maxRadius = ringRadius + (ringRadiusInc * numRings);
const angleInc = PI2 / numCirclesOnRing;
const rings = new Array(numRings).fill().map((_, i) => ({ r: (ringRadius + (i * ringRadiusInc)) }));

let phase = 0;

const clear = () => ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

const loop = () => {
  clear();

	let angle = 0;
	const circles = [];

  for (let ringIndex = 0; ringIndex < rings.length; ringIndex++) {
    const ring = rings[ringIndex];

    for (let i = 0; i < numCirclesOnRing; i++) {
      const circleX = midX + (Math.cos(angle) * ring.r);
      const circleY = midY + (Math.sin(angle) * ring.r);

			const duration = 0.5;
			const distance = Math.hypot(midX - circleX, midY - circleY);
			const percent = Math.min(distance / hypo, 1);

			const amplitude = 20 * percent;
			const ringPhase = phase + (ringIndex * duration);
			const mod = tween(ringPhase, 0, amplitude, duration);
			const circleR = (20 * percent) + mod;

			const outlineWidth = 2; // 3 * percent;

			// use fill for outline
			ctx.beginPath();
			ctx.fillStyle = '#000';
      ctx.arc(circleX, circleY, circleR + outlineWidth, 0, PI2, false);
      ctx.fill();
      ctx.closePath();

			angle += angleInc;

			circles.push({ x: circleX, y: circleY, r: circleR });
		}

		// // draw all circles again for fill
		// for (let i = 0; i < circles.length; i++) {
		// 	const { x, y, r } = circles[i];

		// 	ctx.beginPath();
		// 	ctx.fillStyle = '#fff';
		// 	ctx.arc(x, y, r, 0, PI2, false);
		// 	ctx.fill();
		// 	ctx.closePath();
		// }

		angle += (angleInc * 1.5);
		ring.r -= 0.5;

    if (ring.r <= 0) {
      ring.r = maxRadius;
    }
	}

  phase += 0.01;

  requestAnimationFrame(loop);
};


loop();
