const q = (sel) => document.querySelector(sel);

const canvas = q('canvas');
const ctx = canvas.getContext('2d');
const PI2 = Math.PI * 2;

const width = 500;
const height = 500;
const midX = width * 0.5;
const midY = height * 0.5;

canvas.width = width;
canvas.height = height;

const shapes = [];
const defaultR = 30;

// http://paulbourke.net/fractals/randomtile/statistical_geometry_examples.pdf
// c=1.28, N=2
const C = 1.01;
const N = 1.2;
const COUNT = 100;
const TOTAL_A = midX;

const addCircle = (x, y, r) => {
	ctx.save();
	ctx.translate(x, y);
	ctx.beginPath();
	ctx.arc(0, 0, r, 0, PI2, false);
	// ctx.stroke();
	ctx.closePath();

	ctx.restore();

	shapes.push({ x, y, r });
};

addCircle(midX, midY, defaultR);

const numLoops = 6;

const hurwitzZeta = (s, q, iteration) => {
	return 1 / Math.pow((q + iteration), s);
};

// http://paulbourke.net/fractals/randomtile/statistical_geometry_examples.pdf
for (let i = 1; i < numLoops; i++) {
	const newR = TOTAL_A * Math.pow(i ,-C);

	console.log(newR);

	addCircle(midX, midY, newR);

	// const newR = defaultR / (previousR * );
	// A1 = A / func(C, N) * pow((i - 1 + N), c)
}


// const clear = () => {
// 	ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
// };

// const loop = () => {
// 	clear();

// 	// requestAnimationFrame(loop);
// };

// loop();
