const simplex = new SimplexNoise();

const getAngleBetween = (vec1, vec2) => Math.atan2(vec2.y - vec1.y, vec2.x - vec1.x);
const randomArrayValue = arr => arr[Math.floor(Math.random() * arr.length)];

const palettes = [
	['#f65c78', '#ffd271', '#fff3af', '#c3f584'],
	['#111d5e', '#b21f66', '#fe346e', '#ffbd69'],
	['#36b5b0', '#9dd8c8', '#f09595', '#fcf5b0'],
	['#015668', '#263f44', '#ffd369', '#fff1cf'],
];

const canvas = document.querySelector('.js-canvas');
const ctx = canvas.getContext('2d');

const TAU = Math.PI * 2;

const width = window.innerWidth;
const height = window.innerHeight;

const midX = width >> 1;
const midY = height >> 1;

canvas.width = width;
canvas.height = height;

let phase = 0;
let phaseSpeed = 0.001;

let palette = [];
let trails = [];
const numTrails = 200;

let noiseScale = 0.0001;
let noiseAmp = 0.01;

const generate = () => {
	palette = randomArrayValue(palettes);
	noiseScale = 0.0001;
	noiseAmp = 0.01;

	trails = [];

	for (let i = 0; i < numTrails; i++) {
		const spacing = 2;
		const lineWidth = 3 + (Math.random() * 3);
		const velocity = 10 + (Math.random() * 10);
		const angle = -0.25 + (Math.random() * 0.5);
		const numPoints = 20 + (Math.random() * 5);
		const points = [];
		const color = randomArrayValue(palette);

		for (let q = 0; q < numPoints; q++) {
			points.push({
				x: 0,
				y: 200 + (Math.random() * 400),
			});
		}

		trails.push({ spacing, points, angle, velocity, lineWidth, color });
	}
};

const updateTrail = (trail, index) => {
	const {  points, spacing, velocity } = trail;
	const [head] = points;

	const noise = simplex.noise2D(head.x * noiseScale, head.y * noiseScale) * noiseAmp;

	trail.angle += noise;

	head.x += Math.cos(trail.angle) * velocity;
	head.y += Math.sin(trail.angle) * velocity;

	for (let i = 1; i < points.length; i++) {
		const angleBetween = getAngleBetween(points[i - 1], points[i]);

		points[i].x = points[i - 1].x + (Math.cos(angleBetween) * spacing);
		points[i].y = points[i - 1].y + (Math.sin(angleBetween) * spacing);
	}


	trail.velocity *= 0.99;
	trail.lineWidth *= 0.98;
	trail.isDead = head.x < 0 || head.x > width || head.y < 0 || head.y > height;
};

const drawTrail = (trail, index) => {
	const { points, lineWidth, color } = trail;

	ctx.save();

	ctx.beginPath();
	ctx.lineWidth = lineWidth;
	ctx.strokeStyle = color;

	points.forEach((point, i) => {
		const m = i === 0 ? 'moveTo' : 'lineTo';

		ctx[m](point.x, point.y);
	});
	ctx.stroke();
	ctx.closePath();
	ctx.restore();
};

const loop = () => {
	ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

	trails.forEach((trail, index) => {
		updateTrail(trail, index);
		drawTrail(trail, index);
	});

	trails = trails.filter(t => !t.isDead);

	noiseScale += 0.1;
	noiseAmp += 0.0005;
	phase += phaseSpeed;

	requestAnimationFrame(loop);
};

canvas.addEventListener('mousedown', (e) => {
	generate();
});

generate();
loop();
