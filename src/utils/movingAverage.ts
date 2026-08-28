export function movingAverage(values: number[], period: number) {
  let sum = 0;
  return values.map((value, index) => {
    sum += value;
    if (index >= period) sum -= values[index - period];
    return index >= period - 1 ? sum / period : null;
  });
}

export function chartIndexFromX(locationX: number | undefined, left: number, width: number, length: number) {
  if (!Number.isFinite(locationX) || width <= 0 || length <= 0) return null;
  const ratio = Math.max(0, Math.min(0.999, (locationX! - left) / width));
  return Math.min(length - 1, Math.floor(ratio * length));
}
