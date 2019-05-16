const distance = (v1, v2) => {
	const dx = v2.x - v1.x;
	const dy = v2.y - v1.y;

	return dx * dx + dy * dy;
};

const randomBetween = (min, max) => Math.random() * (max - min) + min;

onmessage = ({ data: { numSteps, particles, branch, stageWidth, stageHeight } } = e) => {
	for (let i = 0; i < numSteps; i++) {
		for (let i = 0; i < particles.length; i++) {
			const particle = particles[i];

			const length = 2;
			const x = randomBetween(-length, length);
			const y = randomBetween(-length, length);

			particle.position.x += x;
			particle.position.y += y;

			const intersecting = branch.find(b => distance(b.position, particle.position) <= particle.radius * particle.radius + b.radius * b.radius);

			if (intersecting) {
				particle.intersecting = intersecting;

				branch.push(particle);
				particles.splice(i, 1);
			}
		}
	}

	postMessage({ particles, branch });
}
