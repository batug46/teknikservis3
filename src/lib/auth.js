import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'SENIN_COK_GUCLU_VE_OZEL_ANAHTARIN_BURAYA';

export async function verifyAuth(reqOrToken) {
  try {
    let token;
    if (typeof reqOrToken === 'string') {
      token = reqOrToken;
    } else {
      token = reqOrToken.headers.get('authorization')?.split(' ')[1];
    }
    
    if (!token) return null;
    const decoded = jwt.verify(token, JWT_SECRET);
    return decoded;
  } catch (error) {
    return null;
  }
}

export function verifyCredentials(email, password) {
  // Sabit admin bilgileri
  const adminEmail = 'admin@example.com';
  const adminPassword = 'admin123';

  if (email === adminEmail && password === adminPassword) {
    return {
      id: 1,
      email: adminEmail,
      role: 'admin',
      name: 'Admin',
      adSoyad: 'Admin User'
    };
  }
  return null;
}

export const generateToken = (user) => {
  return jwt.sign(
    {
      userId: user.id,
      email: user.email,
      role: user.role
    },
    JWT_SECRET,
    { expiresIn: '24h' }
  );
};

export const isAdmin = (user) => {
  return user?.role === 'admin';
}; 