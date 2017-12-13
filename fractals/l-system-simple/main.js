const qs = (sel) => document.querySelector(sel);

const toRadian = Math.PI / 180;

const canvas = qs('canvas');
const ctx = canvas.getContext('2d');

const width = window.innerWidth;
const height = window.innerHeight;

canvas.width = width;
canvas.height = height;

const maxDepth = 6;
const defaultScale = 10;
let curveScale = defaultScale;

let dimensions = {
	minX: null,
	maxX: null,
	minY: null,
	maxY: null,
};

let currentDepth = 0;
let currentAngle = 0;

const hilbert = {
	axiom: 'A',
	result: 'A',
	variables: ['A', 'B'],
	rules: {
		'A': '-BF+AFA+FB-',
		'B': '+AF-BFB-FA+',
	},
	angle: 90 * toRadian,
};

const koch = {
	axiom: 'F',
	result: 'F',
	rules: {
		'F': 'F+F-F-F+F',
	},
	angle: 90 * toRadian,
};

const kochSnowflake = {
	axiom: 'F++F++F',
	result: 'F',
	rules: {
		'F': 'F-F++F-F',
	},
	angle: 60 * toRadian,
};

const sierpinski = {
	axiom: 'F-G-G',
	result: 'F-G-G',
	rules: {
		'F': 'F-G+F+G-F',
		'G': 'GG',
	},
	angle: 120 * toRadian,
};

const sierpinskiArrowHead = {
	axiom: 'A',
	result: 'A',
	rules: {
		'A': '+B-A-B+',
		'B': '-A+B+A-',
	},
	angle: 60 * toRadian,
	maxDepth: 8,
};

const levy = {
	axiom: 'F',
	result: 'F',
	rules: {
		'F': '+F--F+',
	},
	angle: -45 * toRadian,
	maxDepth: 15,
};

const tree = {
	axiom: 'X',
	result: 'X',
	rules: {
		'X': 'F-[[X]+X]+F[+FX]-X',
		'F': 'FF',
	},
	angle: -25 * toRadian,
	startAngle: -90 * toRadian,
	stack: [],
};

const tree2 = {
	axiom: 'X',
	result: 'X',
	rules: {
		'X': 'F[+X][-X]FX',
		'F': 'FF',
	},
	angle: -25.7 * toRadian,
	startAngle: -90 * toRadian,
	stack: [],
};

const peanoGosper = {
	axiom: 'A',
	result: 'A',
	rules: {
		'A': 'A-B--B+A++AA+B-',
		'B': '+A-BB--B-A++A+B',
	},
	startAngle: 0,
	angle: 60 * toRadian,
	stack: [],
	maxDepth: 5,
};

const peano = {
	axiom: 'F',
	result: 'F',
	rules: {
		'F': 'F+F-F-F-F+F+F+F-F',
	},
	maxDepth: 4,
	angle: 90 * toRadian,
	stack: [],
};


const dragon = {
	axiom: 'FX',
	result: 'FX',
	variables: ['X', 'Y'],
	rules: {
		'X': 'X+YF+',
		'Y': '-DX-Y',
	},
	angle: 90 * toRadian,
	stack: [],
	maxDepth: 15,
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
	peanoGosper,
	peano,
	dragon,
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

const drawLine = (curve, instruction, runForDimensions = true) => {
	const nextX = x + (Math.cos(currentAngle) * curveScale);
	const nextY = y + (Math.sin(currentAngle) * curveScale);

	if (!runForDimensions) {
		ctx.beginPath();

		ctx.moveTo(x, y);
		ctx.lineTo(nextX, nextY);
		ctx.stroke();
		ctx.closePath();
	}

	x = nextX;
	y = nextY;

	if (runForDimensions) {
		if (!dimensions.minX || x < dimensions.minX) {
			dimensions.minX = x;
		}

		if (!dimensions.maxX || x > dimensions.maxX) {
			dimensions.maxX = x;
		}

		if (!dimensions.minY || y < dimensions.minY) {
			dimensions.minY = y;
		}

		if (!dimensions.maxY || y > dimensions.maxY) {
			dimensions.maxY = y;
		}
	}
};

/**
 * Draws a curve, sort of..
 *
 * Used in two ways:
 * first to draw the pattern with a default line length, and get the dimensions
 * This run isn't painted on the canvas. - runForDimensions = true
 *
 * Second, draw and paint the pattern. But with the dimensions of the first run,
 * scaling and positioning is applied so it fits the screen. - runForDimensions = false
 */
const drawCurve = (curve, runForDimensions = false) => {
	clear();

	x = 0;
	y = 0;

	currentAngle = curve.startAngle || 0;
	currentDepth = 0;

	curve.stack = [];

	// remove the variables from the result string, they aren't needed anymore
	const variablesPattern = (curve.variables || []).join('|');
	const regex = new RegExp(variablesPattern, 'g');
	const lSystemString = curve.result.replace(regex, '');

	// by splitting the filtered string, we have a list of instructions (turn left, turn right, draw, etc)
	const curveInstructions = lSystemString.split('');

	// TODO: make this better, clearer
	if (!runForDimensions) {
		const w = (Math.abs(dimensions.minX) + dimensions.maxX) / (defaultScale / curveScale);
		const h = (Math.abs(dimensions.minY) + dimensions.maxY) / (defaultScale / curveScale);

		const offsetX = (Math.abs(dimensions.minX) / (defaultScale / curveScale)) + (width * 0.5) - (w * 0.5);
		const offsetY = (-dimensions.minY / (defaultScale / curveScale)) + (height * 0.5) - (h * 0.5);

		ctx.save();
		ctx.translate(offsetX, offsetY);
	}

	curveInstructions.forEach((instruction) => {
		const method = map[instruction] || drawLine;
		method(curve, instruction, runForDimensions);
	});

	if (!runForDimensions) {
		ctx.restore();
	}
};

const reset = (curve) => {
	x = 0;
	y = 0;

	dimensions = {
		minX: null,
		maxX: null,
		minY: null,
		maxY: null,
	};

	currentAngle = curve.startAngle || 0;
	currentDepth = 0;
	curveScale = defaultScale;

	curve.stack = [];
	curve.result = curve.axiom;
};

const generate = (curve) => {
	reset(curve);

	const maxLoops = curve.maxDepth || maxDepth;

	/**
	 * this is the core, the most  important part
	 * within every loop, the alphabeth chararcter (A, B, X, F, etc) gets replaced by their rule
	 *
	 * Since the rule contains one or more alphabeth characters, the product gets longer and longer
	 */
	while (currentDepth < maxLoops) {
		const pattern = Object.keys(curve.rules).join('|');
		const regex = new RegExp(pattern, 'g');

		curve.result = curve.result.replace(regex, match => curve.rules[match]);

		currentDepth++;
	}

	// first a 'dry run': don't paint anything, but get the dimensions of the pattern
	drawCurve(curve, true);

	// with the dimensions, a scaling can be calculated so it fits the screen
	const totalWidth = Math.abs(dimensions.minX) + (dimensions.maxX);
	const totalHeight = Math.abs(dimensions.minY) + dimensions.maxY;
	const scaleWidth = window.innerWidth / totalWidth;
	const scaleHeight = window.innerHeight / totalHeight;

	curveScale = defaultScale * Math.min(scaleWidth, scaleHeight);

	// with that information, the pattern can be drawn on the canvas
	drawCurve(curve, false);
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
