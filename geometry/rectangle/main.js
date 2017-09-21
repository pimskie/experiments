const q = (sel) => document.querySelector(sel);

const canvas = q('canvas');
const ctx = canvas.getContext('2d');

const PI2 = Math.PI * 2;
const w = 500;
const h = 500;
const wh = w * 0.5;
const hh = h * 0.5;

let numCopies = 14;
let numGroups = 5;

const colorLight = '#fff';
const colorDark = '#f7f8f9';

let groupRotationInc = 0.1;
let autoRotate = 0;
let autoAnimate = true;
let tick = 0;

const map = (value, start1, stop1, start2, stop2) => ((value - start1) / (stop1 - start1)) * (stop2 - start2) + start2;

const clear = () => {
	ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
};

const drawShape = (rotate, scaleX, scaleY) => {
	ctx.save();
	ctx.translate(wh, hh);
	ctx.rotate(rotate);
	ctx.scale(scaleX, scaleY);
	ctx.lineCap = 'square';

	ctx.beginPath();
	ctx.fillStyle = colorLight;
	ctx.strokeStyle = '#bab8b8';

	ctx.moveTo(0, 0);
	ctx.lineTo(-25, -150);
	ctx.lineTo(0, -180);
	ctx.lineTo(0, 0);
	ctx.fill();
	ctx.stroke();
	ctx.closePath();

	ctx.beginPath();
	ctx.fillStyle = colorDark;

	ctx.moveTo(0, 0);
	ctx.lineTo(25, -150);

	// bleeeh, but prevents a gap
	ctx.lineTo(0, -180);
	ctx.lineTo(0, 0);
	ctx.fill();
	ctx.stroke();
	ctx.closePath();

	ctx.restore();

};

const drawGroup = (index, percent, scale, baseRotation) => {
	const rotateInc = PI2 / numCopies;
	const scaleX = (index % 2 === 0) ? scale : -scale;
	const scaleY = scale;

	for (let i = 0; i < numCopies; i++) {
		const rotate = baseRotation + (rotateInc * i);
		drawShape(rotate, scaleX, scaleY);
	}
};

const loop = () => {
	clear();

	let scale = 1;
	let baseRotation = autoRotate;
	const scaleMod = 1 / numGroups;

	const phase = map(Math.sin(tick), -1, 1, 0, 1);

	if (autoAnimate) {
		numGroups = 2 + (10 * phase);
		groupRotationInc = phase;
	}

	for (let i = 0; i < numGroups; i++) {
		drawGroup(i, (i + 1) / numGroups, scale, baseRotation);

		scale -= scaleMod;
		baseRotation += groupRotationInc;
	}

	autoRotate += 0.001;
	tick += 0.01;

	requestAnimationFrame(loop);
};

const onPointerOver = () => {
	autoAnimate = false;
};

const onPointerMove = (e) => {
	const event = (e.touches && e.touches.length) ? e.touches[0] : e;
	const { target, clientX: pointerX, clientY: pointerY } = event;

	const percX = ((pointerX - target.offsetLeft) / w);
	const percY = ((pointerY - target.offsetTop) / h);

	groupRotationInc = percX;
	numGroups = percY * 10;
};

const onPointerLeave = () => {
	autoAnimate = true;
	groupRotationInc = 0.1;
};

canvas.addEventListener('mouseenter', onPointerOver);
canvas.addEventListener('touchstart', onPointerOver);

canvas.addEventListener('mousemove', onPointerMove);
canvas.addEventListener('touchmove', onPointerMove);

canvas.addEventListener('mouseout', onPointerLeave);
canvas.addEventListener('touchend', onPointerLeave);

loop();
