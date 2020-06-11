// https://www.pinterest.com/pin/528398968760662762/
// https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/globalCompositeOperation
const size = 500;
const mid = { x: size * 0.5, y: size * 0.5 };
const tau = Math.PI * 2;

const ctxs = new Array(3).fill().map((_, i) => {
	const c = document.createElement('canvas');

	c.width = size;
	c.height = size;

	return c.getContext('2d');
});

const [ctx, ctx2, ctx3] = ctxs;

document.body.append(ctx3.canvas);

const settings = {
	innerRadius: size * 0.2,
	innerPoints: 5,
	outerRadius: size * 0.45,
	outerPoints: 12,
	outerSpread: tau,
};

ctx.canvas.width = size;
ctx.canvas.height = size;

const clear = () => {
	ctxs.forEach(c => c.clearRect(0, 0, c.canvas.width, c.canvas.height));
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

const drawOuter = (dest, innerPoints, lineColor = '#000') => {
	for (let i = 0; i < settings.outerPoints; i++) {
		const a = ((settings.outerSpread / settings.outerPoints) * i);

		const from = {
			x: Math.cos(a) * settings.outerRadius,
			y: Math.sin(a) * settings.outerRadius,
		};

		connectDots(dest, from, innerPoints, lineColor);
	}
};

const connectDots = (dest, from, points, lineColor) => {
	dest.save();
	dest.translate(mid.x, mid.y);

	dest.strokeStyle = lineColor;
	dest.lineWidth = 1;

	points.forEach((point) => {
		dest.beginPath();
		dest.moveTo(from.x, from.y);
		dest.lineTo(point.x, point.y);
		dest.stroke();
		dest.closePath();
	});

	dest.restore();
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

	ctx.globalCompositeOperation = 'source-over';

	drawInner(points, '#000');

	ctx.globalCompositeOperation = 'source-atop';

	drawOuter(ctx, points, '#fff');
	drawOuter(ctx2, points, '#000');

	ctx3.drawImage(ctx2.canvas, 0, 0);
	ctx3.drawImage(ctx.canvas, 0, 0);
};

gsap.defaults({
	duration: 2,
	onUpdate: draw,
});

// https://greensock.com/docs/v3/GSAP/Timeline
// https://greensock.com/docs/v3/Eases
const tl = gsap.timeline();

tl.fromTo(settings, { innerRadius: 0 }, { innerRadius: size * 0.2, ease: 'back.out(1.75)', duration: 1 });
tl.fromTo(settings, { innerPoints: 0 }, { innerPoints: 12, snap: 'innerPoints', duration: 1, ease: 'power3.in' });
tl.fromTo(settings, { outerRadius: 0 }, { outerRadius: size * 0.4, delay: 0.5, ease: 'power2.out' });
tl.to(settings, { innerRadius: size * 0.5, ease: 'power2.out', delay: 1 });
tl.to(settings, { outerRadius: size * 0.25, ease: 'power2.out' }, '<');
tl.to(settings, { outerSpread: tau / 2 });
tl.to(settings, { outerRadius: size * 0.5 });

tl.to(settings, { innerRadius: size * 0.2, delay: 1.5 });
tl.to(settings, { outerSpread: tau, outerRadius: 0 });
