import { DEFAULTS, PARTICLES_SPAWN_THRESHOLD } from './config.js';
import { calculateScratchedRatio } from './math.js';
import { createParticle } from './particle.js';
import { paintCover, drawPath, drawParticles } from './renderer.js';

const getPointerVector = ({ offsetX, offsetY }) => ({ x: offsetX, y: offsetY });

export const createScratchCard = (canvas, options = {}) => {
  const { revealButton, ...overrides } = options;
  const config = { ...DEFAULTS, ...overrides };
  const state = {
    isDrawing: false,
    rafId: null,
    from: { x: 0, y: 0 },
    particles: [],
  };

  const ctx = canvas.getContext('2d', { willReadFrequently: true });

  // Separate layer so particles can be cleared each frame without wiping the cover
  const particleCanvas = document.createElement('canvas');
  particleCanvas.className = 'particle-canvas';
  canvas.after(particleCanvas);

  const particleCtx = particleCanvas.getContext('2d');

  const spawnParticles = (position) => {
    const numParticles = Math.ceil(5 * Math.random());

    for (let i = 0; i < numParticles; i++) {
      const angle = Math.random() * Math.PI * 2;
      const particlePosition = {
        x: position.x + Math.cos(angle) * config.eraserRadius,
        y: position.y + Math.sin(angle) * config.eraserRadius,
      };

      const particle = createParticle(particlePosition, angle);

      state.particles.push(particle);
    }
  };

  const updateParticles = () => {
    const { particles } = state;

    particles.forEach(p => p.update());

    state.particles = [...particles.filter(p => p.life >= 0.4)];
  }

  const refresh = () => {
    const dpr = window.devicePixelRatio || 1;
    const { offsetWidth: width, offsetHeight: height } = canvas;

    if (!width || !height) {
      return;
    }

    canvas.width = width * dpr;
    canvas.height = height * dpr;

    ctx.reset();
    ctx.scale(dpr, dpr);

    paintCover(ctx, width, height, config.coverColor);

    particleCanvas.width = width * dpr;
    particleCanvas.height = height * dpr;

    particleCtx.reset();
    particleCtx.scale(dpr, dpr);
  };

  const destroy = () => {
    resizeObserver.disconnect();

    canvas.removeEventListener('pointerdown', onPointerDown);
    canvas.removeEventListener('pointerup', onPointerUp);
    canvas.removeEventListener('pointermove', onPointerMove);
    revealButton.removeEventListener('click', onRevealClick);

    cancelAnimationFrame(state.rafId);
    state.rafId = null;

    particleCanvas.remove();
    revealButton.remove();
  };

  const onRevealClick = () => reveal();

  const reveal = () => {
    // Once revealing starts the button is moot — block a second trigger.
    revealButton.disabled = true;

    canvas.classList.add('is-revealed');
    canvas.addEventListener(
      'transitionend',
      () => {
        destroy();
        canvas.remove();
      },
      { once: true },
    );
  };

  const onPointerMove = (e) => {
    if (!state.isDrawing) {
      return;
    }

    const to = getPointerVector(e);
    const shouldSpawnParticles = Math.random() >= PARTICLES_SPAWN_THRESHOLD;

    drawPath(ctx, state.from, to, config);

    if (shouldSpawnParticles) {
      spawnParticles(to);
    }

    state.from = to;
  };

  const onPointerDown = (e) => {
    state.isDrawing = true;
    state.from = getPointerVector(e);

    canvas.setPointerCapture(e.pointerId);
    canvas.addEventListener('pointermove', onPointerMove);
  };

  const onPointerUp = (e) => {
    if (!state.isDrawing) {
      return;
    }

    state.isDrawing = false;

    canvas.releasePointerCapture(e.pointerId);
    canvas.removeEventListener('pointermove', onPointerMove);

    const { data } = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const scratchedRatio = calculateScratchedRatio(data, config.sampleStep);

    if (scratchedRatio >= config.revealThreshold) {
      reveal();
    }
  };

  const loop = () => {
    updateParticles();

    particleCtx.clearRect(0, 0, particleCanvas.width, particleCanvas.height);
    drawParticles(particleCtx, state.particles, config.particleColor);

    state.rafId = requestAnimationFrame(loop);
  };

  const resizeObserver = new ResizeObserver(refresh);

  canvas.addEventListener('pointerdown', onPointerDown);
  canvas.addEventListener('pointerup', onPointerUp);
  revealButton.addEventListener('click', onRevealClick);

  resizeObserver.observe(canvas);

  loop();

  return { refresh, reveal, destroy };
};
