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

const speed = 0.01;
const rectW = 300;
const rectH = 300;
let numCopies = 5;
let numGroups = 12;

let phase = 0;
let tick = 0;
let angle = 0;

const color = '#ccc';

const map = (value, start1, stop1, start2, stop2) => ((value - start1) / (stop1 - start1)) * (stop2 - start2) + start2;

const clear = () => {
	ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
	ctxGhost.clearRect(0, 0, ctxGhost.canvas.width, ctxGhost.canvas.height);
};

const drawRectangle = () => {
	ctxGhost.strokeStyle = color;
	ctxGhost.fillStyle = 'rgba(233, 0, 0, 1)';
	ctxGhost.beginPath();
	ctxGhost.rect(-rectW * 0.5, -rectH * 0.5, rectW, rectH);
	ctxGhost.stroke();
	ctxGhost.fill();
	ctxGhost.closePath();

	drawCorners();
};

const drawCorners = () => {
	const r = 1;

	ctxGhost.fillStyle = color;
	ctxGhost.beginPath();
	ctxGhost.arc(-rectW * 0.5, -rectH * 0.5, r * 2, 0, PI2, false);
	ctxGhost.fill();
	ctxGhost.closePath();

	ctxGhost.beginPath();
	ctxGhost.arc(rectW * 0.5, -rectH * 0.5, r * 2, 0, PI2, false);
	ctxGhost.fill();
	ctxGhost.closePath();

	ctxGhost.beginPath();
	ctxGhost.arc(rectW * 0.5, rectH * 0.5, r * 2, 0, PI2, false);
	ctxGhost.fill();
	ctxGhost.closePath();

	ctxGhost.beginPath();
	ctxGhost.arc(-rectW * 0.5, rectH * 0.5, r * 2, 0, PI2, false);
	ctxGhost.fill();
	ctxGhost.closePath();
};

const loop = () => {
	clear();

	ctx.globalCompositeOperation = 'lighter';

	for (let i = 0; i < numCopies; i++) {
		const copyAngle = (Math.PI / 2) * (i / numCopies);

		ctxGhost.save();
		ctxGhost.translate(wh, hh);
		ctxGhost.rotate(copyAngle);
		drawRectangle();
		ctxGhost.restore();
	}

	for (let i = 0; i < numGroups; i++) {
		const groupAngle = i % 2 === 0 ? angle : -angle;
		const groupScale = (1 * ((i + 1) / numGroups));

		ctx.save();
		ctx.translate(wh, hh);
		ctx.rotate(groupAngle);
		ctx.scale(groupScale, groupScale);
		ctx.drawImage(canvasGhost, -wh, -hh);
		ctx.restore();
	}

	angle += 0.005;
	tick += 0.005;

	requestAnimationFrame(loop);
};

loop();
