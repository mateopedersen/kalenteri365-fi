// Advance by elapsed time rather than by frame count, including 23/25-hour days.
export function advanceSolarMinute(minute, elapsedMs, maximum, speed = 40) {
  const elapsed = Math.max(0, Math.min(100, Number(elapsedMs) || 0));
  return Math.min(maximum, Math.max(0, minute) + elapsed * speed / 1000);
}

// A sustained slow frame rate lowers only pixel density, never astronomy accuracy.
export function createSolarQuality() {
  let scale = 1, average = 16.7, samples = 0, stable = 0;
  return {
    get scale() { return scale; },
    observe(interval) {
      if (!(interval > 0 && interval < 120)) return scale;
      average += (interval - average) * .12;
      samples++;
      if (samples >= 24 && average > 24 && scale > .55) {
        scale = Math.max(.55, scale - .15); samples = 0; stable = 0; average = 16.7;
      } else if (average < 19 && scale < 1) {
        if (++stable >= 180) { scale = Math.min(1, scale + .05); stable = 0; samples = 0; }
      } else stable = 0;
      return scale;
    },
    reset() { average = 16.7; samples = 0; stable = 0; }
  };
}
