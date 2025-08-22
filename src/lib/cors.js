// NextJS API Routes için CORS helper
export function addCorsHeaders(response, origin) {
  const allowedOrigins = [
    'http://localhost:3000',
    'https://tekniverse.xyz',
    'http://tekniverse.xyz'
  ];

  // Origin kontrolü
  if (!origin || allowedOrigins.includes(origin)) {
    response.headers.set('Access-Control-Allow-Origin', origin || '*');
  }

  response.headers.set('Access-Control-Allow-Credentials', 'true');
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');

  return response;
}

export function handleCors(request) {
  const origin = request.headers.get('origin');
  
  // OPTIONS request için preflight response
  if (request.method === 'OPTIONS') {
    const response = new Response(null, { status: 200 });
    return addCorsHeaders(response, origin);
  }

  return null;
}
