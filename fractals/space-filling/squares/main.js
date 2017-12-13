
/**
 * http://www.complexification.net/gallery/machines/boxFitting
 * http://www.complexification.net/gallery/machines/boxFitting/appletm/BoxFitting_m.pde
 *
 * A region of space is filled through exhaustive placement of slowly expanding boxes.
 * Each box begins very small (2 x 2 pixels) and increases in size until an obstacle
 * (surface border or other box) is encountered.
 *
 * This probably isn't the fastest way to fill a region, but it is certainly interesting to watch.
 */

const q = (sel) => document.querySelector(sel);

const canvas = q('canvas');
const ctx = canvas.getContext('2d');

const width = 600;
const height = 600;

canvas.width = width;
canvas.height = height;

class Box {
	constructor(stageWidth, stageHeight, dimension = 2, hue = 120) {
		this.sw = stageWidth;
		this.sh = stageHeight;

		this.hue = hue;
		this.grow = 2;

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

		if (corners.left < 0 || corners.right > this.sw || corners.top < 0 || corners.bottom > this.sh) {
			this.canUpdate = false;

			return false;
		}

		if (this.isColliding(otherBoxes)) {
			this.canUpdate = false;

			return false;
		}

		this.dimension += this.grow;

		return true;
	}

	// https://stackoverflow.com/questions/2752349/fast-rectangle-to-rectangle-intersection
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
		ctx.fillStyle = `hsl(${this.hue}, 50%, 50%)`;
		ctx.strokeStyle = '#000';
		ctx.lineWidth = 0.5;
		// tranform origin: center center
		ctx.rect(corners.left, corners.top, this.dimension, this.dimension);
		ctx.fill();
		ctx.stroke();
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

	if (collides) {
		box = null;
	} else {
		box.hue = 180 + Math.abs(180 * Math.sin((box.y * 0.009)));
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
