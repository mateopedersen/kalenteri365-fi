export function weatherAppearance(symbol = '') {
  const base = symbol.replace(/_(day|night|polartwilight)$/, '');
  const period = symbol.endsWith('_night') ? 'night' : symbol.endsWith('_polartwilight') ? 'twilight' : 'day';
  let condition = 'cloud';
  if (base.includes('sleet')) condition = 'sleet';
  else if (base.includes('snow')) condition = 'snow';
  else if (base.includes('thunder')) condition = 'storm';
  else if (base.includes('rain')) condition = 'rain';
  else if (base === 'clearsky') condition = 'sun';
  else if (base === 'fair') condition = 'fair';
  else if (base === 'partlycloudy') condition = 'partlycloudy';
  else if (base === 'fog') condition = 'fog';
  return {condition, period, heavy: base.includes('heavy')};
}

export function connectWeatherScene(stage) {
  const canvas = stage.querySelector('canvas');
  const context = canvas.getContext('2d');
  const motion = stage.querySelector('#weather-motion');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  let appearance = {condition: 'loading', period: 'day', heavy: false};
  let width = 0, height = 0, particles = [], frame = 0, lastTime = 0;
  let visible = true, paused = reduced.matches;

  function makeParticle(randomPosition = true) {
    const depth = .35 + Math.random() * .65;
    const snow = appearance.condition === 'snow' || (appearance.condition === 'sleet' && Math.random() < .45);
    return {
      x: Math.random() * (width + 45),
      y: randomPosition ? Math.random() * height : -20,
      depth, snow, phase: Math.random() * Math.PI * 2,
      speed: snow ? 14 + depth * 30 : 190 + depth * 280,
    };
  }

  function paint(seconds = 0) {
    if (!context) return;
    context.clearRect(0, 0, width, height);
    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];
      p.y += p.speed * seconds;
      p.x += (p.snow ? Math.sin(p.phase + p.y / 40) * 13 - 4 : -p.speed * .12) * seconds;
      if (p.y > height + 20 || p.x < -25) particles[i] = makeParticle(false);
      context.globalAlpha = p.snow ? .35 + p.depth * .5 : .16 + p.depth * .4;
      if (p.snow) {
        context.fillStyle = '#f2f8ff';
        context.beginPath();
        context.arc(p.x, p.y, .7 + p.depth * 1.8, 0, Math.PI * 2);
        context.fill();
      } else {
        context.strokeStyle = '#d2eaff';
        context.lineWidth = .45 + p.depth * .7;
        context.lineCap = 'round';
        context.beginPath();
        context.moveTo(p.x, p.y);
        context.lineTo(p.x - 1.5 - p.depth, p.y + 8 + p.depth * 9);
        context.stroke();
      }
    }
    context.globalAlpha = 1;
  }

  function animate(time) {
    frame = requestAnimationFrame(animate);
    if (time - lastTime < 1000 / 24) return;
    paint(Math.min((time - lastTime) / 1000, .08));
    lastTime = time;
  }

  function sync() {
    cancelAnimationFrame(frame);
    frame = 0;
    const stopped = paused || document.hidden || !visible;
    stage.dataset.motion = stopped ? 'paused' : 'playing';
    motion.setAttribute('aria-pressed', String(paused));
    motion.setAttribute('aria-label', paused ? 'Käynnistä sääanimaatio' : 'Pysäytä sääanimaatio');
    paint();
    if (!stopped && particles.length && context) {
      lastTime = performance.now();
      frame = requestAnimationFrame(animate);
    }
  }

  function resize() {
    const bounds = stage.getBoundingClientRect();
    width = bounds.width;
    height = bounds.height;
    const ratio = Math.min(devicePixelRatio || 1, 1.6);
    canvas.width = Math.round(width * ratio);
    canvas.height = Math.round(height * ratio);
    context?.setTransform(ratio, 0, 0, ratio, 0, 0);
    const precipitation = ['rain', 'sleet', 'snow', 'storm'].includes(appearance.condition);
    particles = precipitation ? Array.from({length: appearance.heavy ? 55 : 34}, () => makeParticle()) : [];
    sync();
  }

  motion.addEventListener('click', () => { paused = !paused; sync(); });
  reduced.addEventListener('change', () => { paused = reduced.matches; sync(); });
  document.addEventListener('visibilitychange', sync);
  new ResizeObserver(resize).observe(stage);
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(entries => { visible = entries[0].isIntersecting; sync(); }).observe(stage);
  }
  resize();

  return {
    set(symbol, period) {
      appearance = weatherAppearance(symbol);
      if (period) appearance.period = period;
      stage.dataset.weather = appearance.condition;
      stage.dataset.period = appearance.period;
      resize();
    },
    setPeriod(period) {
      appearance.period = period;
      stage.dataset.period = period;
    },
    clear(condition = 'loading') {
      appearance = {condition, period: appearance.period, heavy: false};
      stage.dataset.weather = condition;
      stage.dataset.period = appearance.period;
      resize();
    },
  };
}
