const BASE_RADIUS = 4;
const DECAY = 0.9;

export const createParticle = (position, angle) => {
  const velocity = 1 + Math.random() * 3;

  const particle = {
    position: { ...position },
    life: Math.random(),
    radius: 0,
    update: () => {
      particle.position.x += Math.cos(angle) * velocity;
      particle.position.y += 5;

      particle.life *= DECAY;
      particle.radius = BASE_RADIUS * particle.life;
    },
  };

  particle.radius = BASE_RADIUS * particle.life;

  return particle;
};
