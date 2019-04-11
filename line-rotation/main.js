// https://ptsjs.org/

const TAU = Math.PI * 2;
const w = 500;
const h = 500;
const wh = w >> 1;
const hh = h >> 1;
const hypo = Math.hypot(w, h);

const ctxDraw = document.querySelector('.js-draw').getContext('2d');
const ctxGhost = document.querySelector('.js-ghost').getContext('2d');

const numLines = 100;
const speed = 0.001;

let lines = [];
let phase = 0;

ctxDraw.canvas.width = ctxGhost.canvas.width = w;
ctxDraw.canvas.height = ctxGhost.canvas.height = h;

const generate = () => {
	lines = [];

	for (let i = 0; i < numLines; i++) {
		const a = Math.random() * Math.PI;
		const x = w * Math.random();
		const y = hh;
		const r = (wh * 0.75) * Math.cos(a);

		lines.push({ x, y, a, r });
	}
};

const draw = () => {
	ctxGhost.clearRect(0, 0, w, h);
	ctxDraw.clearRect(0, 0, w, h);

	lines.forEach((line) => {
		line.a += speed;
		line.r = (wh * 0.75) * Math.cos(line.a);

		const toX = line.x + (Math.cos(Math.PI / 2) * line.r);
		const toY = line.y + (Math.sin(Math.PI / 2) * line.r);

		ctxGhost.beginPath();
		ctxGhost.moveTo(line.x, line.y);
		ctxGhost.lineTo(toX, toY);
		ctxGhost.stroke();
		ctxGhost.closePath();

		if (Math.cos(line.a) > 0) {
			line.x += 0.1;
		} else {
			line.x -= 0.1;
		}

		if (line.x > w) {
			line.x = 0;
		}

		if (line.x < 0) {
			line.x = w;
		}
	});

	// ctxDraw.save();
	// ctxDraw.translate(wh, hh);
	// ctxDraw.drawImage(ctxGhost.canvas, -wh, -hh, wh, h);
	// ctxDraw.restore();
};

const loop = () => {
	draw();

	requestAnimationFrame(loop);
};

generate();
loop();

document.body.addEventListener('click', () => {
	generate();
});
