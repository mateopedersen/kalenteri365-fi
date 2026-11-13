/**
 * Original, text-free still lifes for the social renderer.
 *
 * Coordinates are in the final 1200 × 630 viewBox. Objects deliberately stay
 * above the social renderer's lower caption strip. These are SVG fragments,
 * not standalone documents; every paint server has a deterministic local ID.
 */

const FAMILY_ROUTES = {
  calculator: ['paivamaaralaskuri', 'tyopaivalaskuri', 'paivalaskuri', 'viikkonumerot', 'vuoden-paiva', 'karkausvuosi', 'verokalenteri', 'elakkeiden-maksupaivat', 'etuuksien-maksupaivat'],
  vacation: ['lomasuunnittelija', 'pitkat-viikonloput'],
  family: ['perhekalenteri', 'syntymapaivakalenteri', 'nimipaivat'],
  school: ['koulujen-lomat', 'koulukalenteri', 'lukujarjestys', 'yliopistojen-kalenterit', 'ylioppilaskirjoitukset', 'opiskelukalenteri', 'hakukalenteri'],
  shift: ['tyovuorosuunnittelija', 'tyopaivat'],
  personal: ['paivasuunnittelija', 'oma-kalenteri', 'oma-arki', 'luo-kalenteri', 'tyhja-kalenteri', 'paivakirja', 'tehtavalista'],
  security: ['asetukset', 'tietosuoja', 'evasteet', 'kayttoehdot', 'saavutettavuus', 'omat-tiedot'],
  contact: ['yhteystiedot', 'palaute', 'yhteys'],
  reading: ['blogi', 'oppaat', 'lahteet', 'toimitusperiaatteet', 'tietoa', 'usein-kysyttya', 'valokuvat-ja-lisenssit', 'valokuvat', 'kuvat'],
  garden: ['kylvokalenteri', 'kausimuistutukset'],
};

function baseRoute(value) {
  return String(value ?? '').split(/[?#]/, 1)[0].split('/').filter(Boolean)[0]?.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase() || '';
}

export function sceneFamily(base) {
  const route = baseRoute(base);
  return Object.entries(FAMILY_ROUTES).find(([, routes]) => routes.includes(route))?.[0] || 'discovery';
}

function hash(value) {
  let n = 2166136261;
  for (const c of String(value)) n = Math.imul(n ^ c.charCodeAt(0), 16777619);
  return n >>> 0;
}

function random(seed) {
  let n = seed >>> 0;
  return () => ((n = Math.imul(1664525, n) + 1013904223 >>> 0) / 4294967296);
}

export function toolScene({base = '', seed = 0, accent = '#0b4d83'} = {}) {
  const family = sceneFamily(base);
  const route = baseRoute(base);
  const n = hash(`${route}:${seed}`);
  const rnd = random(n);
  const prefix = `ts-${n.toString(36)}`;
  const url = name => `url(#${prefix}-${name})`;
  const color = /^#[0-9a-f]{3}(?:[0-9a-f]{3})?$/i.test(accent) ? accent : '#0b4d83';
  const rect = (x, y, w, h, fill, r = 0, extra = '') => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${r}" fill="${fill}" ${extra}/>`;
  const path = (d, fill, extra = '') => `<path d="${d}" fill="${fill}" ${extra}/>`;
  const line = (d, stroke = '#7c9aaa', width = 2, extra = '') => path(d, 'none', `stroke="${stroke}" stroke-width="${width}" stroke-linecap="round" stroke-linejoin="round" ${extra}`);
  const circle = (x, y, r, fill, extra = '') => `<circle cx="${x}" cy="${y}" r="${r}" fill="${fill}" ${extra}/>`;
  const ellipse = (x, y, rx, ry, fill, extra = '') => `<ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${ry}" fill="${fill}" ${extra}/>`;
  const group = (body, transform = '', extra = '') => `<g${transform ? ` transform="${transform}"` : ''} ${extra}>${body}</g>`;
  const shadow = body => group(body, '', `filter="${url('shadow')}"`);
  const softShadow = (x, y, rx, ry, opacity = .14) => ellipse(x, y, rx, ry, '#1b3952', `opacity="${opacity}" filter="${url('blur')}"`);
  const smallLines = (x, y, lengths, step = 14, stroke = '#b9cbd3', width = 2) => lengths.map((length, i) => line(`M${x} ${y + i * step}h${length}`, stroke, width)).join('');
  const check = (x, y, size = 1, stroke = '#347e86') => group(line('M0 5l5 5L16-2', stroke, 2.6), `translate(${x} ${y}) scale(${size})`);

  const defs = `<defs>
    <linearGradient id="${prefix}-paper" x1="0" y1="0" x2=".7" y2="1"><stop stop-color="#ffffff"/><stop offset=".7" stop-color="#f9fbfa"/><stop offset="1" stop-color="#d9e3e5"/></linearGradient>
    <linearGradient id="${prefix}-paper-left" x1="0" y1="0" x2="1" y2="0"><stop stop-color="#eef3f2"/><stop offset=".15" stop-color="#fff"/><stop offset=".82" stop-color="#f8fbfa"/><stop offset="1" stop-color="#c3d0d4"/></linearGradient>
    <linearGradient id="${prefix}-paper-right" x1="0" y1="0" x2="1" y2="0"><stop stop-color="#bdced3"/><stop offset=".12" stop-color="#f3f8f7"/><stop offset=".5" stop-color="#fff"/><stop offset="1" stop-color="#e3edec"/></linearGradient>
    <linearGradient id="${prefix}-navy" x1="0" y1="0" x2=".85" y2="1"><stop stop-color="#285879"/><stop offset=".35" stop-color="${color}"/><stop offset="1" stop-color="#082a46"/></linearGradient>
    <linearGradient id="${prefix}-teal" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#b2dcd7"/><stop offset=".35" stop-color="#6eb2b3"/><stop offset="1" stop-color="#26727b"/></linearGradient>
    <linearGradient id="${prefix}-silver" x1="0" y1="0" x2=".9" y2="1"><stop stop-color="#eef4f5"/><stop offset=".25" stop-color="#c5d3d9"/><stop offset=".45" stop-color="#fcfefe"/><stop offset=".6" stop-color="#b4c5cd"/><stop offset="1" stop-color="#78919f"/></linearGradient>
    <linearGradient id="${prefix}-metal" x1="0" y1="0" x2="1" y2="0"><stop stop-color="#8195a2"/><stop offset=".23" stop-color="#eaf1f2"/><stop offset=".42" stop-color="#fff"/><stop offset=".65" stop-color="#b1c3cb"/><stop offset="1" stop-color="#67818f"/></linearGradient>
    <linearGradient id="${prefix}-glass" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#e9f6f4"/><stop offset=".4" stop-color="#cae7e6"/><stop offset="1" stop-color="#79b3bf"/></linearGradient>
    <linearGradient id="${prefix}-screen" x1="0" y1="0" x2=".9" y2="1"><stop stop-color="#e5efeb"/><stop offset="1" stop-color="#b8cbc6"/></linearGradient>
    <linearGradient id="${prefix}-green" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#adc8a1"/><stop offset=".42" stop-color="#619178"/><stop offset="1" stop-color="#27564e"/></linearGradient>
    <linearGradient id="${prefix}-wood" x1="0" y1="0" x2="1" y2=".15"><stop stop-color="#d9bc8d"/><stop offset=".28" stop-color="#e7d0a3"/><stop offset=".45" stop-color="#b38d5a"/><stop offset=".7" stop-color="#e5c997"/><stop offset="1" stop-color="#aa8251"/></linearGradient>
    <linearGradient id="${prefix}-gold" x1="0" y1="0" x2=".8" y2="1"><stop stop-color="#f2d8a0"/><stop offset=".3" stop-color="#d1af6c"/><stop offset=".5" stop-color="#f6e5bf"/><stop offset="1" stop-color="#967640"/></linearGradient>
    <radialGradient id="${prefix}-ceramic" cx=".31" cy=".24" r=".8"><stop stop-color="#fff"/><stop offset=".7" stop-color="#e9efec"/><stop offset="1" stop-color="#bacccc"/></radialGradient>
    <radialGradient id="${prefix}-soil" cx=".35" cy=".3"><stop stop-color="#666257"/><stop offset="1" stop-color="#323f3a"/></radialGradient>
    <filter id="${prefix}-shadow" x="-30%" y="-30%" width="170%" height="190%"><feDropShadow dx="0" dy="13" stdDeviation="12" flood-color="#163b50" flood-opacity=".18"/></filter>
    <filter id="${prefix}-near" x="-25%" y="-25%" width="160%" height="165%"><feDropShadow dx="0" dy="4" stdDeviation="3" flood-color="#143548" flood-opacity=".18"/></filter>
    <filter id="${prefix}-blur" x="-50%" y="-150%" width="200%" height="400%"><feGaussianBlur stdDeviation="12"/></filter>
  </defs>`;

  // Common objects use physical dimensions, seams and reflected light rather
  // than large flat symbols. The scenes below assemble distinct still lifes.
  function paper(x, y, w, h, rotation = 0, content = '') {
    return group(shadow(rect(4, 8, w, h, '#aebfc5', 5) + rect(2, 4, w, h, '#e0e8e7', 5) + rect(0, 0, w, h, url('paper'), 5, 'stroke="#d5e0e2"') + line(`M10 2h${w - 20}`, '#fff', 2)) + content, `translate(${x} ${y}) rotate(${rotation} ${w / 2} ${h / 2})`);
  }

  function pencil(x, y, rotation = 0, length = 250, fill = url('navy')) {
    return group(shadow(path(`M0 0h15v${length - 28}l-7.5 28L0 ${length - 28}Z`, fill) + rect(0, 0, 15, 22, url('metal'), 3) + path(`M0 ${length - 28}h15L7.5 ${length}Z`, url('wood')) + path(`M4.6 ${length - 10}h5.8L7.5 ${length}Z`, '#173446') + line(`M3 28v${length - 64}`, '#b4d5df', 1.5, 'opacity=".7"') + line(`M12 29v${length - 66}`, '#082a40', 1.4, 'opacity=".6"')), `translate(${x} ${y}) rotate(${rotation})`);
  }

  function clock(x, y, radius = 96, rotation = 0) {
    let marks = '';
    for (let i = 0; i < 60; i++) {
      const angle = i * Math.PI / 30;
      const from = radius - 14;
      const to = from - (i % 5 ? 4 : 9);
      marks += line(`M${Math.sin(angle) * from} ${-Math.cos(angle) * from}L${Math.sin(angle) * to} ${-Math.cos(angle) * to}`, i % 5 ? '#96aeb5' : '#345f76', i % 5 ? 1.2 : 2.5);
    }
    return group(shadow(circle(0, 3, radius + 3, '#648391') + circle(0, 0, radius, url('silver')) + circle(0, 0, radius - 6, '#66818f') + circle(0, 0, radius - 9, url('paper'))) + marks + line(`M0 0l${-radius * .35} ${-radius * .23}`, '#204861', 6) + line(`M0 0l${radius * .25} ${-radius * .58}`, '#204861', 4) + line(`M${-radius * .25} ${radius * .37}L${radius * .4} ${-radius * .6}`, '#87aaa7', 1.8) + circle(0, 0, 6, url('metal')) + path(`M${-radius * .7} ${-radius * .45}A${radius * .84} ${radius * .84} 0 0 1 ${radius * .35} ${-radius * .77}`, 'none', 'stroke="#fff" stroke-width="3" opacity=".75"'), `translate(${x} ${y}) rotate(${rotation})`);
  }

  function leaf(x, y, scale = 1, rotation = 0, fill = url('green')) {
    return group(path('M0 0C-27-16-43-55-20-81C10-82 37-38 0 0Z', fill) + line('M0-3Q-8-35-18-74M-6-24-25-37M-10-42 7-61', '#d8e7cf', 1.3, 'opacity=".65"'), `translate(${x} ${y}) rotate(${rotation}) scale(${scale})`);
  }

  function cup(x, y, radius = 54, tea = false) {
    return group(shadow(ellipse(0, 8, radius + 23, radius + 12, url('ceramic')) + ellipse(0, 7, radius + 13, radius + 3, 'none', 'stroke="#cfdddc" stroke-width="2"') + ellipse(radius + 4, -8, 22, 17, 'none', `stroke="${url('ceramic')}" stroke-width="13"`) + circle(0, -6, radius, url('ceramic')) + circle(0, -6, radius - 9, tea ? '#aa8151' : '#674d3c') + circle(0, -6, radius - 12, tea ? '#be965c' : '#947457')) + (tea ? path('M-25-23q20-13 36 0q-18 17-36 0', '#e3c88f', 'opacity=".55"') : path('M-22-4C-41-25-8-41 0-17C10-40 36-23 20-8L0 10Z', '#ead9b4', 'opacity=".93"')) + path(`M${-radius * .72} ${-radius * .56}a${radius * .83} ${radius * .83} 0 0 1 ${radius * .88} ${-radius * .3}`, 'none', 'stroke="#fff" stroke-width="3" opacity=".9"'), `translate(${x} ${y})`);
  }

  function book(x, y, w, h, rotation = 0, fill = url('navy'), decoration = true) {
    return group(shadow(rect(0, 5, w, h, '#223f52', 7) + rect(5, 0, w - 5, h - 3, url('paper'), 5) + rect(0, -6, w, h - 8, fill, 7) + rect(10, -6, 8, h - 8, '#fff', 0, 'opacity=".13"') + line(`M25 5h${w - 37}v${h - 30}h-${w - 37}Z`, '#c5dbe0', 1, 'opacity=".35"')) + (decoration ? line(`M${w * .3} ${h * .39}h${w * .4}m-${w * .34} 14h${w * .28}`, '#c7dedf', 3, 'opacity=".8"') : '') + path(`M${w - 39} ${h - 8}v30l-9-7-9 7v-30Z`, '#84b3b2'), `translate(${x} ${y}) rotate(${rotation} ${w / 2} ${h / 2})`);
  }

  function openBook(x, y, width = 630, height = 350, rotation = 0, content = '') {
    const w = width / 2;
    const page = height - 24;
    const covers = path(`M0 20Q${w * .55} -10 ${w} 20Q${w * 1.45} -10 ${width} 20v${page}Q${w * 1.45} ${page - 19} ${w} ${height}Q${w * .55} ${page - 19} 0 ${page}Z`, url('navy'));
    const sheets = path(`M9 10Q${w * .55} -11 ${w} 21Q${w * 1.45} -11 ${width - 9} 10v${page - 5}Q${w * 1.45} ${page - 23} ${w} ${height - 9}Q${w * .55} ${page - 23} 9 ${page - 5}Z`, '#c2d0d4') + path(`M13 3Q${w * .53} -18 ${w} 16V${height - 19}Q${w * .55} ${page - 29} 13 ${page - 14}Z`, url('paper-left')) + path(`M${w} 16Q${w * 1.47} -18 ${width - 13} 3v${page - 17}Q${w * 1.45} ${page - 29} ${w} ${height - 19}Z`, url('paper-right'));
    return group(shadow(covers + sheets) + line(`M${w} 24v${height - 56}`, '#7d9ca8', 1, 'opacity=".55"') + content, `translate(${x} ${y}) rotate(${rotation} ${width / 2} ${height / 2})`);
  }

  function sun(x, y, r = 16) {
    return circle(x, y, r, '#d1b777') + Array.from({length: 8}, (_, i) => {
      const a = i * Math.PI / 4;
      return line(`M${x + Math.cos(a) * (r + 5)} ${y + Math.sin(a) * (r + 5)}l${Math.cos(a) * 5} ${Math.sin(a) * 5}`, '#b99c62', 2);
    }).join('');
  }

  function moon(x, y, r = 17) {
    return path(`M${x + r * .6} ${y - r * .76}A${r} ${r} 0 1 0 ${x + r * .65} ${y + r * .7}A${r * .79} ${r * .79} 0 0 1 ${x + r * .6} ${y - r * .76}Z`, '#416c87');
  }

  function calculator() {
    const sheet = paper(612, 104, 295, 360, 7,
      rect(28, 30, 102, 9, '#5c929c', 4) + smallLines(28, 58, [215, 180], 15) +
      Array.from({length: 6}, (_, i) => rect(27, 105 + i * 31, 19, 18, '#e1eceb', 4) + (i < 4 ? check(31, 110 + i * 31, .65) : '') + line(`M62 ${114 + i * 31}h${113 + Math.round(rnd() * 70)}`, '#9bb3ba', 2) + circle(241, 114 + i * 31, 3, '#83aaa9')).join('') +
      line('M28 306h238', '#c4d4d7', 1) + rect(183, 322, 82, 12, '#b8d3d1', 6));
    const keys = Array.from({length: 20}, (_, i) => {
      const x = 28 + i % 4 * 51, y = 139 + Math.floor(i / 4) * 43;
      const operation = i % 4 === 3;
      const glyph = operation ? (i === 19 ? line(`M${x + 16} ${y + 13}h15m-15 6h15`, '#e8f5f6', 2.3) : i === 3 ? line(`M${x + 22} ${y + 10}v14m-7-7h14`, '#e8f5f6', 2.3) : i === 7 ? line(`M${x + 15} ${y + 17}h15`, '#e8f5f6', 2.3) : i === 11 ? line(`M${x + 17} ${y + 11}l11 12m-11 0 11-12`, '#e8f5f6', 2.3) : line(`M${x + 16} ${y + 17}h14`, '#e8f5f6', 2.3) + circle(x + 23, y + 10, 1.6, '#e8f5f6') + circle(x + 23, y + 24, 1.6, '#e8f5f6')) : circle(x + 21.5, y + 17, 1.6, '#86a0ac');
      return rect(x, y + 3, 43, 34, '#8b9da7', 7) + rect(x, y, 43, 34, operation ? url('navy') : url('paper'), 7, 'stroke="#cedade" stroke-width=".8"') + glyph;
    }).join('');
    const digits = [
      'M0 0h22m0 0v20m0 0H0m22 0v20m0 0H0',
      'M0 0v20m0 0h22m0-20v40',
      'M0 0h22m-22 0v20m0 0h22m0 0v20m0 0H0',
    ].map((d, i) => group(line(d, '#365b59', 4), `translate(${97 + i * 35} 61)`)).join('');
    const machine = group(shadow(rect(3, 9, 257, 375, '#16374e', 22) + rect(0, 0, 257, 375, url('silver'), 22, 'stroke="#afc2cb" stroke-width="1.2"') + line('M22 3h212', '#fff', 2) + rect(20, 28, 217, 85, '#47656a', 9) + rect(25, 34, 207, 74, url('screen'), 5)) + digits + circle(44, 51, 3, '#728d7c') + keys + line('M26 363h205', '#eaf3f5', 1.5), 'translate(303 89) rotate(-9 129 188)');
    return softShadow(590, 477, 348, 18) + sheet + machine + pencil(986, 191, 19, 284) + group(rect(0, 0, 206, 25, url('glass'), 3, 'opacity=".75" stroke="#88b8bd"') + Array.from({length: 32}, (_, i) => line(`M${7 + i * 6} 2v${i % 5 ? 5 : 11}`, '#658f9d', 1)).join(''), 'translate(604 441) rotate(-5)');
  }

  function vacation() {
    const map = group(shadow(path('M0 32 140 4 280 32 420 4v231l-140 28-140-28L0 263Z', url('paper'))) + path('M0 32 140 4v231L0 263Z', '#e4efeb') + path('M140 4 280 32v231l-140-28Z', '#f7faf4') + path('M280 32 420 4v231l-140 28Z', '#e8f2ef') + path('M0 84C87 101 74 57 145 102S263 174 286 118S381 78 420 91v44c-61-18-61 35-117 28S202 117 153 143S42 160 0 127Z', '#a6cdcf') + path('M21 192C86 176 101 203 140 170S223 200 267 178S353 202 401 168', 'none', 'stroke="#fff" stroke-width="12"') + path('M17 192C74 178 110 208 148 171S221 201 268 178S353 202 402 168', 'none', 'stroke="#b3c3bc" stroke-width="2"') + line('M84 54 115 137 53 223M209 44 236 125 204 219M351 46 329 117 372 218', '#c1d8cb', 2) + line('M86 166C140 87 212 122 266 181S339 149 367 84', '#356f86', 3, 'stroke-dasharray="3 8"') + [ [86,166], [266,181], [367,84] ].map(([x,y]) => path(`M${x} ${y}c-23-24-17-40 0-40s23 16 0 40Z`, url('navy')) + circle(x, y-24, 5, '#eff9f5')).join('') + line('M140 12v215M280 40v215', '#719997', 1, 'opacity=".3"'), 'translate(190 206) rotate(-9 210 132)');
    const luggage = group(shadow(line('M87 8v-40q0-9 10-9h74q10 0 10 9V8', url('metal'), 13) + rect(70, -41, 128, 17, url('navy'), 7) + rect(0, 0, 269, 316, '#173b4c', 26) + rect(0, -7, 269, 309, url('teal'), 26, 'stroke="#418d98" stroke-width="2"') + rect(12, 5, 245, 285, 'none', 19, 'stroke="#d6eeea" stroke-opacity=".5" stroke-width="2"')) + [49,91,133,175,217].map(x=>rect(x, 26, 9, 239, '#185f6b', 5, 'opacity=".18"') + line(`M${x+2} 30v230`, '#cae9e4', 1.5, 'opacity=".5"')).join('') + line('M9 270h250', '#245f6f', 2, 'opacity=".7"') + rect(241, 117, 20, 49, url('metal'), 5) + rect(80, 125, 107, 66, url('paper'), 7, 'transform="rotate(-9 134 158)"') + path('M123 145h27m-14-11v26m-14-11 14-7 16 7', 'none', 'stroke="#5e8a9d" stroke-width="3" stroke-linejoin="round"') + circle(43, 313, 11, '#214958') + circle(224, 313, 11, '#214958'), 'translate(681 116) rotate(9 135 158)');
    const glasses = group(shadow(path('M0 0q14-12 66-7l-1 42q-8 30-39 23Q0 52 0 0Zm79-7q50-5 67 7q0 50-27 57-33 5-39-22Z', url('navy'))) + path('M7 3q22-8 50-3v32q-3 25-26 19Q10 47 7 3Zm81-3q28-5 51 3q-2 45-25 48-22 4-24-21Z', '#8fbdc5', 'fill-opacity=".78"') + line('M65 7q7-6 15 0', '#1f4357', 5) + line('M5 5-21-30M144 5l22-26', '#24485a', 6) + line('M11 9l27-4M95 6l26-1', '#d5edee', 3, 'opacity=".85"'), 'translate(254 145) rotate(-12)');
    const ticket = paper(603, 387, 253, 82, -12, line('M180 7v68', '#a2bcc1', 1.5, 'stroke-dasharray="3 4"') + smallLines(22, 21, [109, 80], 12) + Array.from({length:23},(_,i)=>rect(20+i*6, 53, i%3===0?3:1.5, 15, '#597e8e')).join('') + path('M214 17v43m-12-17 24-10m-12-4-6-7m6 21 6 9', 'none', 'stroke="#548d9b" stroke-width="3"'));
    return softShadow(625, 482, 377, 17) + map + luggage + glasses + ticket;
  }

  function familyPlanner() {
    const colors = ['#3f8192', '#89b7ac', '#c3ad7d', '#779ab2'];
    const w = 646, h = 358;
    let entries = '';
    for (let column = 0; column < 4; column++) {
      const x = 34 + column * 148;
      entries += circle(x+55, 50, 17, colors[column]) + circle(x+55, 45, 5, '#f2faf7') + path(`M${x+45} 59q2-12 10-12t10 12Z`, '#f2faf7') + line(`M${x+11} 83h88`, colors[column], 4);
      for (let row=0;row<5;row++) {
        const y = 108+row*43;
        entries += rect(x, y, 127, 33, (row+column)%3 ? '#e9f1ef' : colors[column], 6, (row+column)%3 ? '' : 'fill-opacity=".24"') + circle(x+12, y+11, 3, colors[column]) + line(`M${x+22} ${y+10}h${43+Math.round(rnd()*48)}`, '#628390', 2) + line(`M${x+22} ${y+21}h${32+Math.round(rnd()*28)}`, '#a7bec3', 1.7);
      }
    }
    const board = group(shadow(rect(-9,-9,w+18,h+18,url('wood'),12) + rect(-3,-3,w+6,h+6,'#e5eae2',7)) + rect(0,0,w,h,url('paper'),5) + entries + [37,608].map(x=>circle(x, 12, 7, url('metal'))).join(''), 'translate(244 98) rotate(-3 323 179)');
    const key = group(shadow(circle(0,0,21,url('gold')) + circle(0,0,11,'none','stroke="#748d8b" stroke-width="5"') + path('M17 0h75v11H80v12H65V11H17Z',url('gold'))) + circle(-3,-3,8,'#eef3ec','opacity=".8"'), 'translate(864 450) rotate(-27)');
    const heart = group(shadow(path('M0 22C-46-6-39-40-15-40q12 0 15 11 4-11 16-11 30 0 17 31Q24 6 0 22Z', url('teal'))) + path('M-25-24q7-14 20-7', 'none', 'stroke="#d8eeea" stroke-width="3" opacity=".75"'), 'translate(962 210) rotate(17)');
    return softShadow(607, 474, 348, 18) + board + heart + key + pencil(189, 228, -12, 254, url('teal')) + paper(302, 389, 173, 88, 8, circle(26, 25, 9, '#d6e7df') + check(20,23,.7) + smallLines(49,24,[88,68],14) + line('M25 61h121','#c4d6d6',2));
  }

  function school() {
    let inside = '';
    for(let i=0;i<7;i++) inside += line(`M34 ${66+i*30}h212`,'#bfced4',1.1);
    inside += rect(36,33,113,8,'#75a3a9',4) + line('M58 56v226','#c8dfde',2);
    for(let i=0;i<5;i++) {
      const x=338+i*49;
      inside += rect(x,38,40,17,i%2?'#bdd7d3':'#83aeb6',4);
      for(let j=0;j<6;j++) inside += rect(x,68+j*34,40,27,(i+j)%3===0?'#a7c9c7':(i+j)%3===1?'#dae6e6':'#cedcd8',4) + (j%3===i%3 ? line(`M${x+9} ${81+j*34}h22`,'#5c8790',2) : '');
    }
    const rings = [67,168,270].map(y=>ellipse(299,y,22,10,'none',`stroke="${url('metal')}" stroke-width="6"`) + line(`M284 ${y+4}h25`, '#fff', 1.5, 'opacity=".8"')).join('');
    const binder = openBook(259,113,613,356,-4,inside+rings);
    const books = book(785,330,211,119,12,url('teal'),false) + book(795,309,205,119,9,url('navy'),false);
    const protractor = group(shadow(path('M-98 0A98 98 0 0 1 98 0Z', '#c9e5e3', 'fill-opacity=".62" stroke="#78adb4" stroke-width="2"')) + path('M-64 0A64 64 0 0 1 64 0Z','none','stroke="#8ab0b7" stroke-width="1.3"') + Array.from({length:19},(_,i)=>{const a=Math.PI+i*Math.PI/18; return line(`M${Math.cos(a)*92} ${Math.sin(a)*92}l${-Math.cos(a)*(i%3?7:13)} ${-Math.sin(a)*(i%3?7:13)}`,'#598c9b',1.2)}).join('') + line('M-89-1h178','#74a3ad',1.2), 'translate(892 204) rotate(24)');
    return softShadow(604,484,363,16) + books + binder + protractor + pencil(192,171,-12,290) + pencil(216,175,-5,262,url('wood'));
  }

  function shift() {
    let schedule = rect(24,65,408,252,'#f6faf8',5);
    for(let row=0;row<5;row++) {
      const y=88+row*46;
      schedule += row%2 ? moon(47,y,11) : sun(47,y,8);
      schedule += line(`M76 ${y+20}h335`, '#d3dfdf', 1);
      for(let col=0;col<7;col++) schedule += rect(85+col*46,y-10,34,19,(col+row+Math.floor(rnd()*2))%4===0?'#e0e9e8':row%2?'#5e829b':'#7fb5ad',5);
    }
    const clipboard = group(shadow(rect(0,0,464,377,url('navy'),15) + rect(14,16,436,347,url('paper'),7)) + line('M34 42h180','#76a1ab',7) + schedule + shadow(rect(169,-11,125,36,url('metal'),7) + rect(185,-20,93,35,url('silver'),9) + rect(201,-17,61,8,'#91a6af',4)), 'translate(259 94) rotate(-5 232 189)');
    const badge = group(shadow(rect(0,0,151,102,url('paper'),12,'stroke="#c4d4d7"') + rect(63,-15,26,25,url('metal'),7)) + circle(40,43,17,'#bbd4d6') + circle(40,38,5,'#588595') + path('M28 53q1-14 12-14t12 14Z','#588595') + smallLines(71,32,[56,39],12) + Array.from({length:21},(_,i)=>rect(24+i*5,74,i%4===0?2.4:1.1,12,'#547786')).join(''), 'translate(786 365) rotate(9)');
    return softShadow(604,486,335,17) + clipboard + clock(853,225,108,9) + badge + pencil(178,173,-10,271,url('teal'));
  }

  function personal() {
    let content = rect(42,38,119,9,'#6a9ca6',4) + smallLines(42,67,[185,171,194],20);
    for(let i=0;i<5;i++) content += circle(51,156+i*28,7,'none','stroke="#9dbbbb" stroke-width="1.5"') + (i<3?check(47,154+i*28,.48):'') + line(`M70 ${156+i*28}h${118+Math.round(rnd()*56)}`,'#a8bec1',1.8);
    content += circle(452,111,55,'none','stroke="#dbe9e4" stroke-width="9"') + path('M452 56a55 55 0 1 1-51 76','none','stroke="#6fa6a8" stroke-width="9" stroke-linecap="round"') + leaf(449,135,.44,-10,url('teal')) + smallLines(356,208,[201,169,188,146],20) + path('M489 1v78l-13-10-13 10V0Z','#99beb8');
    const notebook = openBook(241,116,643,343,-4,content);
    const clip = group(path('M0 40V6q0-19 12-19T24 6v39q0 12-9 12T6 45V6q0-8 5-8t5 8v34','none',`stroke="${url('metal')}" stroke-width="4" stroke-linecap="round"`),'translate(422 99) rotate(-13)');
    return softShadow(613,479,351,19) + notebook + clip + cup(929,192,50,true) + pencil(918,308,17,186) + leaf(187,430,.88,-30) + leaf(205,445,.68,27) + leaf(228,430,.6,62);
  }

  function security() {
    const screen = rect(0,0,627,337,'#355568',18) + rect(5,3,617,323,url('silver'),16) + rect(17,17,593,296,'#0c2d43',10) + rect(28,28,571,275,'#f0f6f5',4) + circle(313,9,2,'#557482') + rect(28,28,571,30,'#dce9e8',4) + circle(46,43,3,'#a5bfc1') + circle(59,43,3,'#a5bfc1') + circle(72,43,3,'#a5bfc1') + rect(98,38,157,9,'#bdd2d3',4);
    const toggles = [0,1,2].map(i=>rect(374,90+i*59,163,46,'#e3eeee',8) + smallLines(389,107+i*59,[62,44],10,'#9eb7bd',1.6) + rect(484,102+i*59,39,21,i===1?'#c1d2d4':'#70a6a6',11) + circle(i===1?495:512,112+i*59,8,'#fafdfe')).join('');
    const shield = shadow(path('M201 72 309 105v89q0 71-108 111Q93 265 93 194v-89Z', url('silver'),'stroke="#b0c8ce" stroke-width="2"') + path('M201 82 298 112v80q0 63-97 100-97-37-97-100v-80Z',url('navy'))) + line('M117 121 201 95l84 26','#84b5c5',2,'opacity=".7"') + line('M173 162v-19q0-28 28-28t28 28v19',url('metal'),11) + rect(158,158,86,75,url('paper'),12) + circle(201,187,9,'#4d7589') + path('M197 189h8l3 20h-14Z','#4d7589');
    const laptop = group(shadow(screen) + toggles + shield + shadow(path('M0 331h627l60 48q7 8-7 10H-45q-15-2-7-10Z',url('silver'),'stroke="#9cb5c0" stroke-width="1.2"') + path('M-52 379h738v8q-3 9-21 9H-34q-15 0-18-9Z','#728f9e')) + line('M8 346h608M-5 357h634M-20 368h663','#96aeb8',3,'stroke-dasharray="17 6"') + path('M262 373h105l14 16H248Z','#becdd3') + line('M-40 392h713','#e9f0f2',1.5), 'translate(279 93) rotate(-2 313 200)');
    const key = group(shadow(circle(0,0,27,url('gold'))+circle(0,0,12,'#e1ebe6')+path('M23-5h95v14h-13v17H89V9H70v14H53V9H23Z',url('gold'))) + line('M32-1h77','#f9ebc8',2), 'translate(190 398) rotate(-18)');
    return softShadow(614,489,385,18) + laptop + key;
  }

  function contact() {
    const letter = paper(357,99,475,298,-7,rect(39,36,156,10,'#6e9fa8',5) + smallLines(39,76,[364,341,357,289,330,247],25,'#a9c0c6',2) + line('M42 251q34-31 43-8t38-1q19-15 39-2', '#5f8997', 2));
    const envelope = group(shadow(rect(0,0,527,245,url('paper'),9,'stroke="#b6ccd0"') + path('M0 0 263 147 527 0Z','#dcebe9','stroke="#bccfd1" stroke-width="1.3"')) + path('M0 245 198 97q63 41 131 0l198 148Z',url('paper'),'stroke="#ccdbdc" stroke-width="1.3"') + line('M9 235 188 105M518 235 339 105','#fafffc',2) + path('M0 0 263 164 527 0','none','stroke="#abc3c7" stroke-width="1.2"'), 'translate(321 220) rotate(-7 263 122)');
    const pen = group(shadow(path('M0 0h15v223l-7 30-8-30Z',url('navy')) + rect(0,15,15,12,url('metal'),2) + rect(0,205,15,15,url('metal'),2) + path('M0 223h15l-7 30Z',url('metal')) + line('M5 230v19','#506978',1.5) + line('M13 6h5v65',url('metal'),3) + line('M3 34v154','#8eb8c7',1.5)), 'translate(944 147) rotate(17)');
    const stamp = group(shadow(rect(0,0,103,103,url('paper'),3)) + rect(10,10,83,83,'#b4d7d4',2) + path('M18 72q14-25 31-4 20-42 35-4v20H18Z','#4a8c91') + circle(70,33,12,'#edf5de') + path('M22 55q22-12 61-2','none','stroke="#d8eeeb" stroke-width="2"') + Array.from({length:9},(_,i)=>circle(5+i*12,-1,3,'#eaf3ee')+circle(5+i*12,104,3,'#eaf3ee')+circle(-1,5+i*12,3,'#eaf3ee')+circle(104,5+i*12,3,'#eaf3ee')).join(''), 'translate(184 171) rotate(-14)');
    return softShadow(614,479,351,17) + letter + envelope + pen + stamp + line('M167 343q36-28 95 6m-97 10q36-28 95 6m-97 10q36-28 95 6','#81a5ad',2,'opacity=".55"');
  }

  function reading() {
    const content = rect(38,32,134,8,'#648f9c',3) + smallLines(38,60,[189,201,194,163,190,185],18,'#adc1c8',1.8) + rect(39,189,199,88,'#d7e8e4',5) + path('M40 260q41-73 89-26 55-83 109 10v33H40Z','#82ada9') + circle(195,209,13,'#ebecd3') + smallLines(353,42,[202,194,179,200,161,198,189,195,173,201,186,156,179],18,'#a4bac1',1.8) + path('M505-4v99l-12-9-12 9V-5Z',url('teal'));
    const pages = openBook(285,127,609,344,-6,content);
    const glasses = group(shadow(ellipse(0,0,40,31,'none',`stroke="${url('gold')}" stroke-width="4"`) + ellipse(94,0,40,31,'none',`stroke="${url('gold')}" stroke-width="4"`)) + ellipse(0,0,37,28,'#d7eef0','opacity=".19"') + ellipse(94,0,37,28,'#d7eef0','opacity=".19"') + line('M40-7q7-8 14 0',url('gold'),3) + line('M-40-8-57-62M134-8l10-57',url('gold'),4) + path('M-20-19q13-9 26-3m66 1q13-9 26-3','none','stroke="#fff" stroke-width="2" opacity=".8"'), 'translate(564 390) rotate(-13)');
    return softShadow(602,484,367,18) + book(166,225,157,227,-12,url('teal')) + pages + glasses + cup(967,175,48) + pencil(929,307,19,177,url('wood'));
  }

  function garden() {
    const pot = group(shadow(path('M-67 0h134L51 123q-51 22-102 0Z',url('ceramic')) + ellipse(0,0,73,24,url('ceramic')) + ellipse(0,0,60,17,url('soil'))) + ellipse(-11,-5,27,5,'#7b7b68','opacity=".35"') + line('M-53 29l10 75','#fff',3,'opacity=".6"') + line('M0-5Q-9-74 8-145','#447568',7) + leaf(0,-57,1.01,-53) + leaf(4,-91,.92,54) + leaf(8,-134,.73,7) + leaf(-4,-24,.75,-67), 'translate(816 323)');
    const packet = group(shadow(rect(0,0,227,295,url('paper'),8,'stroke="#c7d7d5"')) + rect(0,0,227,35,'#cadfd8',8) + rect(0,22,227,16,'#cadfd8') + line('M17 12h193','#91b6ae',1,'stroke-dasharray="2 3"') + ellipse(114,151,72,80,'#e3edda') + line('M113 218Q92 126 120 84','#4f7f66',5) + leaf(109,157,.6,-57) + leaf(111,132,.58,52) + leaf(120,91,.45,6) + ellipse(88,163,13,18,'#caa07e') + ellipse(132,143,15,18,'#d0aa88') + ellipse(97,114,12,15,'#be9174') + rect(43,244,141,7,'#789c8f',3) + rect(73,260,81,4,'#bacdc1',2), 'translate(323 147) rotate(-10 114 147)');
    const trowel = group(shadow(path('M-8 0h16l7 120q43 36 13 130-27-7-52-75 0-29 21-55Z',url('metal')) + rect(-13,-46,26,85,url('wood'),12)) + line('M-4 138q16 34 31 96','#fff',3,'opacity=".8"') + circle(0,-28,4,'#9d835e'), 'translate(626 236) rotate(-18)');
    const notes = paper(577,87,183,143,9, rect(21,25,72,7,'#8aaba1',3) + smallLines(21,49,[130,112,121],16) + leaf(124,119,.45,26));
    const seed = (x,y,r=1) => group(shadow(ellipse(0,0,8,5,'#b5a48a')) + line('M-4-1h7','#e4d3b3',1),`translate(${x} ${y}) rotate(${rnd()*150}) scale(${r})`);
    return softShadow(610,482,352,18) + notes + packet + pot + trowel + seed(277,433) + seed(257,448,.8) + seed(297,450,1.1) + seed(974,430) + seed(956,444,.75) + leaf(203,305,.95,-37);
  }

  function discovery() {
    const shelves = paper(276,103,542,362,-5,
      rect(29,27,147,9,'#6796a0',4) + smallLines(29,55,[352,277],13) +
      Array.from({length:6},(_,i)=>{
        const x=28+i%3*166,y=100+Math.floor(i/3)*113;
        return rect(x,y,150,94,'#e6f0ed',8) + rect(x+9,y+9,132,49,i%3===0?'#a8c9c5':i%3===1?'#c5d7dd':'#c8d6c1',5) + (i===0?path(`M${x+17} ${y+52}q28-35 47-16 41-44 68 16Z`,'#5b9293'):i===1?line(`M${x+31} ${y+24}h90m-90 11h64m-64 11h78`,'#70939e',3):i===2?leaf(x+79,y+54,.5,22):i===3?sun(x+75,y+34,12):i===4?moon(x+75,y+34,17):check(x+63,y+31,1.3)) + line(`M${x+12} ${y+72}h${82+i*5}`,'#7d9ca5',2) + line(`M${x+12} ${y+82}h${58+i*4}`,'#b0c5c8',1.7);
      }).join(''));
    const lens = group(shadow(circle(0,0,90,url('silver')) + circle(0,0,82,'#456d80') + circle(0,0,75,url('glass'),'fill-opacity=".66"') + path('M62 64 162 164q11 12 24-1t0-25L85 39Z',url('navy')) + rect(137,132,40,43,url('metal'),5,'transform="rotate(-44 157 153)"')) + path('M-56-30q25-47 73-33','none','stroke="#fff" stroke-width="5" opacity=".8"') + path('M-44 18q13 32 52 35','none','stroke="#e6faf7" stroke-width="2" opacity=".7"'), 'translate(814 268) rotate(9)');
    return softShadow(610,484,360,18) + book(179,246,160,211,-13,url('teal')) + shelves + lens + pencil(960,141,16,239,url('wood'));
  }

  const draw = {calculator, vacation, family: familyPlanner, school, shift, personal, security, contact, reading, garden, discovery}[family];
  // A barely visible cool pool grounds the still life without imposing a
  // background on the outer renderer or competing with its title strip.
  return defs + ellipse(612,306,434,209,'#e0eeee','opacity=".25"') + draw();
}
