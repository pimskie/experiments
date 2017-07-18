const DIM = 500;
const MID = DIM * 0.5;

const ratio = 1 / ((1 + Math.sqrt(5)) / 2);
const toRadian = (d) => d * (Math.PI / 180);
const toDegree = (r) => r * (180 / Math.PI);

const r90 = toRadian(90);

const canvas = document.querySelector('canvas');
const ctx = canvas.getContext('2d');

let angleModifier = 0;

canvas.width = DIM;
canvas.height = DIM;

const clear = () => {
	ctx.clearRect(0, 0, DIM, DIM);
}

const drawRect = (x, y, width, angle) => {
	let newW = (Math.cos(angle) * width) - (Math.sin(angle) * width);
	let newH = (Math.cos(angle) * width) + (Math.sin(angle) * width);

	let newX = x - (Math.sin(angle - r90) * width);
	let newY = y + (Math.cos(angle - r90) * width);

	drawArc(newX, newY, 3, 0, Math.PI * 2);

	ctx.strokeStyle = '#ccc';
	ctx.lineWidth = 1;
	ctx.beginPath();
	ctx.rect(x, y, newW, newH);
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
const MAX_DEPTH = 6;

const recurse = (centerX, centerY, r, angle, depth) => {
	if (depth === MAX_DEPTH) {
		return;
	}

	let angleTo = angle + r90;

	let newX = centerX - (Math.sin(angle - r90) * r);
	let newY = centerY + (Math.cos(angle - r90) * r);

	drawArc(newX, newY, 3, 0, Math.PI * 2);

	ctx.save();
	ctx.translate(centerX, centerY);
	ctx.rotate(rotation);
	drawRect(0, 0, r, angle);
	ctx.restore();

	// drawArc(centerX, centerY, r, angle, angleTo);

	newR = r * ratio;
	centerX += Math.cos(angleTo) * (r - newR);
	centerY += Math.sin(angleTo) * (r - newR);
	r = newR;
	angle = angleTo;
	// rotation = 0.001;

	recurse(centerX, centerY, r, angle, depth + 1);
}

const draw = () => {
	clear();
	recurse(MID, MID, MID, toRadian(0), 0);
}

const mouseMove = (e) => {
	let mouseX = e.pageX;
	let maxAngle = 20; // degrees;
	let percent = mouseX / DIM;
	let angleInc = maxAngle * percent;
}
canvas.addEventListener('mousemove', mouseMove);


draw();

