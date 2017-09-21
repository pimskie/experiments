const q = (sel) => document.querySelector(sel);

const canvas = q('canvas');
const ctx = canvas.getContext('2d');
const PI2 = Math.PI * 2;

// all set in `setStage`
const w = 500;
const h = 500;
const wh = w * 0.5;
const hh = h * 0.5;

canvas.width = w;
canvas.height = h;

const offset = 55;
const amp = 100;
const width = offset + amp;
const height = 150;
const halfHeight = height * 0.5;


const clear = () => {
	ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
};


ctx.strokeStyle = '#000';
ctx.fillStyle = 'red';

const sloppyOffset = 90;
let startX = w - sloppyOffset;
let startY = 0;
let scale = 1;
let angle = 0;

const scaleInc = 0.1;
const xInc = -20;
const yInc = 20;
const numLoops = 10;
const angleInc = 0.3; // Math.PI / numLoops;

// // anchor left top
for (let i = 0; i < numLoops; i++) {
	ctx.save();
	ctx.translate(startX, startY);
	ctx.rotate(angle);
	ctx.scale(scale, scale);

	ctx.beginPath();
	ctx.fillStyle = 'red';
	ctx.moveTo(offset, 0);
	ctx.bezierCurveTo(width, 90, offset - 60, 100, offset - 20, height);
	ctx.bezierCurveTo(offset - 120, 65, offset + 30, 50, offset, 0);
	ctx.fill();
	ctx.stroke();
	ctx.closePath();
	ctx.restore();

	scale += scaleInc;
	angle += angleInc;

	startX += xInc;
	startY += yInc;
}
