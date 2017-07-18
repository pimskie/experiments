/*
For pairs of lips to kiss maybe
Involves no trigonometry.
'Tis not so when four circles kiss
Each one the other three.
 */

const canvas = document.querySelector('canvas');
const ctx = canvas.getContext('2d');

const DIM = canvas.width;
const MID = DIM * 0.5;
const MIN_R = 2;

let circles = [];
let rafId = null;
let selectedSet = 'symmetric';

class Circle {
	constructor(r, center) {
		this.r = r;
		this.b = 1 / this.r;

		this.center = center;
		this.bc = this.center.mul(this.b);

		this.alpha = 0;
	}
}

const solveEquation = (k1, k2, k3) => {
	// "When trying to find the radius of a fourth circle tangent to three given kissing circles, the equation is best rewritten as:"
	// https://en.wikipedia.org/wiki/Descartes%27_theorem
	// return k1 + k2 + k3 + (2 * Math.sqrt(k1 * k2 + k2 * k3 + k1 * k3))
	let s = k1.add(k2).add(k3);

	let k12 = k1.mul(k2);
	let k13 = k1.mul(k3);
	let k23 = k2.mul(k3);
	let ksum = k12.add(k13).add(k23);

	return ksum.sqrt().mul(2).add(s);
}

const getAdjacent = (c1, c2, c3) => {
	// get the bend (curvature) fo the 4th circle:
	// https://mathlesstraveled.com/2016/05/04/apollonian-gaskets-and-descartes-theorem/
	// bend4 = b1 + b2 + b3 + (2 * Math.sqrt(b1 * b2 + b2 * b3 + b1 * b3));
	let b1 = new Complex(c1.b);
	let b2 = new Complex(c2.b);
	let b3 = new Complex(c3.b);
	let b4 = solveEquation(b1, b2, b3);
	let r4 = Math.abs(1 / b4.re);

	// get the position of the forth circle
	// https://mathlesstraveled.com/2016/06/10/apollonian-gaskets-and-descartes-theorem-ii/
	// http://arxiv.org/pdf/math/0101066v1.pdf
	let pos4 = solveEquation(c1.bc, c2.bc, c3.bc).div(b4);

	return new Circle(r4, pos4);
}

const flip = (c4, c1, c2, c3) => {
	// "So if we already have one value for b_4, we can just subtract it from double the sum of
	// the other three bends to find the second value of b_4."
	// https://mathlesstraveled.com/2016/05/04/apollonian-gaskets-and-descartes-theorem/
	let bend = 2 * (c1.b + c2.b + c3.b) - c4.b;

	// For each operation we compute the same formula twice, once for the bends and once
	// for the bend-center products. To recover the center of a circle, just divide the
	// bend-center product by the bend. And voila!
	// https://mathlesstraveled.com/2016/06/10/apollonian-gaskets-and-descartes-theorem-ii/
	let center = c1.bc.add(c2.bc).add(c3.bc).mul(2).sub(c4.bc).div(bend);

	return new Circle(1 / bend, center);
}

const recurse = (c1, c2, c3, c4, depth = 0) => {
	let cn2 = flip(c2, c1, c3, c4);
	let cn3 = flip(c3, c1, c2, c4);
	let cn4 = flip(c4, c1, c2, c3);

	if (cn2.r > MIN_R) {
		addCircle(cn2);
		recurse(cn2, c1, c3, c4, depth + 1);
	}

	if (cn3.r > MIN_R) {
		addCircle(cn3);
		recurse(cn3, c1, c2, c4, depth + 1);
	}

	if (cn4.r > MIN_R) {
		addCircle(cn4);
		recurse(cn4, c1, c2, c3, depth + 1);
	}
}

// "Given any three mutually tangent circles, there are exactly two other
// circles which are mutually tangent to all three (forming what we called a “kissing set”)."
// https://mathlesstraveled.com/2016/05/04/apollonian-gaskets-and-descartes-theorem/
const drawGasket = (c1, c2, c3) => {
	let c4 = getAdjacent(c1, c2, c3);
	let c5 = flip(c1, c2, c3, c4)

	addCircle(c1);
	addCircle(c2);
	addCircle(c3);
	addCircle(c4);
	addCircle(c5);

	recurse(c1, c2, c3, c4);
	recurse(c5, c2, c3, c4);
}

const addCircle = (circle) => {
	circles.push(circle);

	circle.tween = TweenMax.to(circle, 3, {
		alpha: 1,
		delay: (DIM / circle.r) * 0.02
	});
};

const drawCircle = (c) => {
	let absR = Math.abs(c.r);

	ctx.beginPath();
	ctx.strokeStyle = `rgba(100, 121, 121, ${c.alpha})`;
	ctx.lineWidth = 1;

	ctx.arc(c.center.re, c.center.im, absR, 0, Math.PI * 2, false);
	ctx.stroke();
	ctx.closePath();
}

const clear = () => {
	ctx.clearRect(0, 0, DIM, DIM);
}

const update = () => {
	clear();

	circles.forEach(drawCircle);

	rafId = requestAnimationFrame(update);
}

// functions returning a set of three kissing circles
// If a circle has other circles in it, it has a negative curvature
const symmetricSet = () => {
	let c1r = -MID;
	let c1center = new Complex(MID, MID);
	let c1 = new Circle(c1r, c1center);

	let c2r = 100;
	let c2center = new Complex(c2r, MID);
	let c2 = new Circle(c2r, c2center);

	let c3r = Math.abs(c1.r) - c2.r;
	let c3x = c2.center.re + c2.r + c3r;
	let c3y = c2.center.im;
	let c3center = new Complex(c3x, c3y);
	let c3 = new Circle(c3r, c3center);

	return [[c1, c2, c3]];
}

const aSymmetricSet = () => {
	let c1r = -MID;
	let c1center = new Complex(MID, MID);
	let c1 = new Circle(c1r, c1center);

	let c2r = 160;
	let c2center = new Complex(c2r, MID);
	let c2 = new Circle(c2r, c2center);

	let c3r = Math.abs(c1.r) - c2.r;
	let c3x = c2.center.re + c2.r + c3r;
	let c3y = c2.center.im;
	let c3center = new Complex(c3x, c3y);
	let c3 = new Circle(c3r, c3center);

	return [[c1, c2, c3]];
}

// returning 2 sets
const nestedSet = () => {
	let c1r = -MID;
	let c1center = new Complex(MID, MID);
	let c1 = new Circle(c1r, c1center);

	let c2r = 160;
	let c2center = new Complex(MID, c2r);
	let c2 = new Circle(c2r, c2center);

	let c3r = MID - 160;
	let c3center = new Complex(MID, DIM - c3r);
	let c3 = new Circle(c3r, c3center);

	// nested gasket
	let ci1r = -c2r;
	let ci1center = new Complex(MID, Math.abs(ci1r));
	let ci1 = new Circle(ci1r, ci1center);

	let ci2r = Math.abs(ci1r) / 2;
	let ci2center = new Complex(MID, ci2r);
	let ci2 = new Circle(ci2r, ci2center);

	let ci3r = Math.abs(ci1r) - ci2.r;
	let ci3x = ci2.center.re;
	let ci3y = ci2r + ci2r + ci3r;
	let ci3center = new Complex(ci3x, ci3y);
	let ci3 = new Circle(ci3r, ci3center);

	return [[c1, c2, c3], [ci1, ci2, ci3]];

}

const sets = {
	'symmetric': symmetricSet(),
	'asymmetric': aSymmetricSet(),
	'nested': nestedSet()
};

const reset = () => {
	TweenMax.killAll();

	circles.forEach((c) => {
		c.alpha = 0;
	});

	cancelAnimationFrame(rafId);

	clear();
	circles = [];
}

const draw = () => {
	reset();

	let set = sets[selectedSet];

	for (let gasket of set) {
		drawGasket(gasket[0], gasket[1], gasket[2]);
	}

	console.log(`done, ${circles.length} circles`);

	update();
}

draw();

// quick & dirty button functionality
let btns = document.querySelectorAll('.btn');
const onSetBtnClick = (e) => {
	document.querySelector('.btn.is-selected').classList.remove('is-selected');

	let btn =  e.target;

	btn.classList.add('is-selected');
	selectedSet = btn.getAttribute('data-set');

	draw();
}

for (let btn of btns) {
	btn.addEventListener('click', onSetBtnClick);
}

// quick & dirty reading list
let readingListLinks = [
	'https://mathlesstraveled.com/2016/05/04/apollonian-gaskets-and-descartes-theorem/',
	'https://mathlesstraveled.com/2016/06/10/apollonian-gaskets-and-descartes-theorem-ii/',
	'https://en.wikipedia.org/wiki/Vieta_jumping',
	'https://www.khanacademy.org/math/algebra2/introduction-to-complex-numbers-algebra-2/adding-and-subtracting-complex-numbers-algebra-2/v/adding-complex-numbers',
	'https://www.khanacademy.org/math/algebra2/introduction-to-complex-numbers-algebra-2/the-imaginary-numbers-algebra-2/a/intro-to-the-imaginary-numbers',
	'https://lsandig.org/blog/2014/08/apollon-python/en/',
	'http://langexplr.blogspot.nl/2007/10/drawing-apollonian-gasket-with-common.html',
	'http://www.americanscientist.org/libraries/documents/2009124132107602-2010-01CompSci_MacKenzie.pdf',
	'http://www.ams.org/samplings/feature-column/fcarc-kissing',
	'http://www3.math.tu-berlin.de/geometrie/Lehre/WS12/MathVis/resources/projects/steinertStruempelSlides.pdf',
	'http://codegolf.stackexchange.com/questions/38450/draw-an-apollonian-gasket',
  'https://github.com/infusion/Complex.js'
];

let readingList = document.querySelector('.js-reading-list');
for (let link of readingListLinks) {
	readingList.innerHTML += `<li><a href="${link}" title="${link}" target="_blank">${link}</a><li>`;
}

