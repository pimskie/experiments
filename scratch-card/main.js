import { SCRATCH_CANVAS_SELECTOR } from './js/config.js';
import { createScratchCard } from './js/scratch-card.js';

// Reads the component props that Blade renders as data attributes on the canvas.
export const getOptionsFromDataset = (canvas) => {
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
  const canvases = [...root.querySelectorAll(SCRATCH_CANVAS_SELECTOR)];

  const instances = canvases.map((canvasElement) => {
    const instanceOptions = getOptionsFromDataset(canvasElement);
    const canvasInstance = createScratchCard(canvasElement, instanceOptions);

    return canvasInstance;
  });

  return instances;
};

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => initScratchCards());
} else {
  initScratchCards();
}
