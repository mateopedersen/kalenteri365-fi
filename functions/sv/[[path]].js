export function onRequest() {
  return new Response(null, {
    status: 301,
    headers: {
      Location: 'https://kalenteri365.fi/',
      'Cache-Control': 'public, max-age=3600',
    },
  });
}
