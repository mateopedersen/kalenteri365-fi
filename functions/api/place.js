import {CITIES} from '../../src/calendar.mjs';

const normalize = value => String(value || '').toLocaleLowerCase('fi').normalize('NFD').replace(/\p{Diacritic}/gu, '');

export function onRequestGet({request}) {
  const location = request.cf || {};
  const latitude = Number(location.latitude), longitude = Number(location.longitude);
  const coordinatesValid = location.latitude != null && location.latitude !== '' && location.longitude != null && location.longitude !== '' &&
    Number.isFinite(latitude) && Number.isFinite(longitude) && Math.abs(latitude) <= 90 && Math.abs(longitude) <= 180;
  const inFinland = location.country === 'FI';
  const exact = inFinland && CITIES.find(city => normalize(city[1]) === normalize(location.city));
  let city = CITIES[0], detected = false;
  if (exact) {
    city = exact;
    detected = true;
  } else if (inFinland && coordinatesValid) {
    const distance = city => (city[2] - latitude) ** 2 + ((city[3] - longitude) * Math.cos(latitude * Math.PI / 180)) ** 2;
    city = CITIES.reduce((nearest, candidate) => distance(candidate) < distance(nearest) ? candidate : nearest);
    detected = true;
  }
  return Response.json({id: city[0], name: city[1], detected, approximate: true, source: detected ? 'ip' : 'default'}, {
    headers: {'Cache-Control': 'private, no-store', 'X-Robots-Tag': 'noindex', 'X-Content-Type-Options': 'nosniff'},
  });
}
