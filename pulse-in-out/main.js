const angleBetween = (vec1, vec2) => Math.atan2(vec2.y - vec1.y, vec2.x - vec1.x);

const c = document.querySelector('canvas');
const ctx = c.getContext('2d');

const size = 500;
const mid = { x: size * 0.5, y: size * 0.5 };

const cols = 30;
const spacing = size / cols;

c.width = size;
c.height = size;

const update = (dots) => {
	ctx.clearRect(0, 0, size, size);

	dots.forEach(({ p1, a, r }) => {
		const { x, y } = p1;
		const x1 = x + (Math.cos(a) * r);
		const y1 = y + (Math.sin(a) * r);

		draw({x: x1, y: y1 });
	});
};

const draw = ({ x, y }) => {
	ctx.beginPath();
	ctx.fillStyle = '#fff';
	ctx.arc(x, y, 2, 0, Math.PI * 2, false);
	ctx.fill();
	ctx.closePath();
};

const dots = new Array(cols * cols).fill().map((_, i) => {
	const x = (spacing / 2) + (i % cols) * spacing;
	const y = (spacing / 2) + Math.floor(i / cols) * spacing;

	const p1 = { x, y };
	const p2 = { x, y };

	const a = angleBetween(p1, mid);
	const r = 0;
	const dot = { p1, p2, a, r };

	return dot;
});

const stagger = {
	from: 'edges',
	amount: 1,
	grid: [cols, cols],
};

gsap.fromTo(dots, { r: 0 }, { r: spacing * 2, duration: 0.5, yoyo: true, repeat: -1, ease: 'circ.inOut', repeatDelay: 0, stagger, onUpdate() {
	update(dots);
} });

