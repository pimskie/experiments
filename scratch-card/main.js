const SCRATCH_CANVAS_SELECTOR = '.js-scratch-canvas';

const DEFAULTS = {
  eraserRadius: 50,
  circleCount: 10,
  coverColor: 'green',
  revealThreshold: 0.7,
  sampleStep: 4,
};

const getPointerVector = ({ offsetX, offsetY }) => ({ x: offsetX, y: offsetY });

const lerp = (from, to, percent) => from + (to - from) * percent;

const calculateScratchedRatio = (data, sampleStep = 4) => {
  if (!data || data.length === 0) return 0;

  const step = 4 * sampleStep;
  let total = 0;
  let transparent = 0;

  // a for-loop is faster than a reduce/filter here
  for (let i = 3; i < data.length; i += step) {
    if (data[i] === 0) transparent++;
    total++;
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

const createScratchCard = (canvas, options = {}) => {
  const config = { ...DEFAULTS, ...options };
  const state = {
    isDrawing: false,
    scratchingFrom: { x: 0, y: 0 },
  }

  const ctx = canvas.getContext('2d', { willReadFrequently: true });

  // Re-measure & repaint once the layout is final (images/fonts loaded,
  // resize, ...). Scales to devicePixelRatio so the cover stays sharp.
  const refresh = () => {
    const dpr = window.devicePixelRatio || 1;
    const { offsetWidth: width, offsetHeight: height } = canvas;

    canvas.width = width * dpr;
    canvas.height = height * dpr;

    ctx.reset();
    ctx.scale(dpr, dpr);

    paintCover(ctx, width, height, config.coverColor);
  };

  const reveal = () => {
    canvas.classList.add('is-revealed');
    canvas.addEventListener('transitionend', () => {
      destroy();
      canvas.remove();
    }, { once: true });
  };

  const onPointerMove = (e) => {
    if (!state.isDrawing) {
      return;
    }

    const to = getPointerVector(e);

    drawPath(ctx, state.from, to, config);

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

    isDrawing = false;

    canvas.releasePointerCapture(e.pointerId);
    canvas.removeEventListener('pointermove', onPointerMove);

    const { data } = ctx.getImageData(0, 0, canvas.width, canvas.height);
    if (calculateScratchedRatio(data, config.sampleStep) >= config.revealThreshold) {
      reveal();
    }
  };

  const resizeObserver = new ResizeObserver(refresh);

  canvas.addEventListener('pointerdown', onPointerDown);
  canvas.addEventListener('pointerup', onPointerUp);
  resizeObserver.observe(canvas);

  const destroy = () => {
    resizeObserver.disconnect();
    canvas.removeEventListener('pointerdown', onPointerDown);
    canvas.removeEventListener('pointerup', onPointerUp);
    canvas.removeEventListener('pointermove', onPointerMove);
  };

  return { refresh, reveal, destroy };
};

const initScratchCards = (root = document.body) =>
  root.querySelectorAll(SCRATCH_CANVAS_SELECTOR).forEach(createScratchCard);

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => initScratchCards());
} else {
  initScratchCards();
}
