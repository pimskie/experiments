const canvas = document.querySelector('canvas');
const ctx = canvas.getContext('2d');

let w = 800;
let h = 300;

canvas.width = w;
canvas.height = h;

const x = -100;
const y = h;

const triangles = [
	{
		pos: { x, y },
		angle: 0,
		color: 'rgba(100, 100, 100, 0.1)',
		points: [
			{ x: 50, y: 0 },
			{ x: -30, y: 20 },
			{ x: -80, y: -20 },
		],
	},
	{
		pos: { x, y },
		angle: 0,
		color: 'rgba(250, 250, 250, 0.2)',
		points: [
			{ x: 40, y: -10 },
			{ x: -25, y: 25 },
			{ x: -95, y: -10 },
		],
	},
	{
		pos: { x, y },
		angle: 0,
		color: 'rgba(220, 220, 220, 0.2)',
		points: [
			{ x: 20, y: 40 },
			{ x: -30, y: 45 },
			{ x: -30, y: -60 },
		],
	},
];

const loop = () => {
	triangles.forEach((t) => {
		ctx.save();
		ctx.translate(t.pos.x, t.pos.y);
		ctx.rotate(t.angle);

		ctx.beginPath();

		ctx.strokeStyle = t.color;
		ctx.fillStyle = t.color;

		t.points.forEach((p, i) => {
			if (i === 0) {
				ctx.moveTo(p.x, p.y);
			} else {
				ctx.lineTo(p.x, p.y);
			}
		});

		ctx.lineTo(t.points[2].x, t.points[2].y);

		ctx.closePath();
		ctx.stroke();
		ctx.restore();

		t.angle -= 0.01;
		t.pos.x += 1;

		if (t.pos.x > w) {
			t.pos.x = 0;
		}
	});

	requestAnimationFrame(loop);
};

loop();
