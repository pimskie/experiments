const angleBetween = (vec1, vec2) => Math.atan2(vec2.y - vec1.y, vec2.x - vec1.x);
const distanceBetween = (vec1, vec2) => Math.hypot(vec2.x - vec1.x, vec2.y - vec1.y);

const c = document.querySelector('canvas');
const ctx = c.getContext('2d');

const size = 500;
const mid = { x: size * 0.5, y: size * 0.5 };
const hypo = distanceBetween({ x: 0, y: 0 }, mid);

const cols = 30;
const spacing = size / cols;

c.width = size;
c.height = size;

const update = (dots) => {
	ctx.clearRect(0, 0, size, size);

	dots.forEach((dot) => {
		const { p, a, r, s } = dot;

		const { x, y } = p;
		const d = distanceBetween(mid, p);

		const x1 = x + (Math.cos(a) * r);
		const y1 = y + (Math.sin(a) * r);
		const s1 = s + ((d / hypo) * 4);

		dot.a += 0.001;

		draw({x: x1, y: y1, s: s1 });
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
	const x = (spacing / 2) + (i % cols) * spacing;
	const y = (spacing / 2) + Math.floor(i / cols) * spacing;

	const p = { x, y };
	const a = angleBetween(p, mid);
	const r = 0;
	const s = 1;

	const dot = { p, a, r, s };

	return dot;
});

const stagger = {
	from: 'edges',
	amount: 5,
	grid: [cols, cols],
};

gsap.fromTo(dots, { r: 0 }, { r: size * 0.75, yoyo: true, repeat: -1, ease: 'circ.inOut', repeatDelay: 0, stagger, onUpdate() {
	update(dots);
} });

