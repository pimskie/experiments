const DIM = 500;
const MID = DIM * 0.5;

const ratio = 1 / ((1 + Math.sqrt(5)) / 2);
const toRadian = (d) => d * (Math.PI / 180);
const toDegree = (r) => r * (180 / Math.PI);
const r90 = toRadian(90);
const r45 = toRadian(45);

const canvas = document.querySelector('canvas');
const ctx = canvas.getContext('2d');

let angleModifier = 0;

canvas.width = DIM;
canvas.height = DIM;

const clear = () => {
	ctx.clearRect(0, 0, DIM, DIM);
}

const getRect = (x, y, width, angle) => {
	// let anchorFrom = {
	// 	x: Math.sin(angle + r90) * width,
	// 	y: Math.cos(angle + r90) * width
	// };

	// let anchorTo = {
	// 	x: Math.sin(angle + r90 + r90) * width,
	// 	y: -Math.cos(angle + r90 + r90) * width
	// };

	// let pos = { x, y };

	// return {
	// 	anchorFrom,
	// 	anchorTo,
	// 	pos,
	// 	width: (Math.sin(angle) * width) - (Math.cos(angle) * width),
	// 	height: (Math.cos(angle) * width) - (Math.sin(angle) * width),
	// 	angle
	// }

	let anchorFrom = {
		x: Math.cos(angle) * width,
		y: Math.sin(angle) * width
	};

	return { x, y, width, anchorFrom, angle };
}

const drawRect = (x, y, width, height) => {
	ctx.strokeStyle = '#ccc';
	ctx.lineWidth = 1;
	ctx.beginPath();
	ctx.rect(x, y, width, height);
	ctx.stroke();
	ctx.closePath();
}

const drawArc = (x, y, r, startAngle, endAngle) => {
	ctx.strokeStyle = '#fff';
	ctx.lineWidth = 1;
	ctx.beginPath();
	ctx.arc(x, y, r, startAngle, endAngle, false);
	ctx.stroke();
	ctx.closePath();

};

let rotation = 0;
let rotationStep = 0;

const MAX_DEPTH = 6;

const recurse = (left, top, width, angle, depth) => {
	if (depth === MAX_DEPTH) {
		return;
	}

	let anchorX = width; // Math.cos(angle) * width;
	let anchorY = width * 0.5; //Math.sin(angle) * width;

	let anchorRealX = left + (Math.cos(rotation + angle) * width);
	let anchorRealY = top + (Math.sin(rotation + angle) * width);

	ctx.save();
	ctx.translate(left, top);
	ctx.rotate(rotation);
	rotation -= rotationStep;
	drawRect(0, 0, width, width);
	ctx.restore();

	drawArc(anchorRealX, anchorRealY, 3, 0, Math.PI * 2);
	left = anchorRealX;
	top = anchorRealY;

	// angle += r45;
	width *= 0.9;

	recurse(left, top, width, angle, depth + 1);
}

const draw = () => {
	clear();
	rotation = 0;
	recurse(10, 100, 100, toRadian(0), 0);
}

const mouseMove = (e) => {
	let padding = 20;
	let mouseX = e.pageX;
	let maxAngle = 360;
	let percent = (mouseX - padding) / (DIM - 2 * padding);
	let angleInc = 180 - (maxAngle * percent);

	rotationStep = toRadian(angleInc);
	draw();

}

canvas.addEventListener('mousemove', mouseMove);
draw();