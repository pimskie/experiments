const canvas = document.querySelector('canvas');
const ctx = canvas.getContext('2d');

const PI2 = Math.PI * 2;

const mouse = { x: 0, y: 0 };
const gravity = 0.1;
const friction = 0.99;

let w;
let wH;
let h;
let hH;

let points = [];
let sticks = [];

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

	const numPoints = 30;
	const r = 40;

	let startX = wH;
	let startY = hH;

	points.push({ x: startX, y: startY, oldX: startX, oldY: startY });

	for (let i = 1; i < numPoints; i++) {
		startX += (Math.cos(Math.random() * PI2) * r);
		startY += (Math.sin(Math.random() * PI2) * r);

		points.push({ x: startX, y: startY, oldX: startX, oldY: startY });
	}

	for (let i = 0; i < points.length - 1; i++) {
		const p0 = points[i];
		const p1 = points[i + 1];
		const length = 20; // distanceBetween(p0, p1);

		sticks.push({ p0, p1, length });
	}

	const p0 = points[points.length - 1];
	const p1 = points[0];
	const length = 50;

	sticks.push({ p0, p1, length });
};

const onResize = () => {
	updateStage();
};

const updatePoints = () => {
	points.forEach((body) => {
		const velX = body.x - body.oldX;
		const velY = body.y - body.oldY;

		body.oldX = body.x;
		body.oldY = body.y;

		body.x += velX * friction;
		body.y += velY * friction;
		body.y += gravity;
	});
};

const constrainPoints = () => {
	points.slice(1).forEach((body) => {
		const velX = body.x - body.oldX;
		const velY = body.y - body.oldY;

		if (body.x < 0) {
			body.x = 0;
			body.oldX = body.x + velX;
		} else if (body.x > w) {
			body.x = w;
			body.oldX = body.x + velX;
		}

		if (body.y < 0) {
			body.y = 0;
			body.oldY = body.y + velY;

		} else if (body.y > h) {
			body.y = h;
			body.oldY = body.y + velY;
		}
	});


	points[0].x = mouse.x;
	points[0].y = mouse.y;
};

const draw = () => {
	sticks.forEach((stick) => {
		const { p0, p1 } = stick;

		ctx.beginPath();
		ctx.lineWidth = 8;
		ctx.moveTo(p0.x, p0.y);
		ctx.lineTo(p1.x, p1.y);
		ctx.stroke();
		ctx.closePath();
	});

	points.forEach((body) => {
		ctx.beginPath();
		ctx.fillStyle = '#000';
		ctx.arc(body.x, body.y, 5, 0, PI2, false);
		ctx.fill();
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
		const dx = stick.p1.x - stick.p0.x;
		const dy = stick.p1.y - stick.p0.y;

		const distance = distanceBetween(stick.p0, stick.p1);
		const difference = stick.length - distance;
		const percent = difference / distance / 2;
		const offsetX = dx * percent;
		const offsetY = dy * percent;

		stick.p0.x -= offsetX;
		stick.p0.y -= offsetY;

		stick.p1.x += offsetX;
		stick.p1.y += offsetY;
	});
};

const clear = () => {
	ctx.fillStyle = 'rgba(255, 255, 255, 1)';
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
