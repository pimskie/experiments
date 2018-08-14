// https://www.youtube.com/watch?v=5R9eywArFTE
// http://www.tylerlhobbs.com/writings/watercolor
// https://sighack.com/post/generative-watercolor-in-processing
// https://www.meredithdodge.com/2012/05/30/a-great-little-javascript-function-for-generating-random-gaussiannormalbell-curve-numbers/
// https://filosophy.org/code/normal-distributed-random-values-in-javascript-using-the-ziggurat-algorithm/
// https://p5js.org/reference/#/p5/randomGaussian

/**
 * Normal distribution:
 * very low probability the value will be far from mean
 * higher probability the value will be near the mean
 */

const mean = 1;
const sd = 2;

for (let i = 0; i < 20; i++) {

	console.log(randomGaussian(mean, sd));
}

const distanceBetween = (p1, p2) => Math.hypot(p1.x - p2.x, p1.y - p2.y);
const angleBetween = (p1, p2) => Math.atan2(p2.y - p1.y, p2.x - p1.x);
const randomBetween = (min, max) => (Math.random() * (max - min + 1)) + min;

const c = document.querySelector('.js-canvas');
const ctx = c.getContext('2d');

const W = 500;
const H = W;

const MID_X = W * 0.5;
const MID_Y = H * 0.5;

const EDGES = 12;
const TAU = Math.PI * 2;
const NINTY = Math.PI / 2; // lol
const ANGLE_STEP = TAU / EDGES;
const ANGLE_START = -NINTY;
const R = MID_X - 80;

const ANCHORS = [];
const ANCHORS_COMBINED = [];

const drawArc = (x, y, r = 3) => {
	ctx.beginPath();
	ctx.lineWidth = 1;

  ctx.arc(x, y, r, 0, TAU, false);
  ctx.stroke();
  ctx.closePath();
};

c.width = W;
c.height = H;

let anchorAngle = ANGLE_START;

ctx.beginPath();
ctx.lineWidth = 2;

for (let i = 0; i < EDGES + 1; i++) {
  const x = MID_X + Math.cos(anchorAngle) * R;
  const y = MID_Y + Math.sin(anchorAngle) * R;

  if (i === 0) {
    ctx.moveTo(x, y);
  } else {
    ctx.lineTo(x, y);
  }

  ANCHORS.push({ x, y });

  anchorAngle += ANGLE_STEP;
}

// ctx.stroke();
ctx.closePath();

const drawSegment = (from, to) => {
	const midX = (from.x + to.x) * 0.5;
	const midY = (from.y + to.y) * 0.5;

	const pointToX = midX + randomGaussian() * (R / 10)
	const pointToY = midY + randomGaussian() * (R / 10)

  drawArc(pointToX, pointToY);

  return { x: pointToX, y: pointToY };
};

const ANCHORS_EXTRA = [];

for (let i = 0; i < ANCHORS.length - 1; i++) {
  const from = ANCHORS[i];
  const to = ANCHORS[i + 1];

  const { x, y } = drawSegment(from, to);

  ANCHORS_EXTRA.push({ x, y });
}

ctx.beginPath();
ctx.strokeStyle = 'red';
ctx.fillStyle = 'rgba(255, 0, 0, 0.75)';
ctx.lineWidth = 1;

ctx.moveTo(ANCHORS[0].x, ANCHORS[0].y);
ctx.lineTo(ANCHORS_EXTRA[0].x, ANCHORS_EXTRA[0].y);

for (let i = 1; i < ANCHORS.length - 1; i++) {
  const p1 = ANCHORS[i];
  const p2 = ANCHORS_EXTRA[i];

  ctx.lineTo(p1.x, p1.y);
  ctx.lineTo(p2.x, p2.y);
}

ctx.lineTo(ANCHORS[0].x, ANCHORS[0].y);

ctx.stroke();
ctx.fill();
ctx.closePath();
