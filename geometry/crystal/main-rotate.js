const q = (sel) => document.querySelector(sel);

const canvas = q('canvas');
const ctx = canvas.getContext('2d');

const canvasGhost = document.createElement('canvas');
const ctxGhost = canvasGhost.getContext('2d');

const PI2 = Math.PI * 2;
const w = 500;
const h = 500;
const wh = w * 0.5;
const hh = h * 0.5;

canvas.width = canvasGhost.width = w;
canvas.height = canvasGhost.height = h;

const speed = 0.005;
const rectW = 300;
const rectH = 300;
const numCopies = 12;
const numGroups = 5;

const rects = [];

let groupSpeed = speed;

for (let i = 0; i < numGroups; i++) {
	const percent = (i) / numGroups;

	rects.push({
		rotation: Math.PI * percent,
		scale: (1 - ((1 * percent))),
		speed: groupSpeed,
		spread: Math.PI / 2 / numCopies,
		percent,
	});

	groupSpeed *= -1;
}

const color = '#ccc';

const clear = () => {
	ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
	ctxGhost.clearRect(0, 0, ctxGhost.canvas.width, ctxGhost.canvas.height);
};

const drawRectangle = (rotation, scale, percent) => {
	const r = 50 + ~~(205 * percent);
	const g = 0; //100 + ~~(155 * percent);
	const b = 0;

	ctx.save();
	ctx.translate(wh, hh);
	ctx.rotate(rotation);
	ctx.scale(scale, scale);

	ctx.strokeStyle = `#fff`;
	ctx.fillStyle = `rgba(${r}, ${g}, ${b}, 1)`;

	ctx.beginPath();
	ctx.rect(-rectW * 0.5, -rectH * 0.5, rectW, rectH);
	// ctx.stroke();
	ctx.fill();
	ctx.closePath();

	ctx.restore();
};

const drawGroup = (rect) => {
	const perc = 1 - rect.percent;

	drawRectangle(rect.rotation, rect.scale, perc);

	for (let i = 0; i < numCopies; i++) {
		drawRectangle(rect.rotation + (rect.spread * i), rect.scale, perc);
	}

	rect.rotation += rect.speed;
};

const drawCorners = () => {
	const r = 1;

	ctx.fillStyle = color;
	ctx.beginPath();
	ctx.arc(-rectW * 0.5, -rectH * 0.5, r * 2, 0, PI2, false);
	ctx.fill();
	ctx.closePath();

	ctx.beginPath();
	ctx.arc(rectW * 0.5, -rectH * 0.5, r * 2, 0, PI2, false);
	ctx.fill();
	ctx.closePath();

	ctx.beginPath();
	ctx.arc(rectW * 0.5, rectH * 0.5, r * 2, 0, PI2, false);
	ctx.fill();
	ctx.closePath();

	ctx.beginPath();
	ctx.arc(-rectW * 0.5, rectH * 0.5, r * 2, 0, PI2, false);
	ctx.fill();
	ctx.closePath();
};

const loop = () => {
	clear();

	rects.forEach(drawGroup);

	requestAnimationFrame(loop);
};

loop();
