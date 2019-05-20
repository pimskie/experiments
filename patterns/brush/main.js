// https://twitter.com/Art_Relatable/status/1126486986099834880
import anime from '//unpkg.com/animejs@3.0.1/lib/anime.es.js';

class Stage {
	constructor(canvasSelector, width, height) {
		this.canvas = document.querySelector(canvasSelector);
		this.ctx = this.canvas.getContext('2d');

		this.width = width;
		this.height = height;
	}

	get width() {
		return this.canvas.width;
	}

	get height() {
		return this.canvas.height;
	}

	get widthHalf() {
		return this.width * 0.5;
	}

	get heightHalf() {
		return this.height * 0.5;
	}

	set width(w) {
		this.canvas.width = w;
	}

	set height(h) {
		this.canvas.height = h;
	}

	drawLine(from, to) {
		this.ctx.beginPath();
		this.ctx.moveTo(from.x, from.y);
		this.ctx.lineTo(to.x, to.y);
		this.ctx.stroke();
		this.ctx.closePath();
	}

	clear() {
		this.ctx.clearRect(0, 0, this.width, this.height);
	}
}


class Tree {
	constructor(angle, from, length, stage, completeCallback = () => { }) {
		this.stage = stage;

		this.originalAngle = angle;
		this.angle = angle;
		this.from = from;

		this.completeCallback = completeCallback;

		this.to = { x: from.x, y: from.y };
		this.targetLength = length;

		this.isCompleted = false;
		this.maxDepth = 14;

		this.run();
	}

	run() {
		this.addBranch(this.angle, this.from, 0);
	}

	addBranch(angle, from, depth) {
		this.branchCount++;

		const branch = {
			from: { x: from.x, y: from.y },
			to: { x: from.x, y: from.y },
			length: 0,
			angle,
			depth,
		};

		anime({
			targets: branch,
			length: this.targetLength,
			easing: 'easeOutCubic',
			duration: 100,

			update: () => {
				this.draw(branch);
			},

			complete: () => {
				this.onBranchComplete(branch);
			},
		});
	}

	onBranchComplete(line) {
		if (line.depth === this.maxDepth) {
			if (!this.isCompleted) {
				this.completeCallback(this.originalAngle);
			}

			this.isCompleted = true;

			return;
		}

		const from = { x: line.to.x, y: line.to.y };
		const depth = line.depth + 1;
		const quartPI = Math.PI * 0.25;

		if (depth % 2 === 0) {
			this.addBranch(this.originalAngle, from, depth);
		} else {
			this.addBranch(this.originalAngle - quartPI, from, depth);
			this.addBranch(this.originalAngle + quartPI, from, depth);
		}
	}

	draw(line) {
		const { angle, length, from } = line;

		line.to.x = from.x + (Math.cos(angle) * length);
		line.to.y = from.y + (Math.sin(angle) * length);

		this.stage.drawLine(line.from, line.to);
	}
}

const stage = new Stage('canvas', 500, 500);
const length = 20;
let angle = Math.PI * 0.25;

const loop = (branchAngle) => {
	const from = {
		x: stage.widthHalf + (Math.cos(angle) * length),
		y: (Math.sin(angle) * length)
	};

	new Tree(Math.PI * 0.5, from, length, stage, loop);

	angle += Math.PI * 0.5;
};


new Tree(Math.PI * 0.5, { x: stage.widthHalf, y: 0 }, length, stage, loop);
