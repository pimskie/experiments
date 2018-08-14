// https://www.youtube.com/watch?v=5R9eywArFTE
// http://www.tylerlhobbs.com/writings/watercolor
// https://sighack.com/post/generative-watercolor-in-processing
// https://www.meredithdodge.com/2012/05/30/a-great-little-javascript-function-for-generating-random-gaussiannormalbell-curve-numbers/
// https://filosophy.org/code/normal-distributed-random-values-in-javascript-using-the-ziggurat-algorithm/
// https://p5js.org/reference/#/p5/randomGaussian

// https://p5js.org/reference/#/p5/randomGaussian
// https://github.com/processing/p5.js/blob/master/src/math/random.js#L166
const randomGaussian = (mean = 0, sd = 1) => {
  let y1;
  let x1;
  let x2
  let w;
  let previous;

  if (previous) {
    y1 = y2;
    previous = false;
  } else {
    do {
      x1 = (Math.random() * 2) - 1;
      x2 = (Math.random() * 2) - 1;
      w = x1 * x1 + x2 * x2;
    } while (w >= 1);
    w = Math.sqrt(-2 * Math.log(w) / w);
    y1 = x1 * w;
    y2 = x2 * w;
    previous = true;
  }

  return y1 * sd + mean;
};

const randomArrayValue = arr => arr[Math.floor(Math.random() * arr.length)];
const angleBetween = (p1, p2) => Math.atan2(p2.y - p1.y, p2.x - p1.x);
const randomBetween = (min, max) => (Math.random() * (max - min + 1)) + min;

const c = document.querySelector('.js-canvas');
const ctx = c.getContext('2d');

const W = window.innerWidth;
const H = window.innerHeight;

const MID_X = W * 0.5;
const MID_Y = H * 0.5;

const EDGES = 12;
const TAU = Math.PI * 2;
const R = Math.min(Math.min(MID_X, MID_Y) * 0.5, 150);

const ALPHA = 0.006;
const COLORS = [
	`hsla(330, 100%, 50%, ${ALPHA})`,
	`hsla(210, 100%, 50%, ${ALPHA})`,
	`hsla(140, 100%, 50%, ${ALPHA})`,
];

c.width = W;
c.height = H;

const getPoly = (midX, midY, r, edges) => {
  const vertices = [];
  const angleStep = TAU / edges;

  for (let angle = 0; angle < TAU; angle += angleStep) {
    const x = midX + Math.cos(angle) * r;
    const y = midY + Math.sin(angle) * r;

    vertices.push({ x, y });
  }

  return vertices;
};

const deformPoly = (vertices, depth, variance, varianceDecrease) => {
  let deformedVertices = [];

  for (let i = 0; i < vertices.length; i++) {
    const from = vertices[i];
    const to = i === vertices.length - 1 ? vertices[0] : vertices[i + 1];

    const midX = (from.x + to.x) * 0.5;
    const midY = (from.y + to.y) * 0.5;
    const angle = angleBetween(
      { x: 0, y: 0 },
      { x: midX, y: midY },
    );

    const newX = midX + randomGaussian() * variance;
    const newY = midY + randomGaussian() * variance;

    deformedVertices.push(from);
    deformedVertices.push({ x: newX, y: newY });
  }

  if (depth > 0) {
    depth--;

    return deformPoly(deformedVertices, depth, variance / varianceDecrease, varianceDecrease);
  }

  return deformedVertices;
};

const VARIANCE_DEFAULT = R / 15;
const NUM_POLIES = 100;
const NUM_SPOTS = 3;
const DEPTH = 5;
const DISPLACEMENT = 75;

const stacklist = new Array(NUM_SPOTS).fill().map((_, i) => {
	const poly = getPoly(
		randomBetween(-DISPLACEMENT, DISPLACEMENT),
		randomBetween(-DISPLACEMENT, DISPLACEMENT),
		R + randomBetween(-15, 15),
		EDGES
	);
	const polyDeformed = deformPoly(poly, DEPTH, VARIANCE_DEFAULT, 2);
	const stack = new Array(NUM_POLIES).fill().map((_, i) => deformPoly(polyDeformed, DEPTH, VARIANCE_DEFAULT + randomBetween(5, 15), 4));

	return stack;
});

let layer = 0;
const interleave = 5;

const drawSpot = (vertex, r, color) => {
	ctx.beginPath();
	ctx.fillStyle = color;
	ctx.arc(vertex.x, vertex.y, r, 0, TAU, false);
	ctx.fill();
	ctx.closePath();
};

const drawPoly = (vertices, color) => {
  const [firstVertex] = vertices;

  ctx.beginPath();
  ctx.fillStyle = color;
  ctx.moveTo(firstVertex.x, firstVertex.y);

  for (let i = 1; i < vertices.length; i++) {
    const vertex = vertices[i];
    ctx.lineTo(vertex.x, vertex.y);
  }

  ctx.lineTo(firstVertex.x, firstVertex.y);
  ctx.fill();
  ctx.closePath();
};

const drawLayer = (stack, stackIndex, layerStartIndex, layerEndIndex, color) => {
	ctx.save();
	ctx.translate(MID_X, MID_Y);
  ctx.rotate((Math.PI / 2) * stackIndex);

  for (let i = layerStartIndex; i < layerEndIndex; i++) {
    drawPoly(stack[i], color);
	}

	if (Math.round(Math.random() * 10) === 0) {
		const polyIndex = layerStartIndex;

		const poly = stack[polyIndex];
		const vertex = randomArrayValue(poly);
		const r = randomBetween(2, 6);

		drawSpot(vertex, r, color);
	}

  ctx.restore();
};

const drawStackList = (stacklist, colors, interleave) => {
  stacklist.forEach((stack, stackIndex) => {
    for (let i = layer; i < layer + interleave; i++) {
      const to = Math.min(layer + interleave, NUM_POLIES - 2);

      drawLayer(stack, stackIndex, i, to, colors[stackIndex]);
    }
  });

  layer += interleave;

  if (layer < NUM_POLIES) {
    requestAnimationFrame(() => {
      drawStackList(stacklist, colors, interleave);
    });
  }
};

drawStackList(stacklist, COLORS, interleave);
