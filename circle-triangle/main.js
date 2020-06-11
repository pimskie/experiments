// https://www.pinterest.com/pin/528398968760662762/
// https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/globalCompositeOperation

const ctx = document.querySelector('canvas').getContext('2d');
const size = 500;
const mid = { x: size * 0.5, y: size * 0.5 };
const tau = Math.PI * 2;

const operations = ['source-over', 'source-in', 'source-out', 'source-atop', 'destination-over', 'destination-in', 'destination-out', 'destination-atop', 'lighter', 'copy', 'xor', 'multiply', 'screen', 'overlay', 'darken', 'lighten', 'color-dodge', 'color-burn', 'hard-light', 'soft-light', 'difference', 'exclusion', 'hue', 'saturation', 'color', 'luminosity'];
const col = document.querySelector('input[type=color]');
const sel = document.querySelector('select');
sel.innerHTML = operations.map((op) => `<option value="${op}">${op}</option>`).join('');

const settings = {
	innerRadius: size * 0.2,
	innerPoints: 5,
	outerRadius: size * 0.45,
	outerPoints: 4,
	outerSpread: tau,
};

ctx.canvas.width = size;
ctx.canvas.height = size;

const clear = () => {
	ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
};

const background = () => {
	ctx.fillStyle = '#fff';

	ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height)
};

const drawInner = (points, color = '#000') => {
	ctx.save();
	ctx.translate(mid.x, mid.y);
	ctx.strokeStyle = color;
	ctx.fillStyle = color;

	ctx.beginPath();
	ctx.arc(0, 0, settings.innerRadius, 0, tau, false);
	ctx.closePath();
	ctx.fill();

	points.forEach((p) => {
		ctx.beginPath();
		ctx.arc(p.x, p.y, 3, 0, tau, false);
		ctx.closePath();
		ctx.fill();
	});

	ctx.restore();
};

const drawOuter = (innerPoints) => {
	for (let i = 0; i < settings.outerPoints; i++) {
		const a = (settings.outerSpread / settings.outerPoints) * i;

		const pos = {
			x: Math.cos(a) * settings.outerRadius,
			y: Math.sin(a) * settings.outerRadius,
		};

		connectDots(pos, innerPoints);
	}
};

const connectDots = (from, points) => {
	ctx.save();
	ctx.translate(mid.x, mid.y);

	ctx.strokeStyle = col.value;

	points.forEach((point) => {
		ctx.beginPath();
		ctx.moveTo(from.x, from.y);
		ctx.lineTo(point.x, point.y);
		ctx.stroke();
		ctx.closePath();
	});

	ctx.restore();
};

const draw = () => {
	const points = new Array(settings.innerPoints).fill().map((_, i) => {
		const a = (tau / settings.innerPoints) * i;

		return {
			x: Math.cos(a) * settings.innerRadius,
			y: Math.sin(a) * settings.innerRadius,
		};
	});

	clear();

	drawInner(points);

	ctx.globalCompositeOperation = 'xor'

	drawOuter(points);
};

gsap.defaults({
	duration: 2,
	onUpdate: draw,
});

const tl = gsap.timeline();
tl.fromTo(settings, { innerRadius: 0 }, { innerRadius: size * 0.2, ease: 'back.out(1.4)' });
tl.fromTo(settings, { innerPoints: 0 }, { innerPoints: 15, snap: 'innerPoints' });
tl.fromTo(settings, { outerRadius: 0 }, { outerRadius: size * 0.4, duration: 2 });

// tl.to(settings, { innerRadius: size * 0.3 });

tl.to(settings, { outerPoints: 12, duration: 3, snap: 'outerPoints' });
// tl.to(settings, { innerRadius: size * 0.5, duration: 3 });

sel.addEventListener('change', (e) => {
	draw();
});

col.addEventListener('input', (e) => {
	draw();
});
