export const lerp = (from, to, percent) => from + (to - from) * percent;

export const calculateScratchedRatio = (data, sampleStep = 4) => {
  if (!data || data.length === 0) {
    return 0;
  }

  const step = 4 * sampleStep;

  // data holds the pixel data
  // 4 entries per pixel: r, g, b, a
  // we don't want to check every pixel for performance
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
