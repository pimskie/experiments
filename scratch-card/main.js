const SCRATCH_CANVAS_SELECTOR = '.js-scratch-canvas';

//higher the number, the less frequent particles will spawn
const PARTICLES_SPAWN_THRESHOLD = 0.7;

const DEFAULTS = {
  eraserRadius: 30,
  circleCount: 10,
  coverColor: '#c4c4c4',
  particleColor: '#b0b0b0',
  revealThreshold: 0.7,
  sampleStep: 4,
};

const getParticle = (position, angle) => {
  const baseRadius = 4;

  const life = Math.random();
  const decay = 0.9;
  const radius = baseRadius * life;
  const velocity = 1 + (Math.random() * 3);

  return {
    position: { ...position },
    life,
    decay,
    angle,
    velocity,
    radius,
    baseRadius,
    update: function () {
      const velX = Math.cos(this.angle) * this.velocity;
      const velY = 5 * this.life;

      this.position.x += velX;
      this.position.y += 5;

      this.life *= decay;
      this.radius = this.baseRadius * this.life;
    },
  }
};

const getPointerVector = ({ offsetX, offsetY }) => ({ x: offsetX, y: offsetY });

const lerp = (from, to, percent) => from + (to - from) * percent;

const calculateScratchedRatio = (data, sampleStep = 4) => {
  if (!data || data.length === 0) {
    return 0;
  }

  const step = 4 * sampleStep;

  // data holds the pixel data
  // 4 entries per pixel: r, g, b, a
  // we don't want to check every pixel for performace
  const total = data.length / step;

  let transparent = 0;

  // a for-loop is faster than a reduce/filter here
  for (let i = 3; i < data.length; i += step) {
    if (data[i] === 0) {
      transparent++;
    }
  }

  return total > 0 ? transparent / total : 0;
};

const paintCover = (ctx, width, height, color) => {
  ctx.save();

  ctx.globalCompositeOperation = 'source-over';
  ctx.fillStyle = color;
  ctx.fillRect(0, 0, width, height);

  ctx.restore();
};

const drawPath = (ctx, from, to, { eraserRadius, circleCount }) => {
  ctx.save();
  ctx.globalCompositeOperation = 'destination-out';

  for (let i = 0; i < circleCount; i++) {
    const percent = circleCount > 1 ? i / (circleCount - 1) : 1;
    const x = lerp(from.x, to.x, percent);
    const y = lerp(from.y, to.y, percent);

    ctx.beginPath();
    ctx.arc(x, y, eraserRadius, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.restore();
};

const drawParticles = (ctx, particles, color) => {
  particles.forEach((particle) => {
    ctx.beginPath();
    
    ctx.fillStyle = color;
    ctx.arc(particle.position.x, particle.position.y, particle.radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.closePath();
  });
}

const createScratchCard = (canvas, options = {}) => {
  const config = { ...DEFAULTS, ...options };
  const state = {
    isDrawing: false,
    rafId: null,
    from: { x: 0, y: 0 },
    particles: [],
  };

  const ctx = canvas.getContext('2d', { willReadFrequently: true });

  // Separate layer so particles can be cleared each frame without wiping the cover.
  const particleCanvas = document.createElement('canvas');
  particleCanvas.className = 'particle-canvas';
  canvas.after(particleCanvas);

  const particleCtx = particleCanvas.getContext('2d');

  const spawnParticles = (position) => {
    const numParticles = Math.ceil(5 * Math.random());

    const particles = new Array(numParticles).fill().map(() => {
      const angle = Math.random() * Math.PI * 2;
      const particlePosition = {
        x: position.x + (Math.cos(angle) * config.eraserRadius),
        y: position.y + (Math.sin(angle) * config.eraserRadius),
      }
      const particle = getParticle(particlePosition, angle);

      return particle;
    });

    state.particles = [
      ...state.particles,
      ...particles,
    ];
  }

  const updateParticles = () => {
    state.particles = [...state.particles]
    .map((particle) =>{
      particle.update();

      return particle;
    })
    .filter(particle => particle.life >= 0.05)
  }

  const refresh = () => {
    const dpr = window.devicePixelRatio || 1;
    const { offsetWidth: width, offsetHeight: height } = canvas;

    if (!width || !height) {
      return;
    };

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

  const reveal = () => {
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
    const random = Math.random();
    const shouldSpawnPartciles = random >= PARTICLES_SPAWN_THRESHOLD;

    drawPath(ctx, state.from, to, config);

    if (shouldSpawnPartciles) {
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
  }

  const resizeObserver = new ResizeObserver(refresh);

  canvas.addEventListener('pointerdown', onPointerDown);
  canvas.addEventListener('pointerup', onPointerUp);

  resizeObserver.observe(canvas);

  loop();

  const destroy = () => {
    resizeObserver.disconnect();

    canvas.removeEventListener('pointerdown', onPointerDown);
    canvas.removeEventListener('pointerup', onPointerUp);
    canvas.removeEventListener('pointermove', onPointerMove);

    cancelAnimationFrame(state.rafId);
    state.rafId = null;

    particleCanvas.remove();
  };

  return { refresh, reveal, destroy };
};

// Reads the component props that Blade renders as data attributes on the canvas.
const optionsFromDataset = (canvas) => {
  const options = {};
  const { overlayColor, eraserSize } = canvas.dataset;

  if (overlayColor) {
    options.coverColor = overlayColor;
  }

  if (eraserSize) {
    const eraserRadius = parseFloat(eraserSize);
    if (Number.isFinite(eraserRadius) && eraserRadius > 0) {
      options.eraserRadius = eraserRadius;
    }
  }

  return options;
};


export const initScratchCards = (root = document.body) => {
  root.querySelectorAll(SCRATCH_CANVAS_SELECTOR).forEach((canvas) => {
    if (canvas.dataset.scratchReady === 'true') {
      return;
    };

    canvas.dataset.scratchReady = 'true';

    createScratchCard(canvas, optionsFromDataset(canvas));
  });
};

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => initScratchCards());
} else {
  initScratchCards();
}
