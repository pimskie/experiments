const canvas = document.body.querySelector("canvas");
const ctx = canvas.getContext("2d");

const PI2 = Math.PI * 2;
const w = 300;
const h = 300;

const midX = w * 0.5;
const midY = h * 0.5;
const distanceMax = 150;

const particles = new Array(20).fill(0).map(() => ({
	noise: new SimplexNoise(),
	x: midX + (-100 + Math.random() * 200),
	y: midY + (-100 + Math.random() * 200),
}));

canvas.width = w;
canvas.height = h;

let rafId = null;
let phase = 0;

const drawFly = (particle, ctx, tick) => {
	const velocityForce = 1;
	const attractionForce = 0.009;

	const noiseVal = particle.noise.noise3D(
		particle.x * 0.01,
		particle.y * 0.01,
		tick
	);

	velocityX = Math.cos(noiseVal * PI2) * velocityForce;
	velocityY = Math.sin(noiseVal * PI2) * velocityForce;

	const attractionX = (midX - particle.x) * attractionForce;
	const attractionY = (midY - particle.y) * attractionForce;

	particle.x += velocityX + attractionX;
	particle.y += velocityY + attractionY;

	const distanceToMid = Math.sqrt(
		(particle.x - midX) ** 2 + (particle.y - midY) ** 2
	);

	const distancePercent = 1 - distanceToMid / distanceMax;
	const alpha = Math.abs(distancePercent);

	ctx.beginPath();
	ctx.shadowBlur = 8;
	ctx.shadowColor = "rgba(255, 255, 150, 0.8)";
	ctx.fillStyle = `rgba(255, 255, 200, ${alpha})`;

	ctx.arc(particle.x, particle.y, 2, 0, Math.PI * 2);
	ctx.fill();
	ctx.stroke();
	ctx.closePath();
};

const loop = () => {
	ctx.clearRect(0, 0, w, h);

	particles.forEach((particle) => {
		drawFly(particle, ctx, phase, particles);
	});

	phase += 0.01;

	rafId = requestAnimationFrame(loop);
};

canvas.addEventListener("click", () => {
	if (rafId) {
		cancelAnimationFrame(rafId);
		rafId = null;
	} else {
		loop();
	}
});

loop();

