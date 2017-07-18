const c = document.createElement('canvas');
const ctx = c.getContext('2d');

c.width = 500;
c.height = 500;

let numParticles = 120;

while (numParticles--) {
	const x = Calc.randomBetween(0, c.width);
	const y = Calc.randomBetween(0, c.height);

	ctx.beginPath();
	ctx.arc(x, y, 2, 0, Math.PI * 2);
	ctx.fill();
	ctx.closePath();
}

document.body.appendChild(c);