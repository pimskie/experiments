class Calc {
	static toRadians(degrees) {
		return degrees * (Math.PI / 180);
	}

	static isEven(num) {
		return num !== 0 && num % 2 === 0;
	}

	static isInt(num) {
		return num === parseInt(num, 10);
	}

	// http://stackoverflow.com/questions/4652468/is-there-a-javascript-function-that-reduces-a-fraction
	// http://stackoverflow.com/questions/17445231/js-how-to-find-the-greatest-common-divisor
	static reduce(numerator, denominator) {
		if (!Calc.isInt(numerator) || !Calc.isInt(denominator)) {
			numerator *= 10;
			denominator *= 10;
		}

		let gcd = Calc.gcd(numerator, denominator);

		return [numerator / gcd, denominator / gcd];
	}

	// http://stackoverflow.com/questions/17445231/js-how-to-find-the-greatest-common-divisor
	static gcd(a, b) {
		if (!b) {
			return a;
		}

		return Calc.gcd(b, a % b);
	};

	static distance(p1, p2) {
		return Math.sqrt((p1.x - p2.x) * (p1.x - p2.x) + (p1.y - p2.y) * (p1.y - p2.y));
	}

	static map(value, inMin, inMax, outMin, outMax) {
		return (value - inMin) * (outMax - outMin) / (inMax - inMin) + outMin;
	}
}

class Leaf {
	constructor(points, scale = 0, alpha = 0) {
		Object.assign(this, { points, scale, alpha });

		this.r = 0;
		this.g = 0;
		this.b = 0;
	}

	update(tick, modifier, index) {
		let ns = noise.simplex2(tick + modifier + index, tick + modifier + index);
		let n1 = noise.simplex2(tick + modifier + 0.5, tick + modifier + 0.5);
		let n2 = noise.simplex2(tick + modifier + 1, tick + modifier + 1);
		let n3 = noise.simplex2(tick + modifier + 1.5, tick + modifier + 1.5);

		this.scale = 1 + (0.1 * ns);
		this.alpha = 0.5 + (0.002 * n1);

		this.r = Math.round(Calc.map(n1, -1, 1, 0, 255));
		this.g = Math.round(Calc.map(n2, -1, 1, 0, 255));
		this.b = Math.round(Calc.map(n3, -1, 1, 0, 255));
	}

	get color() {
		return `rgba(${this.r}, ${this.g}, ${this.b}, ${this.alpha})`;
	}
}

class Flower {
	constructor(ctxLeafs, ctxOutline, ctxAmbient) {
		this.defaults = {
			animate: false,
			points: [],
			pointsDrawn: 0,
			radiusAngle: -Calc.toRadians(-90),
			outlineAngle: -Calc.toRadians(-90),
			tick: 1,
			rafId: null
		};

		this.ctxLeafs = ctxLeafs;
		this.ctxOutline = ctxOutline;
		this.ctxAmbient = ctxAmbient;

		this.outlineColor = 'rgba(255, 255, 255, 1)';

		noise.seed(Math.random());
	}

	init(precision = 2500) {
		this.reset();

		this.precision = 1 / precision;
	}

	draw(maxRadius = 200) {
		this.maxRadius = maxRadius;

		this.numPoints = this.totalPoints();
		this.endRadiusAngle = this.radiusAngle + ((this.precision * this.options.radiusSpeed) * this.numPoints);
		this.numLeafs = Math.floor(this.endRadiusAngle / Math.PI);
		this.pointsPerLeaf = Math.ceil(this.numPoints / this.numLeafs);
		this.drawSpeed = 30;
		
		[this.points, this.leafsArray] = this.calculateForm(this.numPoints);

		this.leafs = [];

		this.leafsArray.forEach((leafPoints, index) => {
			let leaf = new Leaf(leafPoints, 0, 0);
			this.leafs.push(leaf);
		});
	}

	setOptions(options) {
		this.options = options;
	}

	/**
	 * returns array with:
	 * points, leafs
	 *
	 * Also creates an array with the leaves
	 * So, this funtion does more than 1 thing
	 */
	calculateForm(totalPoints) {
		let points = [];

		let currentLeaf = [];
		let leafs = [
			currentLeaf
		];

		let radiusAngle = this.radiusAngle;
		let outlineAngle = this.outlineAngle;

		for (let i = 0; i < totalPoints; i++) {
			let radius = Math.cos(radiusAngle) * this.maxRadius;

			let point = {
				x: (this.midX + Math.cos(outlineAngle) * radius) - 0.5,
				y: (this.midY + Math.sin(outlineAngle) * radius) - 0.5
			};

			radiusAngle += this.precision * this.options.radiusSpeed;
			outlineAngle += this.precision * this.options.outlineSpeed;

			points.push(point);

			if (i > 0 & i % this.pointsPerLeaf === 0) {
				let newLeaf = [];
				leafs.push(newLeaf);
				currentLeaf = newLeaf;
			}

			currentLeaf.push(point);
		}

		return [points, leafs];
	}

	// calculate total number of points to draw the form
	totalPoints() {
		let solution = this.solution();

		// found in taken notes and by observation
		return Math.ceil(solution / (this.precision * (this.options.radiusSpeed + this.options.outlineSpeed)));
	}

	// returns the total radians needed to complete the form
	solution() {
		// http://math.stackexchange.com/questions/1938134/calculate-end-rotation-drawing-circles
		let [b, a] = Calc.reduce(this.options.radiusSpeed, this.options.outlineSpeed);

		let odds = !Calc.isEven(a) && !Calc.isEven(b);

		let a1;
		let a2;

		if (odds) {
			a1 = Math.PI * a;
			a2 = Math.PI * b;
		} else {
			a1 = 2 * Math.PI * a;
			a2 = 2 * Math.PI * b;
		}

		let solution = a1 + a2;

		return solution;
	}

	updateLeafs(numLeafs) {
		const ctx = this.ctxLeafs;
		
		// draw leafs
		for (let i = 0; i < numLeafs; i++) {
			const modifier = i * 0.008;

			this.leafs[i].update(this.tick, modifier, i);
			this.drawLeaf(this.leafs[i]);
		}
	}

	drawLeaf(leaf) {
		let leafPoints = leaf.points;

		let ctx = this.ctxLeafs;
		let midX = this.midX;
		let midY = this.midY;

		let translateX = midX;
		let translateY = midY;

		ctx.save();
		ctx.translate(translateX, translateY);
		ctx.scale(leaf.scale, leaf.scale);

		ctx.beginPath();
		ctx.fillStyle = leaf.color;

		ctx.moveTo(leafPoints[0].x - midX, leafPoints[0].y - midY);

		for (let i = 1; i < leafPoints.length; i += this.drawSpeed) {
			ctx.lineTo(leafPoints[i].x - midX, leafPoints[i].y - midY);
		}

		ctx.lineTo(leafPoints[0].x - midX, leafPoints[0].y - midY);

		ctx.fill();
		ctx.closePath();

		ctx.restore();
	}

	ambient(ta) {
		const na = noise.simplex2(ta, ta);
		const scale = Calc.map(na, -1, 1, 1.1, 1.3);

		const width = this.midX * 2;
		const offsetX = ((width * scale) - width) * 0.5;

		const height = this.midY * 2;
		const offsetY = ((height * scale) - height) * 0.5;

		this.ctxAmbient.filter = `blur(${this.options.ambientBlur}px)`;
		this.ctxAmbient.save();
		this.ctxAmbient.translate(-offsetX, -offsetY);

		this.ctxAmbient.scale(scale, scale);
		this.ctxAmbient.clearRect(0, 0, width, height);
		this.ctxAmbient.globalAlpha = 0.8;
		
		this.ctxAmbient.drawImage(this.ctxLeafs.canvas, 0, 0);
		this.ctxAmbient.restore();
	}

	instantOutline() {
		const ctx = this.ctxOutline;
		const speed = this.drawSpeed;

		// already drawn
		if (this.pointsDrawn === this.points.length) {
			return;
		}

		ctx.beginPath();
		ctx.lineWidth = 1;
		ctx.strokeStyle = this.outlineColor;
		
		const startPoint = this.points.shift();
		ctx.moveTo(startPoint.x, startPoint.y);

		for (let i = 0; i < this.points.length; i += speed) {
			ctx.lineTo(this.points[i].x,  this.points[i].y);
		}

		ctx.lineTo(this.points[this.points.length - 1].x,  this.points[this.points.length - 1].y);

		ctx.stroke();
		ctx.closePath();

		this.pointsDrawn = this.points.length;
	}

	animateOutline() {
		const ctx = this.ctxOutline;
		const speed = this.drawSpeed;
		const nextPointIndex = Math.min(this.pointsDrawn, this.points.length - 1);

		if (nextPointIndex === this.points.length - 1) {
			return;
		}
		
		ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

		ctx.beginPath();
		ctx.lineWidth = 1;
		ctx.strokeStyle = this.outlineColor;

		ctx.moveTo(this.points[0].x, this.points[0].y);

		for (let i = 0; i < nextPointIndex; i += speed) {
			ctx.lineTo(this.points[i].x, this.points[i].y);
		}

		// close path
		if (nextPointIndex + speed >= this.points.length - 1) {
			ctx.lineTo(this.points[0].x, this.points[0].y);

			this.pointsDrawn = this.points.length;
		} else {
			this.pointsDrawn += speed;
		}

		ctx.stroke();
		ctx.closePath();

		if (this.options.drawOuterCircle) {
			this.animateOuterCircle(this.points[this.pointsDrawn - 1]);
		}
	}

	animateOuterCircle(currentPoint) {
		const ctx = this.ctxOutline;
		const r = Calc.distance(currentPoint, { x: this.midX, y: this.midY });

		ctx.beginPath();
		ctx.lineWidth = 1;
		ctx.strokeStyle = this.outlineColor;

		ctx.arc(this.midX, this.midY, r, 0, Math.PI * 2);
		
		ctx.stroke();
		ctx.closePath();
	}

	update() {
		this.prepareLeafsCanvas();

		if (this.options.animate) {
			this.animateOutline();
		} else {
			this.instantOutline();
		}

		const numLeafs = Math.floor(this.pointsDrawn / (this.pointsPerLeaf - 2));
		this.updateLeafs(numLeafs);

		const na = this.tick + 1;
		this.ambient(na);

		this.tick += 0.002;
	}

	reset() {
		Object.assign(this, this.defaults);
	}

	prepareLeafsCanvas() {
		this.ctxLeafs.globalCompositeOperation = 'destination-out';

		this.ctxLeafs.fillStyle = 'hsla(0, 0%, 0%, 0.9)';
		this.ctxLeafs.fillRect(0, 0, this.ctxLeafs.canvas.width, this.ctxLeafs.canvas.height);

		this.ctxLeafs.globalCompositeOperation = 'lighter';
	}

	get midX() {
		return this.ctxOutline.canvas.width >> 1;
	}

	get midY() {
		return this.ctxOutline.canvas.height >> 1;
	}
}

// all other randomly ordered things
let rafId = null;
const stats = new Stats();

stats.showPanel(0); 
document.querySelector('.stats').appendChild(stats.domElement);

const precision = 7500;

const ctxLeafs = document.querySelector('.canvas-leafs').getContext('2d');
const ctxOutline = document.querySelector('.canvas-outline').getContext('2d');
const ctxAmbient = document.querySelector('.canvas-ambient').getContext('2d');

let maxRadius;

// stage resize handler, doesn't work that good, does it?
const resizeStage = () => {

	let width = window.innerWidth;
	let height = window.innerHeight;


	ctxLeafs.canvas.width = width;
	ctxLeafs.canvas.height = height;

	ctxOutline.canvas.width = width;
	ctxOutline.canvas.height = height;

	ctxAmbient.canvas.width = width;
	ctxAmbient.canvas.height = height;

	let smallest = (width > height) ? height : width;
	maxRadius = Math.min(300, smallest * 0.3);
}

const reset = () => {
	resizeStage();

	if (options.animate) {
		options.showOutline = true;
	}

	assignOptions();

	flower.init(precision);
	flower.draw(maxRadius);
}

const loop = () => {
	stats.begin();
	flower.update();

	stats.end();

	rafId = requestAnimationFrame(loop);
}

const assignOptions = () => {
	ctxOutline.canvas.classList.toggle('is-hidden', !options.showOutline);
	ctxLeafs.canvas.classList.toggle('is-hidden', !options.showFill);
	ctxAmbient.canvas.classList.toggle('is-hidden', !options.showAmbient);

	flower.setOptions(options);
}

let options = {
	radiusSpeed: 7.5,
	outlineSpeed: 6,
	drawOuterCircle: true,
	animate: false,
	showOutline: false,
	showFill: true,
	showAmbient: true,
	ambientBlur: 8,
	redraw: reset
};

let flower = new Flower(ctxLeafs, ctxOutline, ctxAmbient);
reset();
loop();

window.addEventListener('resize', reset);

// UI stuff

let gui = new dat.GUI();
let folderForm = gui.addFolder('form');
let folderDrawing = gui.addFolder('drawing');
let folderAmbient = gui.addFolder('ambient');

folderForm.add(options, 'radiusSpeed', 1, 15).step(0.5).onFinishChange(reset);
folderForm.add(options, 'outlineSpeed', 1, 15).step(0.5).onFinishChange(reset);

folderDrawing.add(options, 'animate').onFinishChange(reset);
folderDrawing.add(options, 'drawOuterCircle').onFinishChange(assignOptions);
folderDrawing.add(options, 'showOutline').onFinishChange(assignOptions);
folderDrawing.add(options, 'showFill').onFinishChange(assignOptions);

folderAmbient.add(options, 'showAmbient').onFinishChange(assignOptions);
folderAmbient.add(options, 'ambientBlur', 0, 15).step(1).onFinishChange(assignOptions);

folderForm.open();

gui.add(options, 'redraw');

document.querySelector('.datgui').appendChild(gui.domElement);