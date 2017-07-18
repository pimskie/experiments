const c = document.createElement('canvas');
const ctx = c.getContext('2d');

c.width = 500;
c.height = 500;

let numParticles = 200;
let particles = [];

while (numParticles--) {
	const x = Calc.randomBetween(0, c.width);
	const y = Calc.randomBetween(0, c.height);

    const velX = Calc.randomBetween(-2, 2);
	const velY = Calc.randomBetween(-2, 2);

	let particle = {x, y, velX, velY};

	particles.push(particle);
}

const loop = () => {
	// clean canvas
	// ctx.clearRect(0, 0, c.width, c.height);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.fillRect(0, 0, c.width, c.height);

	particles.forEach((particle) => {

		// update position of particle
		particle.x += particle.velX;
		particle.y += particle.velY;

		// bounce on edges
		if (particle.x < 0 || particle.x > c.width) {
			particle.velX *= -1;
		}

		if (particle.y < 0 || particle.y > c.height) {
			particle.velY *= -1;
		}

		// draw particle
		ctx.beginPath();
		ctx.fillStyle = '#000';
		ctx.arc(particle.x, particle.y, 2, 0, Math.PI * 2);
		ctx.fill();
		ctx.closePath();
	});

	requestAnimationFrame(loop);
}


document.body.appendChild(c);

loop();