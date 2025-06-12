import { jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'your-super-secret-key-that-is-long-enough'
);

/**
 * Gelen isteğin çerezindeki 'token'ı doğrular ve kullanıcı bilgilerini döndürür.
 * Edge Runtime ile uyumludur.
 */
export async function verifyAuth(request) {
  const token = request.cookies.get('token')?.value;

  if (!token) {
    return null;
  }

  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload;
  } catch (err) {
    console.error("Token doğrulama hatası (jose):", err.message);
    return null;
  }
}
