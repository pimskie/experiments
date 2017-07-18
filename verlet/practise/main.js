const canvas = document.querySelector('canvas');
const ctx = canvas.getContext('2d');

const PI2 = Math.PI * 2;

const mouse = { x: 0, y: 0 };
const gravity = 0.3;
const friction = 0.99;

let w;
let wH;
let h;
let hH;

let points = [];
let sticks = [];

let tick = 0;
const tickSpeed = 0.005;

const distanceBetween = (p1, p2) => Math.sqrt((p1.x - p2.x) * (p1.x - p2.x) + (p1.y - p2.y) * (p1.y - p2.y));

const updateStage = () => {
	w = window.innerWidth;
	h = window.innerHeight;

	wH = w >> 1;
	hH = h >> 1;

	canvas.width = w;
	canvas.height = h;

	mouse.x = wH;
	mouse.y = hH;

	points = [];
	sticks = [];

	let startX = wH;
	let startY = hH;

	let numPoints = 20;

	points.push({ x: startX, y: startY, oldX: startX, oldY: startY, color: '#f371e7' });

	for (let i = 1; i < numPoints; i++) {
		points.push({ x: startX, y: startY, oldX: startX, oldY: startY, color: '#000' });
		startY += 30;
	}

	for (let i = 0; i < points.length - 1; i++) {
		sticks.push({
			from: points[i],
			to: points[i + 1],
			length: 10,
		});
	}
};

const onResize = () => {
	updateStage();
};

const updatePoints = () => {
	points.slice(1).forEach((body) => {
		const velX = body.x - body.oldX;
		const velY = body.y - body.oldY;

		body.oldX = body.x;
		body.oldY = body.y;

		body.x += velX;
		body.y += velY;
		body.y += gravity;
	});
};

const constrainPoints = () => {
	const point = points[0];

	point.oldX = point.x;
	point.oldY = point.y;

	point.x = mouse.x;
	point.y = mouse.y;
};

const draw = () => {
	// sticks.forEach((stick) => {
	// 	const { from, to } = stick;

	// 	ctx.beginPath();
	// 	ctx.strokeStyle = '#aaa';
	// 	ctx.moveTo(from.x, from.y);
	// 	ctx.lineTo(to.x, to.y);
	// 	ctx.stroke();
	// 	ctx.closePath();
	// });

	points.forEach((body, i) => {
		ctx.beginPath();
		ctx.strokeStyle = body.color;
		ctx.lineWidth = i === 0 ? 3 : 1;
		ctx.moveTo(body.oldX, body.oldY);
		ctx.lineTo(body.x, body.y);
		ctx.stroke();
		ctx.closePath();
	});
};

// https://www.youtube.com/watch?v=pBMivz4rIJY&t=4m10s
// the stick length is 100
// the distance between the points is 150
// the difference is -50
// the percentage the distance between the points has to alter is 0.5
// that is 0.25 per point
const updateSticks = () => {
	sticks.forEach((stick) => {
		const dx = stick.to.x - stick.from.x;
		const dy = stick.to.y - stick.from.y;

		const distance = distanceBetween(stick.from, stick.to);
		const difference = stick.length - distance;
		const percent = difference / distance / 2;
		const offsetX = dx * percent;
		const offsetY = dy * percent;

		if (stick.from !== points[0]) {
			stick.from.x -= offsetX;
			stick.from.y -= offsetY;
		}

		stick.to.x += offsetX;
		stick.to.y += offsetY;
	});
};

const clear = () => {
	ctx.fillStyle = 'rgba(255, 255, 255, 0.04)';
	ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
};

const loop = () => {
	clear();

	updatePoints();

	for (let i = 0; i < 3; i++) {
		updateSticks();
		constrainPoints();
	}

	draw();

	tick += tickSpeed;

	requestAnimationFrame(loop);
};


window.addEventListener('resize', onResize);
onResize();
loop();

const onPointerMove = (e) => {
	const target = (e.touches && e.touches.length) ? e.touches[0] : e;
	const { clientX: x, clientY: y } = target;

	mouse.x = x;
	mouse.y = y;
};

canvas.addEventListener('mousemove', onPointerMove);
canvas.addEventListener('touchmove', onPointerMove);
