const q = (sel) => document.querySelector(sel);

const canvas = q('canvas');
const ctx = canvas.getContext('2d');
const PI2 = Math.PI * 2;

const width = 500;
const height = 500;
const midX = width * 0.5;
const midY = height * 0.5;

const n = 2;
const d = 6;

let r = midX;

let rotation = 0;

canvas.width = width;
canvas.height = height;

const angleBetween = (x1, y1, x2, y2) => Math.atan2(y2 - y1, x2 - x1);

const rose = (t, r, n, d) => {
	const k = n / d;

	return {
		x: r * (Math.cos(k * t) * Math.cos(t)),
		y: r * (Math.cos(k * t) * Math.sin(t)),
	};
};

const clear = () => {
	ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
};


const curve = PI2;
const curveHalf = curve / 2;
const maxDiffR = r * 0.9;

const loop = () => {
	// clear();

	let p1 = [];
	let p2 = [];

	for (let i = 0; i < curve; i += 0.1) {
		// halfway is 100%
		const percent = 1 - Math.abs(i - curveHalf) / (curveHalf);

		const point = {
			x: Math.cos(i) * r,
			y: Math.sin(i) * r,
		};

		p1.push(point);

		const firstPoint = p1[0];
		const angle = angleBetween(firstPoint.x, firstPoint.y, point.x, point.y);

		const p2X = point.x - (Math.cos(angle) * (percent * maxDiffR));
		const p2Y = point.y - (Math.sin(angle) * (percent * maxDiffR));

		p2.push({ x: p2X, y: p2Y });
	}

	p2.reverse();

	const pointsAll = p1.concat(p2);

	ctx.save();
	ctx.fillStyle= '#'+((1<<24)*Math.random()|0).toString(16);
	ctx.translate(midX, midY);
	ctx.rotate(rotation);
	ctx.beginPath();

	ctx.moveTo(pointsAll.x, pointsAll.y);

	for (let i = 1; i < pointsAll.length; i++) {
		ctx.lineTo(pointsAll[i].x, pointsAll[i].y);
	}

	ctx.fill();
	ctx.closePath();
	ctx.restore();

	rotation += 0.2;
	r -= 0.2;

	setTimeout(() => {
		loop();
	}, 500);
};

loop();
