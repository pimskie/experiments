const size = 250;
const mid = { x: size * 0.5, y: size * 0.5 };

const operations = ['source-over', 'source-in', 'source-out', 'source-atop', 'destination-over', 'destination-in', 'destination-out', 'destination-atop', 'lighter', 'copy', 'xor', 'multiply', 'screen', 'overlay', 'darken', 'lighten', 'color-dodge', 'color-burn', 'hard-light', 'soft-light', 'difference', 'exclusion', 'hue', 'saturation', 'color', 'luminosity'];
const col = document.querySelector('input[type=color]');
const sel = document.querySelector('select');
sel.innerHTML = operations.map((op) => `<option value="${op}">${op}</option>`).join('');

const sel2 = sel.cloneNode(true);
document.body.appendChild(sel2);

const ctxs = new Array(3).fill().map((_, i) => {
	const c = document.createElement('canvas');
	c.width = size;
	c.height = size;

	document.body.append(c);

	const ctx = c.getContext('2d');
	return ctx;
});

const [ctx, ctx2, ctx3] = ctxs;
const tau = Math.PI * 2;

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

const circle = (dest, fill = '#000') => {
	dest.fillStyle = fill;
	dest.beginPath();
	dest.arc(mid.x, mid.y, 100, 0, tau, false);
	dest.fill();
	dest.closePath();
};

const line = (dest, color = '#000') => {
	const r = size * 0.75;
	const step = tau / 20; // settings.outerPoints;

	dest.strokeStyle = color;
	dest.lineWidth = 1;
	dest.save();
	dest.translate(mid.x + 0.5, mid.y + 0.5);

	for (let i = 0; i < settings.outerPoints; i++) {
		dest.beginPath();

		dest.moveTo(0, 0);
		dest.lineTo(Math.cos(step * i) * r, Math.sin(step * i) * r);
		dest.stroke();
		dest.closePath();
	}

	dest.restore();
};

const draw = () => {
	clear();

	ctx.globalCompositeOperation = 'source-over';

	circle(ctx, '#000');

	ctx.globalCompositeOperation = 'source-atop';

	line(ctx, '#fff');

	line(ctx2, '#000');


	ctx3.drawImage(ctx2.canvas, 0, 0);
	ctx3.drawImage(ctx.canvas, 0, 0);


};


sel.addEventListener('change', (e) => {
	draw();
});

sel2.addEventListener('change', (e) => {
	draw();
});

col.addEventListener('input', (e) => {
	draw();
});

// draw();

gsap.defaults({
	duration: 2,
	onUpdate: draw,
});

const tl = gsap.timeline();
tl.fromTo(settings, { outerPoints: 0 }, { outerPoints: 30, snap: 'outerPoints' });
