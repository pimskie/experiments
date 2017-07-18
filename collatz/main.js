/**
 * Collatz Conjecture in Color - Numberphile
 * https://www.youtube.com/watch?v=LqKpkdRRLZw
 *
 * http://mathematica.stackexchange.com/questions/85718/trying-to-visualize-the-collatz-conjecture
 * https://i.stack.imgur.com/70PEH.png
 * http://community.wolfram.com/groups/-/m/t/558256
 */

/**
 * Black: odd, up
 * Red: even, down
 */
/* global noise, Vector */
noise.seed(1);

const canvas = document.querySelector('.js-canvas');
const ctx = canvas.getContext('2d');
const PI = Math.PI;

const canvasWidth = 800;
const canvasHeight = 800;

let nodes = [];

const pos = new Vector(10, canvasHeight >> 1);
const vel = new Vector(1, 0);

const rootNode = {
	n: 16,
	isEven: true,
	pos,
	prevPos: pos,
	vel,
	width: 4,
	age: 0,
	maxAge: 0.5,
	depth: 1,
	turn: 0,
};


nodes.push(rootNode);

const createNode = (parentNode, n, straight) => {
	const isEven = n % 2 === 0;
	const depth = parentNode.depth + 1;
	const spread = depth * 1.5;
	const amp = straight ? 0 : spread * PI / 180;
	const angle = isEven ? amp : -amp;
	const maxAge = parentNode.maxAge * 0.95;
	const width = parentNode.width * 0.93;

	const pos = parentNode.pos.clone();
	const vel = parentNode.vel.clone();
	vel.angle += angle;
	vel.length /= 1.06;

	let turn = isEven ? 0.001 : -0.001;
	turn *= depth;

	const node = {
		n,
		isEven,
		pos,
		prevPos: pos,
		vel,
		width,
		age: 0,
		maxAge,
		depth,
		turn,
	};

	return node;
};

const updateNode = (node, diffAngle = 0) => {
	node.age += 0.01;
	node.vel.angle += diffAngle;
	node.vel.angle += node.turn;

	node.prevPos = node.pos.clone();
	node.pos.addSelf(node.vel);
};

const calculate = (node) => {
	const n = node.n;
	const mod6 = (n - 4) % 6 === 0;
	const odd = (n - 1) / 3;
	const even = n * 2;

	if (mod6) {
		return [createNode(node, odd), createNode(node, even)];
	} else {
		return [createNode(node, even, true)];
	}
};

const collatz = (n) => {
	const mod6 = (n - 4) % 6 === 0;
	const odd = (n - 1) / 3;
	const even = n * 2;

	console.log(mod6, odd, even);
};

const drawNode = (node) => {
	ctx.beginPath();
	ctx.lineCap = 'round';
	ctx.lineWidth = node.width;
	ctx.strokeStyle = node.isEven ? '#ff0000' : '#000';
	ctx.moveTo(node.prevPos.x, node.prevPos.y);
	ctx.lineTo(node.pos.x, node.pos.y);
	ctx.stroke();
	ctx.closePath();
};

const loop = () => {
	nodes.forEach((node) => {
		const mod = 0.01;
		const diffAngle = noise.perlin2(
			node.pos.x * mod,
			node.pos.y * mod
		) * 0.02;

		updateNode(node, 0);
		drawNode(node);

		if (node.age >= node.maxAge && nodes.length < 50) {
			const newNodes = calculate(node);
			nodes = nodes.concat(newNodes);
		}
	});

	nodes = nodes.filter(node => node.age < node.maxAge && node.width > 0.02);

	requestAnimationFrame(loop);
};


canvas.width = canvasWidth;
canvas.height = canvasHeight;

loop();