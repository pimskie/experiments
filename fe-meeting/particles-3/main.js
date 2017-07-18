const c = document.createElement('canvas');
const ctx = c.getContext('2d');

c.width = 500;
c.height = 500;

let numParticles = 100;
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
	ctx.clearRect(0, 0, c.width, c.height);

	particles.forEach((p1) => {

		// update position of particle
		p1.x += p1.velX;
		p1.y += p1.velY;

		// bounce on edges
		if (p1.x < 0 || p1.x > c.width) {
			p1.velX *= -1;
		}

		if (p1.y < 0 || p1.y > c.height) {
			p1.velY *= -1;
		}

		// draw particle
		ctx.beginPath();
		ctx.fillStyle = '#000';
		ctx.arc(p1.x, p1.y, 2, 0, Math.PI * 2);
		ctx.fill();
		ctx.closePath();

		// addition: connect
		particles.forEach((p2) => {
			const dist = Calc.distanceBetween(p1.x, p1.y, p2.x, p2.y);

			// connect
			if (dist < 50) {
				ctx.beginPath();
				ctx.moveTo(p1.x, p1.y);
				ctx.lineTo(p2.x, p2.y);
				ctx.stroke();
				ctx.closePath();
			}
		});
	});

	requestAnimationFrame(loop);
}


document.body.appendChild(c);

loop();