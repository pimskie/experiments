const distanceBetween = (vec1, vec2) => Math.hypot(vec2.x - vec1.x, vec2.y - vec1.y);

const ctx = document.querySelector('canvas').getContext('2d');

const size = 500;
const mid = { x: size * 0.5, y: size * 0.5 };
const hypo = distanceBetween({ x: 0, y: 0 }, mid);

const cols = 20;
const spacing = size / cols;

ctx.canvas.width = size;
ctx.canvas.height = size;

const update = (dots) => {
	ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

	dots.forEach((dot, i) => {
		const { p: { x, y }, a, r } = dot;

		const x1 = x + (Math.cos(a) * r);
		const y1 = y + (Math.sin(a) * r);

		const d = Math.min(hypo, distanceBetween(mid, { x: x1, y: y1 }));
		const s = 4 * (1 - (d / hypo));

		dot.p2 = { x: x1, y: y1 };
		dot.d = d;

		draw({x: x1, y: y1, s });
	});
};

const connect = (dots) => {
	dots.forEach((dot, i) => {
		const row = Math.floor(i / cols);
		const nextRow = Math.floor((i + 1) / cols);

		const right = row === nextRow && dots[i + 1];
		const below = dots[i + cols];

		if (right) {
			drawLine(dot, right);
		}

		if (below) {
			drawLine(dot, below);
		}
	});
};

const draw = ({ x, y, s }) => {
	ctx.beginPath();
	ctx.strokeStyle = '#fff';
	ctx.fillStyle = '#fff';
	ctx.lineWidth = 1;

	ctx.arc(x, y, s, 0, Math.PI * 2, false);
	ctx.closePath();
	ctx.fill();
};

const drawLine = (dotA, dotB) => {
	ctx.beginPath();
	ctx.lineWidth = 1 - (dotA.d / hypo);
	ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
	ctx.moveTo(dotA.p2.x, dotA.p2.y);
	ctx.lineTo(dotB.p2.x, dotB.p2.y);
	ctx.stroke();
	ctx.closePath();
};


const dots = new Array(cols * cols).fill().map((_, i) => {
	const p = {
		x: (spacing * 0.5) + (i % cols) * spacing,
		y: (spacing * 0.5) + Math.floor(i / cols) * spacing,
	};

	const a = Math.atan2(mid.y - p.y, mid.x - p.x);

	const dot = { p, a, r: 0 };

	return dot;
});

const stagger = {
	from: 'center',
	amount: 0.4,
	grid: [cols, cols],
	onUpdate() {
		const [target] = this.targets();

	},
};

gsap.fromTo(
	dots,
	{
		r: 0
	},
	{
		r: -100,
		yoyo: true,
		repeat: -1,
		repeatDelay: 0,
		ease: 'circ.inOut',
		stagger,
		onUpdate() {
			update(dots);
			connect(dots);
		}
	}
);
