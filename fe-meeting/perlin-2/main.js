const c = document.createElement('canvas');
const ctx = c.getContext('2d');

c.width = 500;
c.height = 500;

const midX = 250;
const midY = 250;

noise.seed(Math.random());

let tick = 0;
const radius = 200;
const numPoints = 250;
const angleStep = (Math.PI * 2) / numPoints;

const points = [];
const maxAmp = 200;

const draw = () => {
	let angle = 0;

	for (let = i = 0; i < numPoints; i++) {
		const x = 0;
		const y = 0;

		angle += angleStep;

		points.push({x, y, angle});
	}
}


const loop = () => {
	ctx.clearRect(0, 0, c.width, c.height);
	ctx.beginPath();

	for (let i = 0; i < points.length; i++) {
		const p = points[i];
		const noiseValue = noise.perlin2(p.x * 0.1 + tick, p.y * 0.1 + tick);
		const amp = maxAmp * noiseValue;

		p.x = Math.cos(p.angle) * (radius + amp);
		p.y = Math.sin(p.angle) * (radius + amp);

		if (i === 0) {
			ctx.moveTo(midX + p.x, midY + p.y);
		} else {
			ctx.lineTo(midX + p.x, midY + p.y);
		}
	}

	ctx.lineTo(midX + points[0].x, midY + points[0].y);

	ctx.stroke();
	ctx.closePath();

	tick += 0.05;
	requestAnimationFrame(loop);
}


document.body.appendChild(c);
draw();
loop();