
/**
 * http://www.complexification.net/gallery/machines/boxFitting
 *
 * A region of space is filled through exhaustive placement of slowly expanding boxes.
 * Each box begins very small (2 x 2 pixels) and increases in size until an obstacle
 * (surface border or other box) is encountered.
 */

const q = (sel) => document.querySelector(sel);

const canvas = q('canvas');
const ctx = canvas.getContext('2d');

const width = 600;
const height = 600;

canvas.width = width;
canvas.height = height;

class Box {
	constructor(stageWidth, stageHeight, dimension = 2) {
		this.sw = stageWidth;
		this.sh = stageHeight;

		this.hue = 200;
		this.grow = 1 + (Math.random() * 3);

		this.hasDiverged = false;
		this.canUpdate = true;

		this.dimension = dimension;
		this.x = 0;
		this.y = 0;

		this.init();
	}

	get corners() {
		const spacing = 2;

		const right = this.x + spacing + (this.dimension * 0.5);
		const left = this.x - spacing - (this.dimension * 0.5);

		const top = this.y - spacing - (this.dimension * 0.5);
		const bottom = this.y + spacing + (this.dimension * 0.5);

		return { top, right, bottom, left };
	}

	init() {
		this.x = this.sw * Math.random();
		this.y = this.sh * Math.random();
	}

	update(otherBoxes = []) {
		if (!this.canUpdate) {
			return;
		}

		const corners = this.corners;
		const isColliding = this.isColliding(otherBoxes);
		const isOutOfBounds = corners.left < 0 || corners.right > this.sw || corners.top < 0 || corners.bottom > this.sh;

		if (isColliding || isOutOfBounds) {
			this.canUpdate = false;

			return false;
		}

		this.dimension += this.grow;

		return true;
	}

	isColliding(boxes) {
		const corners = this.corners;

		const collisions = boxes.some((otherBox) => {
			const otherCorners = otherBox.corners;

			return !(
				otherCorners.left > corners.right ||
				otherCorners.right < corners.left ||
				otherCorners.top > corners.bottom ||
				otherCorners.bottom < corners.top
			);
		});


		return collisions;
	}

	draw(ctx) {
		const corners = this.corners;

		ctx.beginPath();
		ctx.fillStyle = `hsl(${this.hue}, 75%, 50%)`;
		ctx.strokeStyle = '#fff';
		ctx.lineWidth = 0.5;

		// tranform origin: center center
		ctx.rect(corners.left, corners.top, this.dimension, this.dimension);
		ctx.fill();
		ctx.closePath();
	}
}

const boxes = [];
const maxBoxes = 2000;

const addBox = () => {
	let box = new Box(width, height, 2);
	let collides = box.isColliding(boxes);

	if (collides) {
		let i = Math.floor(boxes.length / 1);

		while (i > 0 && collides) {
			box.init();
			collides = box.isColliding(boxes);

			i--;
		}
	}

	if (!collides) {
		// box.hue = 180 + Math.abs(180 * Math.sin((box.x * 0.009)));
		const a = Math.atan2(box.y, box.x) / (Math.PI / 2);

		box.hue = 180 + (180 * a);
		boxes.push(box);
	}
};


for (let i = 0; i < 3; i++) {
	addBox();
}

const loop = () => {
	boxes.forEach((box) => {
		const others = boxes.filter(b => b !== box);
		const wasUpdated = box.update(others);

		if (!wasUpdated && !box.hasDiverged && boxes.length < maxBoxes) {
			box.hasDiverged = true;

			addBox();
		}

		box.draw(ctx);
	});

	requestAnimationFrame(loop);
};

loop();
