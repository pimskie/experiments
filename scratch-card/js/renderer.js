import { lerp } from './math.js';

export const paintCover = (ctx, width, height, color) => {
  ctx.save();

  ctx.globalCompositeOperation = 'source-over';
  ctx.fillStyle = color;
  ctx.fillRect(0, 0, width, height);

  ctx.restore();
};

export const drawPath = (ctx, from, to, { eraserRadius, circleCount }) => {
  ctx.save();
  ctx.globalCompositeOperation = 'destination-out';

  // lerp between from and to, to avoid gaps
  for (let i = 0; i < circleCount; i++) {
    const percent = i / (circleCount - 1);
    const x = lerp(from.x, to.x, percent);
    const y = lerp(from.y, to.y, percent);

    ctx.beginPath();
    ctx.arc(x, y, eraserRadius, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.restore();
};

export const drawParticles = (ctx, particles, color) => {
  ctx.fillStyle = color;

  particles.forEach((particle) => {
    ctx.beginPath();
    ctx.arc(particle.position.x, particle.position.y, particle.radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.closePath();
  });
};
