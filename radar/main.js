const ctx = document.querySelector(".js-canvas").getContext("2d");
const { canvas } = ctx;

const TAU = Math.PI * 2;
const W = 500;
const H = 500;

const MX = W >> 1;
const MY = H >> 1;

const WIDTH = W * 0.2;

let phase = 1;

canvas.width = W;
canvas.height = H;

const clear = () => {
	ctx.fillStyle = "rgba(255, 255, 255, 0.03)";
	ctx.fillRect(0, 0, W, H);
};

const draw = ({ x, y, a }) => {
	const toX = Math.cos(a) * WIDTH;
	const toY = Math.sin(a) * WIDTH;

	ctx.save();
	ctx.translate(x, y);

	const strokeFill = ctx.createLinearGradient(0, 0, toX, toY);
	strokeFill.addColorStop(0, "rgba(0, 0, 0, 1)");
	strokeFill.addColorStop(1, "rgba(0, 0, 0, 0.0)");

	ctx.beginPath();
	ctx.lineWidth = 2;
	ctx.strokeStyle = strokeFill;
	ctx.moveTo(0, 0);
	ctx.lineTo(toX, toY);
	ctx.stroke();
	ctx.closePath();
	ctx.restore();
};

const connect = (c1, c2) => {
	const fromX = c1.x + Math.cos(c1.a) * WIDTH;
	const fromY = c1.y + Math.sin(c1.a) * WIDTH;

	const toX = c2.x + Math.cos(c2.a) * WIDTH;
	const toY = c2.y + Math.sin(c2.a) * WIDTH;

	ctx.beginPath();
	ctx.strokeStyle = "rgba(0, 0, 0, 0.02)";
	ctx.moveTo(fromX, fromY);
	ctx.lineTo(toX, toY);
	ctx.stroke();
	ctx.closePath();
	ctx.restore();
};

const loop = () => {
	clear();
	const numCircles = 50;
	const radiusMain = W * 0.15;
	const circleStep = (Math.PI * 2) / numCircles;

	let a = phase * 0.04;

	const circles = Array.from({ length: numCircles }).map((_, i) => {
		const midX = MX + Math.cos(phase * 0.01) * 20;
		const midY = MY + Math.sin(phase * 0.01) * 20;
		const midR = radiusMain + Math.sin(phase * 0.01) * 20;

		const c = {
			x: midX + Math.cos(circleStep * i) * midR,
			y: midY + Math.sin(circleStep * i) * midR,
			a,
		};

		a += circleStep * 0.5;

		return c;
	});

	circles.forEach((c, index) => {
		const indexNext = index < circles.length - 1 ? index + 1 : 0;

		draw(c);
		// connect(c, circles[indexNext]);
	});

	phase++;

	requestAnimationFrame(loop);
};

loop();
