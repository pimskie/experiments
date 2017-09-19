
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
