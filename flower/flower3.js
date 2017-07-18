// maybe come in handy later: LCM
// https://raw.githubusercontent.com/josdejong/mathjs/master/dist/math.js
// http://en.wikipedia.org/wiki/Euclidean_algorithm

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

}

// http://math.stackexchange.com/questions/1938134/calculate-end-rotation-drawing-circles
const getSolution = (radiusSpeed, circleSpeed) => {
	let [p, q] = Calc.reduce(radiusSpeed, circleSpeed);

	let a = q;
	let b = p;

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

class Flower {
	constructor(ctxLeafs, ctxOutline) {
		this.defaults = {
			pointsLeafs: [],
			pointsPrecise: [],
			outlinePointsDrawn: 0,
			radiusAngle: -Calc.toRadians(-90),
			outlineAngle: -Calc.toRadians(-90),
			running: false,
			rafId: null
		};

		this.ctxLeafs = ctxLeafs;
		this.ctxOutline = ctxOutline;

		this.loop = this.loop.bind(this);
	}

	init(radiusSpeed = 1, outlineSpeed = 2, precision = 2500) {
		this.reset();

		this.radiusSpeed = radiusSpeed;
		this.outlineSpeed = outlineSpeed;
		this.speed = 3 / precision;
	}

	draw(maxRadius = 200) {
		this.maxRadius = maxRadius;

		this.numPointsPrecise = this.totalPoints();
		this.endRadiusAngle = this.radiusAngle + ((this.speed * this.radiusSpeed) * this.numPointsPrecise);
		this.numLeafs = Math.floor(this.endRadiusAngle / Math.PI);

		[this.pointsPrecise, this.points, this.leafs] = this.calculateForm(this.numPointsPrecise);

		this.drawLeafs();
	}

	/**
	 * returns object with:
	 * pointsPrecise, points, radiusAngle, outlineAngle
	 *
	 * Also creates an array with the leaves
	 * So, this funtion does more than 1 thing
	 */
	calculateForm(totalPoints) {
		let pointsPerLeaf = Math.ceil(this.numPointsPrecise / this.numLeafs);
		let pointsPrecise = [];
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

			radiusAngle += this.speed * this.radiusSpeed;
			outlineAngle += this.speed * this.outlineSpeed;

			pointsPrecise.push(point);

			if (i % 5 === 0) {
				points.push(point);
			}

			if (i > 0 & i % pointsPerLeaf === 0) {
				let newLeaf = [];
				leafs.push(newLeaf);
				currentLeaf = newLeaf;
			}

			currentLeaf.push(point);
		}

		return [pointsPrecise, points, leafs];
	}

	drawLeafs() {
		let ctx = this.ctxLeafs;

		for (let leafIndex = 0; leafIndex < this.leafs.length; leafIndex++) {
			let leafPoints = this.leafs[leafIndex];

			ctx.beginPath();
			ctx.fillStyle = `rgba(220, 0, 0, 0.4)`;
			ctx.strokeStyle = 'red';

			ctx.moveTo(leafPoints[0].x, leafPoints[0].y);

			for (let i = 1; i < leafPoints.length; i++) {
				ctx.lineTo(leafPoints[i].x, leafPoints[i].y);
			}

			ctx.lineTo(leafPoints[0].x, leafPoints[0].y);

			// ctx.stroke();
			ctx.fill();
			ctx.closePath();
		}
	}

	toggleOutline() {
		this.running = !this.running;

		if (this.running) {
			this.rafId = requestAnimationFrame(this.loop);
			console.log(this.rafId)
		} else {
			cancelAnimationFrame(this.rafId);
		}
	}

	loop() {
		this.clear();

		let ctx = this.ctxOutline;

		ctx.beginPath();
		ctx.lineWidth = 1;
		ctx.strokeStyle = 'white';
		ctx.moveTo(this.points[0].x, this.points[0].y);

		for (let i = 1; i < this.outlinePointsDrawn; i++) {
			ctx.lineTo(this.points[i].x, this.points[i].y);
		}

		ctx.stroke();
		ctx.closePath();

		if (this.outlinePointsDrawn < this.points.length) {
			this.outlinePointsDrawn++;
			this.rafId = requestAnimationFrame(this.loop);
		}

	}

	// calculate total number of points to draw the form
	totalPoints() {
		let solution = this.solution();

		// found in notes
		return Math.ceil(solution / (this.speed * (this.radiusSpeed + this.outlineSpeed)));
	}

	// returns the total radians needed to complete the form
	solution() {
		// http://math.stackexchange.com/questions/1938134/calculate-end-rotation-drawing-circles
		let [p, q] = Calc.reduce(this.radiusSpeed, this.outlineSpeed);

		let a = q;
		let b = p;

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

	reset() {
		this.clear();

		Object.assign(this, this.defaults);
	}

	clear() {
		this.ctxOutline.clearRect(
			0,
			0,
			this.ctxOutline.canvas.width,
			this.ctxOutline.canvas.height
		);
	}

	get midX() {
		return this.ctxOutline.canvas.width >> 1;
	}

	get midY() {
		return this.ctxOutline.canvas.height >> 1;
	}
}

let timer1 = performance.now();
let running = false;

const ctxLeafs = document.querySelector('.canvas-path').getContext('2d');
const ctxOutline = document.querySelector('.canvas-draw').getContext('2d');
let maxRadius;

const resizeStage = () => {
	ctxLeafs.canvas.width = window.innerWidth;
	ctxLeafs.canvas.height = window.innerHeight;

	ctxOutline.canvas.width = window.innerWidth;
	ctxOutline.canvas.height = window.innerHeight;

	maxRadius = Math.min(300, window.innerHeight >> 1);
}

const onResize = () => {
	resizeStage();
	flower.draw(maxRadius);
}

resizeStage();

let flower = new Flower(ctxLeafs, ctxOutline);
flower.init(4, 3, 2500);
flower.draw(maxRadius);

console.log(maxRadius);

window.addEventListener('resize', onResize);


document.addEventListener('mousedown', (e) => {
	flower.toggleOutline();
});

let timer2 = performance.now();
console.log(`this took ${timer2 - timer1} MS`);