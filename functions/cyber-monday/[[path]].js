// Retired pages must not be served from an older Pages asset cache.
export function onRequest({request}) {
  return new Response(request.method === 'HEAD' ? null : 'Sivua ei löytynyt.\n', {
    status: 404,
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'no-store',
      'X-Robots-Tag': 'noindex',
      'X-Content-Type-Options': 'nosniff',
    },
  });
}
