const MAX_FORECAST_AGE = 4 * 60 * 60 * 1000;

export function usableWeather(data, city, now = Date.now()) {
  return data?.city === city && Number.isFinite(data.temperature)
    && typeof data.symbol === 'string' && data.symbol.length > 0
    && Number.isFinite(Date.parse(data.time))
    && Math.abs(now - Date.parse(data.time)) <= MAX_FORECAST_AGE;
}

// Keep the browser deadline longer than the provider's 12-second deadline.
// A cancelled city selection must also cancel a pending retry.
export async function fetchWeather(city, {signal, fetchImpl = fetch, timeoutMs = 15000, retryDelayMs = 700, now = Date.now} = {}) {
  for (let attempt = 0; attempt < 2; attempt++) {
    signal?.throwIfAborted();
    const request = new AbortController();
    const abort = () => request.abort(signal.reason);
    signal?.addEventListener('abort', abort, {once: true});
    const deadline = setTimeout(() => request.abort(), timeoutMs);
    try {
      const response = await fetchImpl('/api/weather?place=' + encodeURIComponent(city), {signal: request.signal});
      if (!response.ok) {
        const error = new Error('Weather unavailable');
        error.retryable = response.status === 429 || response.status >= 500;
        throw error;
      }
      const data = await response.json();
      if (!usableWeather(data, city, now())) {
        const error = new Error('Invalid weather');
        error.retryable = false;
        throw error;
      }
      signal?.throwIfAborted();
      return data;
    } catch (error) {
      signal?.throwIfAborted();
      if (attempt || error.retryable === false) throw error;
    } finally {
      clearTimeout(deadline);
      signal?.removeEventListener('abort', abort);
    }
    await new Promise((resolve, reject) => {
      const cancel = () => { clearTimeout(timer); reject(signal.reason); };
      const timer = setTimeout(() => { signal?.removeEventListener('abort', cancel); resolve(); }, retryDelayMs);
      signal?.addEventListener('abort', cancel, {once: true});
    });
  }
}
