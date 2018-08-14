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

// const distanceBetween = (p1, p2) => Math.hypot(p1.x - p2.x, p1.y - p2.y);
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
const R = MID_X - 100;

c.width = W;
c.height = H;

const subdivide = (new_points, x1, y1, x2, y2, depth, variance, vdiv) => {
	let midx, midy;
	let nx, ny;

	if (depth >= 0) {
		/* Find the midpoint of the two points comprising the edge */
		midx = (x1 + x2) / 2;
		midy = (y1 + y2) / 2;

		/* Move the midpoint by a Gaussian variance */
		nx = midx + randomGaussian() * variance;
		ny = midy + randomGaussian() * variance;

		/* Add two new edges which are recursively subdivided */
		subdivide(new_points, x1, y1, nx, ny, depth - 1, Math.random() * variance/vdiv, vdiv);
		new_points.push({x : nx, y: ny });
		subdivide(new_points, nx, ny, x2, y2, depth - 1, Math.random() * variance/vdiv, vdiv);
	}
}

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

const deformPoly = (vertices, depth, variance, vdiv) => {
	const new_points = [];

	for (let i = 0; i < vertices.length; i++) {
    sx1 = vertices[i].x;
    sy1 = vertices[i].y;
    sx2 = vertices[(i + 1) % vertices.length].x;
    sy2 = vertices[(i + 1) % vertices.length].y;

		new_points.push({
			x: sx1,
			y: sy1,
		});

    subdivide(new_points, sx1, sy1, sx2, sy2, depth, variance, vdiv);
	}

  return new_points;
};

const drawPoly = (ctx, vertices) => {
  const [firstVertex] = vertices;

	ctx.beginPath();
	ctx.fillStyle = 'rgba(255, 0, 0, 0.01)';
  ctx.moveTo(firstVertex.x, firstVertex.y);

  for (let i = 1; i < vertices.length; i++) {
    const vertex = vertices[i];
    ctx.lineTo(vertex.x, vertex.y);
  }

  ctx.lineTo(firstVertex.x, firstVertex.y);
  ctx.fill();
  ctx.closePath();
};

const varianceDefault = R / 5;
const polyDefault = getPoly(MID_X, MID_Y, R, EDGES);
const polyBase = deformPoly(polyDefault, 5, varianceDefault, 2);

drawPoly(ctx, polyBase);

const start = Date.now();

for (let i = 0; i < 80; i++) {
	const polyDeformed = deformPoly(polyBase, 5, varianceDefault + randomBetween(-10, 10), 4);

	console.log(polyDeformed.length)
	drawPoly(ctx, polyDeformed);
}

const end = Date.now();

console.log(end - start)
