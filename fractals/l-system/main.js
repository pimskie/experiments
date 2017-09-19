// https://en.wikipedia.org/wiki/L-system

/* globals Vue: false, performance: false, */

const qs = (sel) => document.querySelector(sel);

const toRadian = Math.PI / 180;

const canvas = qs('canvas');
const ctx = canvas.getContext('2d');

const width = canvas.offsetWidth;
const height = canvas.offsetHeight;

canvas.width = width;
canvas.height = height;

canvas.classList.add('is-sized');

let currentLindenmayer = null;

const filters = {
	name: 'filters',

	data() {
		return {
			selectedPresetKey: 'tree4',
			selectedPreset: {},

			presets: {
				hilbert: {
					axiom: 'A',
					variables: ['A', 'B'],
					rules: [
						'A: -BF+AFA+FB-',
						'B: +AF-BFB-FA+',
					],
					angle: 90,
					depth: 5,
					maxDepth: 8,
				},
				peano: {
					axiom: 'F',
					variables: [],
					rules: [
						'F:F+F-F-F-F+F+F+F-F',
					],
					depth: 3,
					maxDepth: 5,
				},
				tree4: {
					axiom: 'G',
					variables: [],
					rules: [
						'G:GFX[+G][-G]',
						'X:X[-FFF][+FFF]FX',
					],
					angle: 25.7,
					angleStart: -90,
					depth: 3,
					maxDepth: 7,
				},
			},
		};
	},

	watch: {
		selectedPresetKey() {
			this.setSelectedPreset();

			this.draw();
		},

		'selectedPreset.depth'() {
			this.draw();
		},
	},

	created() {
		this.setSelectedPreset();
	},

	mounted() {
		this.draw();
	},

	methods: {
		setSelectedPreset() {
			// copy preset instead of observable reference
			this.$set(this, 'selectedPreset', JSON.parse(JSON.stringify(this.presets[this.selectedPresetKey])));
		},

		draw() {
			const config = Object.assign({}, this.selectedPreset);
			const rules = config.rules;

			config.rules = {};

			rules.forEach((rule) => {
				const a = rule.split(':');
				config.rules[a[0]] = a[1].trim();
			});

			// calling a function outside the Vue component \o/
			setup(config);
		},

		toUpperCase(e) {
			e.target.value = e.target.value.toUpperCase();
		},
	},
};

class Lindenmayer {
	/**
	 *
	 * @param {String} axiom
	 * @param {Object} rules
	 * @param {Array} variables default empty
	 * @param {Number} angleStep default 90 degrees
	 * @param {*} angleStart default 0 degrees
	 * @param {*} maxDepth default 6
	 */
	constructor({
		axiom = '',
		rules = {},
		variables = [],
		angle = 90,
		angleStart = 0,
		depth = 6,
	} = {}) {

		this.axiom = axiom;
		this.result = axiom;

		this.rules = rules;
		this.variables = variables;

		this.angleStep = angle * toRadian;
		this.angleStart = angleStart * toRadian;
		this.angleCurrent = this.angleStart;

		this.depth = depth;
		this.currentDepth = 1;

		this.x = 0;
		this.y = 0;

		this.stack = [];
		this.dimensions = {};

		this.defaultScale = 10;
		this.scale = this.defaultScale;

		this.commandsMap = {
			'-': 'adjustAngle',
			'+': 'adjustAngle',
			'[': 'push',
			']': 'pop',
		};
	}

	/**
	 * this is the core, the most important part
	 * within every loop, the alphabeth chararcter (A, B, X, F, etc) gets replaced by their rule
	 * Since the rule contains one or more alphabeth characters, the product gets longer and longer
	 */
	generateString() {
		// reset result to beginning
		this.reset();

		// combine all rule keys ('A', 'B' 'F', etc) in one regex
		const pattern = Object.keys(this.rules).join('|');
		const regex = new RegExp(pattern, 'g');

		// replace all occurences ('A', 'B' 'F', etc) with the corresponding rule
		// for example: 'A' -> 'A-B--B+A++AA+B-'
		let depth = this.depth;

		while (depth--) {
			this.result = this.result.replace(regex, match => this.rules[match]);
		}

		return this;
	}

	runCommands(callback = () => { }) {
		this.angleCurrent = this.angleStart;
		this.x = 0;
		this.y = 0;

		// remove the variables from the result string, they aren't needed anymore
		// http://stackoverflow.com/a/12097710/5930258
		const variablesPattern = (this.variables || []).join('|');
		const regex = new RegExp(variablesPattern, 'g');
		const commands = this.result.replace(regex, '').split('');

		commands.forEach(c => this[this.commandsMap[c] || 'move'](c, callback));

		this.dimensions.width = Math.abs(this.dimensions.minX) + this.dimensions.maxX;
		this.dimensions.height = Math.abs(this.dimensions.minY) + this.dimensions.maxY;
	}

	move(command, callback) {
		const nextX = this.x + (Math.cos(this.angleCurrent) * this.scale);
		const nextY = this.y + (Math.sin(this.angleCurrent) * this.scale);

		callback(this.x, this.y, nextX, nextY);

		this.x = nextX;
		this.y = nextY;

		if (!this.dimensions.minX || this.x < this.dimensions.minX) {
			this.dimensions.minX = this.x;
		}

		if (!this.dimensions.maxX || this.x > this.dimensions.maxX) {
			this.dimensions.maxX = this.x;
		}

		if (!this.dimensions.minY || this.y < this.dimensions.minY) {
			this.dimensions.minY = this.y;
		}

		if (!this.dimensions.maxY || this.y > this.dimensions.maxY) {
			this.dimensions.maxY = this.y;
		}
	}

	reset() {
		this.result = this.axiom;
		this.angleCurrent = this.angleStart;
		this.scale = this.defaultScale;

		this.stack = [];
		this.dimensions = {
			minX: Infinity,
			maxX: -Infinity,
			minY: Infinity,
			maxY: -Infinity,
		};
	}

	adjustAngle(command) {
		if (command === '+') {
			this.angleCurrent -= this.angleStep;
		} else {
			this.angleCurrent += this.angleStep;
		}
	}

	push() {
		this.stack.push({ x: this.x, y: this.y, angleCurrent: this.angleCurrent });
	}

	pop() {
		Object.assign(this, this.stack.pop());
	}
}

const setup = (systemConfig) => {
	currentLindenmayer = new Lindenmayer(systemConfig);

	generate(currentLindenmayer);
};

const generate = (lindenmayer) => {
	const then = performance.now();

	// within `runCommands`, the dimensions of the curve are set
	lindenmayer
		.generateString()
		.runCommands();

	// with the dimensions, a scaling can be calculated so it fits the screen
	const scaleWidth = width / lindenmayer.dimensions.width;
	const scaleHeight = height / lindenmayer.dimensions.height;

	const curveScale = lindenmayer.defaultScale * Math.min(scaleWidth, scaleHeight);
	const scaleFactor = lindenmayer.defaultScale / curveScale;
	const curveNewWidth = lindenmayer.dimensions.width / scaleFactor;
	const curveNewHeight = lindenmayer.dimensions.height / scaleFactor;

	// set new scale so curve fills the screen
	lindenmayer.scale = curveScale;

	// position curve in the middle
	const offsetX = (Math.abs(lindenmayer.dimensions.minX) / scaleFactor) + (width * 0.5) - (curveNewWidth * 0.5);
	const offsetY = (-lindenmayer.dimensions.minY / scaleFactor) + (height * 0.5) - (curveNewHeight * 0.5);

	ctx.clearRect(0, 0, width, height);
	ctx.save();
	ctx.translate(offsetX, offsetY);

	// run the commands again, but this time with a callback function to draw the curve
	lindenmayer.runCommands((x, y, nextX, nextY) => {
		ctx.beginPath();
		ctx.moveTo(x, y);
		ctx.lineTo(nextX, nextY);
		ctx.stroke();
		ctx.closePath();
	});

	ctx.restore();

	console.log(`${(performance.now() - then).toFixed(2)}MS`);
};

new Vue({
	el: '.js-controls',
	name: 'controls',

	components: {
		filters,
	},

});
