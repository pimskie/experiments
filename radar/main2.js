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
	strokeFill.addColorStop(0.5, "rgba(0, 0, 0, 1)");
	strokeFill.addColorStop(1, "rgba(0, 0, 0, 0.2)");

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
	ctx.strokeStyle = "rgba(0, 0, 0, 0.2)";
	ctx.moveTo(fromX, fromY);
	ctx.lineTo(toX, toY);
	ctx.stroke();
	ctx.closePath();
	ctx.restore();
};

const loop = () => {
	clear();

	const a1 = phase * 0.04;
	const a2 = a1 + Math.PI / 2;

	const c1 = { x: MX + 50, y: MY - 50, a: a2 };
	const c2 = { x: MX + 50, y: MY + 50, a: a2 * -1 };
	const c3 = { x: MX - 50, y: MY + 50, a: a1 };
	const c4 = { x: MX - 50, y: MY - 50, a: a1 * -1 };

	draw(c1);
	draw(c2);
	draw(c3);
	draw(c4);

	connect(c1, c2);
	connect(c2, c3);
	connect(c3, c4);
	connect(c4, c1);

	phase++;

	requestAnimationFrame(loop);
};

loop();
