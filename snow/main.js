const canvas = document.createElement('canvas');
const ctx = canvas.getContext('2d');
const PI2 = Math.PI * 2;

const particles = [];
const maxParticles = 2000;

// all set in `setStage`
let canvasWidth;
let canvasHeight;
let canvasMidX;
let canvasMidY;

let rafId = null;

let mouseAmpX = 0;
let mouseAmpY = 0;

const clear = () => {
	ctx.globalCompositeOperation = 'destination-out';
	ctx.fillStyle = 'hsla(0, 0%, 0%, 0.5)';
	ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
	ctx.globalCompositeOperation = 'lighter';
}

const setStage = () => {
	canvasWidth = window.innerWidth;
	canvasHeight = window.innerHeight;
	midX = canvasWidth >> 1;
	midY = canvasHeight >> 1;

	canvas.width = canvasWidth;
	canvas.height = canvasHeight;
}

const init = () => { 
	for (let i = 0; i < maxParticles; i++) {
		const depth = Math.round(Math.random() * 5);
		const velX = 0;
		const velY = 0; //depth * 0.75;

		particles.push({
			x: Math.random() * canvasWidth,
			y: Math.random() * canvasHeight,
			depth,
			velX,
			velY,
		});
	}
};

const loop = () => {
	clear();

	for (let i = 0; i < particles.length; i++) {
		const p = particles[i];

		ctx.beginPath();	
		const r = p.depth * 0.25;
		const gradient = ctx.createRadialGradient(p.x, p.y, 0, p.x + r, p.y + r, p.depth);
		gradient.addColorStop(0.5, 'white');
		gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
		ctx.fillStyle = '#fff';

		ctx.arc(p.x, p.y, p.depth, 0, PI2, true);
		ctx.fill();
		ctx.closePath();

		p.velX = -p.depth * mouseAmpX;
		p.velY = -p.depth * mouseAmpY;

		p.x += p.velX;
		p.y += p.velY;

		if (p.x > canvasWidth) {
			p.x = 0;
		}

		if (p.x < 0) {
			p.x = canvasWidth;
		}

		if (p.y > canvasHeight) {
			p.y = 0;
		}

		if (p.y < 0) {
			p.y = canvasHeight;
		}

	}

	rafId = requestAnimationFrame(loop);
}

window.addEventListener('resize', setStage);

document.body.appendChild(canvas);

setStage();
init();
loop();

document.body.addEventListener('mousemove', (e) => { 
	const ampX = (e.clientX - midX) / midX;
	const ampY = (e.clientY - midY) / midY;

	mouseAmpX = ampX * 3;
	mouseAmpY = ampY * 3;
});

