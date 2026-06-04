import { SCRATCH_CANVAS_SELECTOR } from './config.js';
import { createScratchCard } from './scratch-card.js';

// Reads the component props that Blade renders as data attributes on the canvas.
export const optionsFromDataset = (canvas) => {
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
  const instances = [];

  root.querySelectorAll(SCRATCH_CANVAS_SELECTOR).forEach((canvas) => {
    if (canvas.dataset.scratchReady === 'true') {
      return;
    }

    canvas.dataset.scratchReady = 'true';

    instances.push(createScratchCard(canvas, optionsFromDataset(canvas)));
  });

  return instances;
};
