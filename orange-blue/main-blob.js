// https://math.stackexchange.com/questions/51539/a-math-function-that-draws-water-droplet-shape
// https://www.wolframalpha.com/input/?i=quadrifolium
// teardrop curve

const simplex = new SimplexNoise(Math.random());

const ctx = document.querySelector('.js-canvas').getContext('2d');
const { canvas } = ctx;

const w = window.innerWidth;
const h = window.innerHeight;
const cx = w >> 1;
const cy = h >> 1;

canvas.width = w;
canvas.height = h;

// #f6710d
// #0565c7
const orange = 24;
const blue = 220;

let phase = 0;

const numLeafs = 30;
const radiusStart = 5;
const radiusEnd = window.innerWidth * 0.25;
const radiusStep = (radiusEnd - radiusStart) / numLeafs;

const leafs = new Array(numLeafs).fill().map((_, i) => ({
	r: radiusEnd - (i * radiusStep),
	a: 0,
	pointCount: 150,
	color: i % 2 === 0 ? orange : blue,
}));

const drawLeaf = (ctx, leaf, index, depth, depthNormal) => {
	const angleStep = Math.PI * 2 / leaf.pointCount;
	const noiseScale = 0.3;
	const leafNoiseScale = noiseScale + (depth * 0.025);

	ctx.save();
	ctx.translate(ctx.canvas.width >> 1, ctx.canvas.height >> 1);
	ctx.beginPath();

	for (let i = 0; i < leaf.pointCount; i++) {
		const method = i === 0 ? 'moveTo' : 'lineTo';

		const angle = angleStep * i;
		const cos = Math.pow(Math.cos(angle), 1);
		const sin = Math.pow(Math.sin(angle), 1);
		const n = simplex.noise3D(cos * leafNoiseScale, sin * leafNoiseScale, phase);

		const radius = leaf.r + (n * leaf.r * 0.5);

		const x = cos * radius;
		const y = sin * radius;

		ctx[method](x, y);
	}

	const lightness = 50 + (50 * depthNormal);
	const fill = `hsl(${leaf.color}, 100%, ${lightness}%)`;
	ctx.fillStyle = fill;

	ctx.closePath();
	ctx.fill();
	ctx.restore();
};

const clear = () => {
	ctx.clearRect(0, 0, canvas.width, canvas.height);
};

const loop = () => {
	clear();

	leafs.forEach((leaf, index) => {
		const depthNormal = (leafs.length - index) / leafs.length;

		drawLeaf(ctx, leaf, index, leafs.length - index, depthNormal);
	});
	phase += 0.003;

	requestAnimationFrame(loop);
};


loop();
