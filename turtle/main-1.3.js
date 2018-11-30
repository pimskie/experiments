// Chapter 1.3
// http://algorithmicbotany.org/papers/abop/abop-ch1.pdf

import * as Utils from 'https://rawgit.com/pimskie/utils/master/utils.js';
import Vector from 'https://rawgit.com/pimskie/vector/master/vector.js';

const ctx = Utils.qs('canvas').getContext('2d');
const PIPI = Math.PI * 2;

const W = 500;
const H = 500;
const MID_X = W * 0.5;
const MID_Y = H * 0.5;

ctx.canvas.width = W;
ctx.canvas.height = H;

/**
 * Commands:
 * F:	Move forward a step of length `stepSize`.
 * 		The state of the turtle changes to
 * 		(x1, y1, α), where
 * 		x1 = x + d * cos(heading) and
 * 		y1 = y + d * sin(heading).
 * 		A line segment between points (x, y) and (x1, y1) is drawn
 *
 * f: 	Move forward a step of length stepSize without drawing a line
 *
 * +: 	Turn left by angle `angleIncrement`. The next state of the turtle is
 * 		(x, y, heading + angleIncrement). The positive orientation of angles is counterclockwise.
 *
 * -:	Turn right by angle angleIncrement. The next state of the turtle is
 * 		(x, y, heading − angleIncrement).
 */

class Turtle {
	constructor({ heading = 0, position = new Vector() } = {}, { stepSize = 1, angleIncrement = Math.PI / 2 } = {}) {
		this.state = {
			heading,
			position,
		};

		this.stateDefault = {
			heading,
			position: position.clone(),
		};

		this.options = {
			stepSize,
			angleIncrement,
		};

		this.paths = [];

		this.instructions = {
			'F': ctx => this.stepDraw(ctx),
			'f': ctx => this.step(ctx),
			'+': ctx => this.turnLeft(ctx),
			'-': ctx => this.turnRight(ctx),
		};
	}

	get path() {
		if (!this.paths.length || !Array.isArray(this.paths[this.paths.length - 1])) {
			const p = [];

			this.paths.push(p);
		}

		return this.paths[this.paths.length - 1];
	}

	set stepSize(s) {
		this.options.stepSize = s;
	}

	instruct(instruction, ctx) {
		const action = this.instructions[instruction];

		if (!action) {
			throw Error(`"${instruction}" is not a valid instruction`);
		}

		action(ctx);
	}

	stepDraw() {
		const { state: { position, heading }, options: { stepSize } } = this;

		position.x += Math.cos(heading) * stepSize;
		position.y += Math.sin(heading) * stepSize;

		const point = this.state.position.clone();

		this.path.push({
			point,
			length: Utils.distanceBetween(new Vector(), point)
		});
	}

	step() {

	}

	turnLeft() {
		this.state.heading -= this.options.angleIncrement;
	}

	turnRight() {
		this.state.heading += this.options.angleIncrement;
	}

	isInstructable(instruction) {
		return this.instructions.hasOwnProperty(instruction);
	}

	reset() {
		this.paths = [];
		this.state = {
			heading: this.stateDefault.heading,
			position: this.stateDefault.position.clone(),
		};
	}
}

const turtle = new Turtle(
	{
		position: new Vector(),
		heading: 0,
	},
	{
		stepSize: 125,
		angleIncrement: Math.PI / 2,
	}
);


const run = () => {
	ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

	let n = sliderN.value;
	const w = 'F - F - F - F';
	const p = 'F - F + F + F F - F - F + F';

	// const w = 'F + F + F + F';
	// const p = 'F + F - F - F + F';
	// const p2 = 'F + F - F - F + F';

	turtle.reset();
	turtle.stepSize = parseInt(sliderStepSize.value, 10);

	let w1 = w;

	while (n--) {
		w1 = w1.replace(/F/g, p);
	}

	w1.replace(/ /g, '')
		.split('')
		.forEach(instruction => turtle.instruct(instruction, ctx));

	const { paths } = turtle;

	// const lengths = path.map(p => p.length);
	// const maxPoint = Math.max(...lengths);
	const diffHalf = 0; // maxPoint * 0.5;

	ctx.save();
	ctx.translate(MID_X, MID_Y);

	paths.forEach((path) => {
		ctx.beginPath();
		ctx.moveTo(path[0].point.x - diffHalf, path[0].point.y - diffHalf);

		for (let i = 1; i < path.length; i++) {
			ctx.lineTo(path[i].point.x - diffHalf, path[i].point.y - diffHalf);
		}

		ctx.closePath();
		ctx.stroke();
	});

	ctx.restore();
};



const sliderN = Utils.qs('[data-ref="n"]');
const sliderStepSize = Utils.qs('[data-ref="stepSize"]');

sliderN.addEventListener('change', run);
sliderStepSize.addEventListener('change', run);

run();
