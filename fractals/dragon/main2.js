// https://bentrubewriter.com/2012/04/25/fractals-you-can-update-the-dragon-curve-or-the-jurassic-fractal/
// http://www.instructables.com/id/Dragon-Curve-Using-Python/
// https://www.youtube.com/watch?v=NajQEiKFom4

/*
each iteration is formed by taking the previous iteration,
adding an R at the end, and then taking the original iteration again, flipping it retrograde,
swapping each letter and adding the result after the R.
*/

const canvas = document.querySelector('canvas');
const ctx = canvas.getContext('2d');

const ANGLE = Math.PI * 0.5;
const SEGMENT_WIDTH = 25;
const MAX_DEPTH = 4;

let depth = 0;
let path = '';

let winWidth;
let winHeight;
let midX;
let midY;

let rafId;

const clearStage = () => {
	ctx.clearRect(0, 0, canvas.width, canvas.height);
}

const setStage = () => {
	winWidth = window.innerWidth;
	winHeight = window.innerHeight;

	midX = winWidth * 0.5;
	midY = winHeight * 0.5;

	canvas.width = winWidth;
	canvas.height = winHeight;

	document.querySelector('.canvas-test').width = winWidth;
	document.querySelector('.canvas-test').height = winHeight;

	clearStage();
}

const copyPath = (rotation) => {
	drawSet();

	let newSet = set.slice();
	let lastPoint = newSet[newSet.length - 1];

	let startX = midX + lastPoint[0]; 
	let startY = midY + lastPoint[1];
	
	// ctx.save();
	ctx.beginPath();
	ctx.translate(startX, startY);

	ctx.rotate(rotation);

	ctx.strokeStyle = 'white';
	ctx.lineWidth = 1;

	ctx.moveTo(lastPoint[0], lastPoint[1]);

	let i = newSet.length - 1;
	let angleInc = Math.PI * 0.5;
	let angle = 0;

	while (i > 0) {
		let point = newSet[0];
		
		ctx.lineTo(point[0], point[1]);

		angle += angleInc;

		i--;
	}
	
	ctx.stroke();
	ctx.closePath();
	ctx.restore();
	ctx.setTransform(1, 0, 0, 1, 0, 0);
}

const getPoint = (pointStart, index) => {
	let angle = (Math.PI * 0.5) * index;
	let endX = pointStart[0] + (Math.cos(0) * SEGMENT_WIDTH);
	let endY = pointStart[1] + (Math.sin(0) * SEGMENT_WIDTH);

	return [endX, endY];
}

const drawSet = () => { 
	clearStage();
	
	ctx.save();
	ctx.translate(midX, midY);

	ctx.beginPath();
	ctx.lineWidth = 1;
	ctx.strokeStyle ='#ff0000';

	ctx.moveTo(set[0][0], set[0][1]);
	
	for (let i = 0; i < set.length; i++) {
		ctx.lineTo(set[i][0], set[i][1]);
	}

	ctx.stroke();
	ctx.closePath();

	ctx.restore();
}

const addPath = () => {
	update(set);
}

const update = (curvePath, x = 0, y = 0) => {
	let lastIndex = curvePath.length - 1;
	let lastPoint = curvePath[lastIndex];
	let newPoint = getPoint(lastPoint, lastIndex);
	
	set.push(newPoint);

	
	// drawPath(x, y);

	depth++;

	if (depth === 3) {
		copyPath();
	}

	if (depth < MAX_DEPTH) {
		update(set, x, y);
	}
	
	
}

window.addEventListener('resize', setStage);

setStage();

let ts = performance.now();

let set = [
	[0, 0]
];

update(set);
