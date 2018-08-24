import * as Utils from 'https://rawgit.com/pimskie/utils/master/utils.js';

const ctx = Utils.qs('canvas').getContext('2d');

const PI = Math.PI;
const QUART = PI / 2; // lol
const TAU = PI * 2;

const W = 500;
const H = 500;
const MID_X = W * 0.5;
const MID_Y = H * 0.5;

ctx.canvas.width = W;
ctx.canvas.height = H;

const LINE_WIDTH = 30;
const R = 30;
const R2 = R * 2;
const CIRCLE_R = R;

const drawLine = (from, to) => {
	ctx.beginPath();
	ctx.lineWidth = 0.5;

	ctx.moveTo(from.x, from.y);
	ctx.lineTo(to.x, to.y);

	ctx.stroke();
	ctx.closePath();
};

const drawGrid = (width, height, size) => {
	let y = 0;

	for (let x = 0; x <= width; x += size) {
		const from = { x, y: 0 };
		const to = { x, y: height };

		drawLine(from, to);
	}

	for (let y = 0; y <= height; y += size) {
		const from = { x: 0, y };
		const to = { x: width, y };

		drawLine(from, to);
	}
};

const drawSegment = (x, y, startAngle, endAngle, acw, lineWidth, color) => {
	ctx.beginPath();
	ctx.lineWidth = lineWidth;
	ctx.strokeStyle = color;
	ctx.arc(x, y, CIRCLE_R, startAngle, endAngle, acw);
	ctx.stroke();
	ctx.closePath();
};

const drawShape = (x, y, startAngle, endAngle, acw = false) => {
	ctx.strokeStyle = '#' + ((1<<24)*Math.random()|0).toString(16);

	drawSegment(x, y, startAngle, endAngle, acw, LINE_WIDTH, 'black');
	drawSegment(x, y, startAngle, endAngle, acw, LINE_WIDTH - 4, 'white');
};


drawGrid(W, H, R);

let x = MID_X - R;
let y = MID_Y - R;
let startAngle = 0;
let endAngle = startAngle + QUART;
let acw = false;

drawShape(x, y, startAngle, endAngle, false);

const iterate = (changeDir) => {
	if (changeDir) {
		acw = !acw;
	}

	startAngle = changeDir ? endAngle - PI : endAngle;

	if (startAngle === -PI) {
		startAngle = PI;
	}

	endAngle = acw ? startAngle - QUART : startAngle + QUART;

	if (changeDir) {
		x -= Math.cos(startAngle) * R2;
		y -= Math.sin(startAngle) * R2;
	}

	if (Math.abs(startAngle) === TAU) {
		endAngle = -QUART;
		startAngle = 0;
	}


	drawShape(x, y, startAngle, endAngle, acw);

	// console.log(acw, Utils.toDegrees(startAngle), Utils.toDegrees(endAngle));

};

const clear = () => {
	ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
};

const loop = () => {
	// clear();

	let changeDir = Math.random() > 0.4;


	iterate(changeDir);

	requestAnimationFrame(loop);
};

loop();
