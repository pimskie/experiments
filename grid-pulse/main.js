noise.seed(Math.random());

const q = (sel) => document.querySelector(sel);
const canvas = q('canvas');
const ctx = canvas.getContext('2d');
const PI2 = Math.PI * 2;
const FF = PI2 / 8;

let width;
let height;
let widthHalf;
let heightHalf;

let phase = 0;
let trails = [];
const trailWidth = 2;

const getAngle = () => {
	const angle = (PI2 * Math.random());

	return  angleFF = angle - (angle % FF);
};

const create = () => {
	let num = 400;

	while (num--) {
		trails.push({
			dead: false,
			x: widthHalf,
			y: heightHalf,
			width: trailWidth,
			vel: 1 + (2 * Math.random()),
			angle: getAngle(),
		});
	}
};

const reset = () => {
	trails = [];

	width = window.innerWidth;
	height = window.innerHeight;
	widthHalf = width * 0.5;
	heightHalf = height * 0.5;

	canvas.width = width;
	canvas.height = height;

	create();
};

const update = (trail, right, bottom) => {
	const shouldChange = Math.random() > 0.97;
	const incAngle = Math.random() > 0.5;

	if (trail.x < 0) {
		trail.x = right;
	} else if (trail.x > right) {
		trail.x = 0;
	}

	if (trail.y < 0) {
		trail.y = bottom;
	} else if (trail.y > bottom) {
		trail.y = 0;
	}

	if (shouldChange && incAngle) {
		trail.angle += FF;
	} else if (shouldChange) {
		trail.angle -= FF;
	}

}

const render = (trail, ctx, phase) => {
	let { x, y, length, vel, angle } = trail;

	const scale = 0.0009;
	const n = noise.perlin3(x * scale, y * scale, phase);
	const h = 120 * n;

	ctx.beginPath();
	ctx.lineWidth = trail.width;
	ctx.strokeStyle = `hsl(${h}, 100%, 50%)`;

	ctx.moveTo(trail.x, trail.y);

	trail.x += Math.cos(angle) * vel;
	trail.y += Math.sin(angle) * vel;

	ctx.lineTo(trail.x, trail.y);
	ctx.stroke();
	ctx.closePath();
}

const clear = () => {
	ctx.fillStyle = 'rgba(0, 0, 0, 0.03)';
	ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
};

const loop = () => {
	clear();

	const s = Math.random() > 0.98;

	trails.forEach((t) => {
		update(t, width, height, s);
		render(t, ctx, phase);
	});

	phase += 0.004;

	requestAnimationFrame(loop);
};

reset();
loop();

canvas.addEventListener('click', reset);
window.addEventListener('resize', reset);
