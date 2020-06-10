const distanceBetween = (vec1, vec2) => Math.hypot(vec2.x - vec1.x, vec2.y - vec1.y);

const ctx = document.querySelector('canvas').getContext('2d');

const size = 500;
const mid = { x: size * 0.5, y: size * 0.5 };
const hypo = distanceBetween({ x: 0, y: 0 }, mid);

const cols = 30;
const spacing = size / cols;

ctx.canvas.width = size;
ctx.canvas.height = size;

const update = (dots) => {
	ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

	dots.forEach((dot) => {
		const { p: { x, y }, a, r } = dot;

		const x1 = x + (Math.cos(a) * r);
		const y1 = y + (Math.sin(a) * r);
		const d = Math.min(hypo, distanceBetween(mid, { x: x1, y: y1 }));
		const s = 2 * (1 - (d / hypo));

		draw({x: x1, y: y1, s });
	});
};

const draw = ({ x, y, s }) => {
	ctx.beginPath();
	ctx.fillStyle = '#fff';
	ctx.arc(x, y, s, 0, Math.PI * 2, false);
	ctx.fill();
	ctx.closePath();
};

const dots = new Array(cols * cols).fill().map((_, i) => {
	const x = (spacing * 0.5) + (i % cols) * spacing;
	const y = (spacing * 0.5) + Math.floor(i / cols) * spacing;

	const p = { x, y };
	const a = Math.atan2(mid.y - p.y, mid.x - p.x);
	const r = 0;

	const dot = { p, a, r };

	return dot;
});

const stagger = {
	from: 'edges',
	amount: 0.4,
	grid: [cols, cols],
	onUpdate() {
		const [target] = this.targets();

	},
};

gsap.fromTo(dots, { r: 0 }, { r: -100, yoyo: true, repeat: -1, repeatDelay: 0, ease: 'circ.inOut', stagger, onUpdate() {
	update(dots);
} });
