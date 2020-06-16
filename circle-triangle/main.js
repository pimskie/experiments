// https://www.pinterest.com/pin/528398968760662762/
// https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/globalCompositeOperation
const size = 500;
const mid = { x: size * 0.5, y: size * 0.5 };
const tau = Math.PI * 2;
const hypo = size * 0.72;

const ctxs = new Array(3).fill().map((_, i) => {
	const c = document.createElement('canvas');

	c.width = size;
	c.height = size;

	return c.getContext('2d');
});

const [ctx, ctx2, ctx3] = ctxs;

document.body.append(ctx3.canvas);

const settings = {
	innerBackgroudColor: 'rgba(0, 0, 0, 1)',
	innerRadius: size * 0.2,
	innerPoints: 12,
	innerLineColor: 'rgba(255, 255, 255, 1)',
	outerBackgroundColor: 'rgba(255, 255, 255, 1)',
	outerRadius: size * 0.45,
	outerPoints: 8,
	outerLineColor: 'rgba(0, 0, 0, 1)',
	outerSpread: tau,
	maskOuterRadius: 0,
	maskInnerRadius: 0,
	mask1Color: '#000',
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
	ctx.strokeStyle = settings.innerBackgroudColor;
	ctx.fillStyle = settings.innerBackgroudColor;

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

	drawOuter(ctx, points, settings.innerLineColor);
	drawOuter(ctx2, points, settings.outerLineColor);

	ctx3.fillStyle = settings.outerBackgroundColor;
	ctx3.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);

	ctx3.globalCompositeOperation='source-atop';
	ctx3.drawImage(ctx2.canvas, 0, 0);
	ctx3.drawImage(ctx.canvas, 0, 0);

	ctx3.globalCompositeOperation='difference';
	ctx3.fillStyle = 'white';
	ctx3.globalAlpha = 1;
	ctx3.beginPath();
	ctx3.arc(mid.x, mid.y, settings.maskOuterRadius, 0, tau, false);
	ctx3.arc(mid.x, mid.y, settings.maskInnerRadius, 0, tau, true);
	ctx3.fill();
	ctx3.closePath();
};

gsap.defaults({
	duration: 2,
	onUpdate: draw,
});

// https://greensock.com/docs/v3/GSAP/Timeline
// https://greensock.com/docs/v3/Eases
const onComplete = () => {
	tl.seek('started');
};

const tl = gsap.timeline({
	onComplete,
});

tl.fromTo(settings, { innerRadius: 0 }, { innerRadius: size * 0.2, ease: 'back.out(1.75)', duration: 1 });
tl.fromTo(settings, { outerRadius: 0 }, { outerRadius: size * 0.45, delay: 0.5, ease: 'power2.out' });

tl.addLabel('started');

tl.fromTo(settings, {
	maskInnerRadius: hypo,
	maskOuterRadius: hypo,
}, {
	maskInnerRadius: size * 0.45,
	maskOuterRadius: hypo,
	ease: 'power2.out',
});



tl.to(settings, { maskInnerRadius: size * 0.5, innerRadius: size * 0.25, outerRadius: size * 0.4 });

tl.to(settings, { outerPoints: 24, snap: 'outerPoints' });
tl.to(settings, { maskInnerRadius: size * 0.46 }, '<');
tl.to(settings, { outerRadius: size * 0.2, innerRadius: size * 0.45, maskInnerRadius: size * 0.5 });
tl.to(settings, { outerSpread: tau, innerRadius: size * 0.2, outerRadius: size * 0.45 });
tl.to(settings, { outerPoints: 8, maskOuterRadius: size * 0.45 });
tl.to(settings, { innerRadius: size * 0.15, outerRadius: size * 0.35, outerRadius: size * 0.5 }, '<');
tl.to(settings, { innerRadius: size * 0.2, outerRadius: size * 0.45, maskInnerRadius: size * 0, maskOuterRadius: 0, ease: 'power2.out' });


