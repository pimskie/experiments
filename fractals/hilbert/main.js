// https://en.wikipedia.org/wiki/L-system#Example_6:_Dragon_curve

/**
 * Add:
 * http://www.let.rug.nl/~kleiweg/lsystem/lsystem.html
 * gosper curve
 * trees, branches
 * https://www.csh.rit.edu/~aidan/portfolio/3DLSystems.shtml
 * A,A-B--B+A++AA+B-,B,+A-BB--B-A++A+B
 *
 * push / pop example:
 * http://weblog.jamisbuck.org/2015/5/7/experimenting-with-l-systems.html
 *
 * http://www.math.umassd.edu/~ahausknecht/aohWebsiteSpring2017/examples/HTML5Examples/LSystemProjectV1/LSystem.html
 */

/* globals TweenMax: false , performance: false */

const qs = (sel) => document.querySelector(sel);

const toRadian = Math.PI / 180;

const canvas = qs('canvas');
const ctx = canvas.getContext('2d');

const width = window.innerWidth;
const height = window.innerHeight;

canvas.width = width;
canvas.height = height;

const maxDepth = 5;
let currentDepth = 0;
let currentAngle = 0;
let currentIndex = 0;
let currentCurve = [];

const hilbert = {
	axiom: 'A',
	result: 'A',
	variables: ['A', 'B'],
	rules: {
		'A': '-BF+AFA+FB-',
		'B': '+AF-BFB-FA+',
	},
	length: 4,
	angle: 90 * toRadian,
	startX: 0,
	startY: 0,
};

const koch = {
	axiom: 'F',
	result: 'F',
	rules: {
		'F': 'F+F-F-F+F',
	},
	length: 4,
	angle: 90 * toRadian,
	startX: 0,
	startY: height,
};

const kochSnowflake = {
	axiom: 'F++F++F',
	result: 'F',
	rules: {
		'F': 'F-F++F-F',
	},
	length: 0.5,
	angle: 60 * toRadian,
	startX: width * 0.25,
	startY: height * 0.5,
};

const sierpinski = {
	axiom: 'F-G-G',
	result: 'F-G-G',
	rules: {
		'F': 'F-G+F+G-F',
		'G': 'GG',
	},
	length: 5,
	angle: 120 * toRadian,
	startX: 0,
	startY: 0,
};

const sierpinskiArrowHead = {
	axiom: 'A',
	result: 'A',
	rules: {
		'A': '+B-A-B+',
		'B': '-A+B+A-',
	},
	length: 5,
	angle: 60 * toRadian,
	startX: 0,
	startY: height,
};

const levy = {
	axiom: 'F',
	result: 'F',
	rules: {
		'F': '+F--F+',
	},
	length: 20,
	angle: -45 * toRadian,
	startX: width * 0.25,
	startY: 0,
};

const tree = {
	axiom: 'X',
	result: 'X',
	rules: {
		'X': 'F-[[X]+X]+F[+FX]-X',
		'F': 'FF',
	},
	length: 5,
	angle: -25 * toRadian,
	startAngle: -90 * toRadian,
	startX: width * 0.25,
	startY: height,
	stack: [],
};

const tree2 = {
	axiom: 'X',
	result: 'X',
	rules: {
		'X': 'F[+X][-X]FX',
		'F': 'FF',
	},
	length: 5,
	angle: -25.7 * toRadian,
	startAngle: -90 * toRadian,
	startX: width * 0.25,
	startY: height,
	maxDepth: 7,
	stack: [],
};

const gosper = {
	axiom: 'A',
	result: 'A',
	rules: {
		'A': 'A-B--B+A++AA+B-',
		'B': '+A-BB--B-A++A+B',
	},
	length: 5,
	startAngle: 0,
	angle: 60 * toRadian,
	startX: width * 0.5,
	startY: 0,
	maxDepth: 7,
	stack: [],
};

const presets = {
	hilbert,
	koch,
	kochSnowflake,
	sierpinski,
	sierpinskiArrowHead,
	levy,
	tree,
	tree2,
	gosper,
};

let x = 0;
let y = 0;

const clear = () => {
	ctx.clearRect(0, 0, width, height);
};

const adjustAngle = (curve, plusMinus) => {
	if (plusMinus === '+') {
		currentAngle -= curve.angle;
	} else {
		currentAngle += curve.angle;
	}
};

const stackPush = (curve) => {
	curve.stack.push([x, y, currentAngle]);
};

const stackPop = (curve) => {
	[x, y, currentAngle] = curve.stack.pop();
};

const drawLine = (curve) => {
	const nextX = x + (Math.cos(currentAngle) * curve.length);
	const nextY = y + (Math.sin(currentAngle) * curve.length);

	ctx.beginPath();
	ctx.moveTo(x, y);
	ctx.lineTo(nextX, nextY);
	ctx.stroke();
	ctx.closePath();

	x = nextX;
	y = nextY;
};

// used for animation
const drawAnimatedLine = (curve, curvePathArray) => {
	const startX = x;
	const startY = y;

	const nextX = x + (Math.cos(currentAngle) * curve.length);
	const nextY = y + (Math.sin(currentAngle) * curve.length);

	const line = { x, y, nextX, nextY };

	ctx.save();

	TweenMax.to(line, 0.01, {
		x: line.nextX,
		y: line.nextY,

		onUpdate() {
			ctx.beginPath();
			ctx.moveTo(startX, startY);
			ctx.lineTo(line.x, line.y);
			ctx.stroke();
			ctx.closePath();
		},

		onComplete() {
			x = nextX;
			y = nextY;
			iterateCurve(curve, curvePathArray);
		},
	});

	ctx.restore();
};

const drawCurve = (curve) => {
	clear();

	const pattern = (curve.variables || []).join('|');
	const regex = new RegExp(pattern, 'g');
	const lSystemString = curve.result.replace(regex, '');

	currentCurve = lSystemString.split('');

	// animated
	// iterateCurve(curve, currentCurve);

	// at once
	currentCurve.forEach((instruction) => {
		const method = map[instruction] || drawLine;
		method(curve, instruction);
	});
};

// used for animation
const iterateCurve = (curve, curvePathArray) => {
	if (currentIndex >= curvePathArray.length) {
		return;
	}

	const currentStep = curvePathArray[currentIndex];

	if (map[currentStep]) {
		map[currentStep](curve, currentStep);
		currentIndex++;

		iterateCurve(curve, curvePathArray);

	} else {
		currentIndex++;
		drawAnimatedLine(curve, curvePathArray);
	}
};

const reset = (curve) => {
	TweenMax.killAll();

	x = curve.startX;
	y = curve.startY;

	currentAngle = curve.startAngle || 0;
	currentDepth = 0;
	currentIndex = 0;

	curve.result = curve.axiom;
	curve.stack = [];
};

const generate = (curve) => {
	reset(curve);

	const then = performance.now();

	while (currentDepth < maxDepth) {
		const pattern = Object.keys(curve.rules).join('|');
		const regex = new RegExp(pattern, 'g');

		curve.result = curve.result.replace(regex, match => curve.rules[match]);

		currentDepth++;
	}

	const now = performance.now();
	const time = now - then;

	console.log(`done in ${time.toPrecision(3)}ms`);

	drawCurve(curve);
};

const map = {
	'+': adjustAngle,
	'-': adjustAngle,
	'[': stackPush,
	']': stackPop,
};

const presetSelect = qs('.js-curve');

presetSelect.addEventListener('change', (e) => {
	generate(presets[e.target.value]);
});

generate(presets[presetSelect.value]);
