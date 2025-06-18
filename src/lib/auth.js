import { jwtVerify } from 'jose';
import { cookies } from 'next/headers';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'your-super-secret-key-that-is-long-enough'
);

export async function verifyAuth(request) {
  const cookieStore = cookies();
  const token = cookieStore.get('token')?.value;
  
  if (!token) return null;
  
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload;
  } catch (err) {
    console.error('Token verification error:', err);
    return null;
  }
}

export async function verifyToken(token) {
  if (!token) return false;
  
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload.role === 'admin';
  } catch (err) {
    console.error('Token verification error:', err);
    return false;
  }
}
