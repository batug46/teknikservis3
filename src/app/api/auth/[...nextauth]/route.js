import NextAuth from 'next-auth';
import { authOptions } from '../../../../lib/auth';
import { addCorsHeaders, handleCors } from '../../../../lib/cors';

const handler = NextAuth(authOptions);

export async function GET(request) {
  const corsResponse = handleCors(request);
  if (corsResponse) return corsResponse;

  const response = await handler(request);
  return addCorsHeaders(response, request.headers.get('origin'));
}

export async function POST(request) {
  const corsResponse = handleCors(request);
  if (corsResponse) return corsResponse;

  const response = await handler(request);
  return addCorsHeaders(response, request.headers.get('origin'));
} 