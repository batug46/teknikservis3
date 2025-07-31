import rateLimit from 'express-rate-limit';
import helmet from 'helmet';

// Rate limiting middleware
export const createRateLimiter = (windowMs = 15 * 60 * 1000, max = 100) => {
  return rateLimit({
    windowMs,
    max,
    message: {
      error: 'Çok fazla istek gönderildi. Lütfen daha sonra tekrar deneyin.',
      retryAfter: Math.ceil(windowMs / 1000)
    },
    standardHeaders: true,
    legacyHeaders: false,
  });
};

// Login rate limiter (daha sıkı)
export const loginRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 dakika
  max: 5, // 5 deneme
  message: {
    error: 'Çok fazla giriş denemesi. Lütfen 15 dakika sonra tekrar deneyin.',
    retryAfter: 900
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Register rate limiter
export const registerRateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 saat
  max: 3, // 3 kayıt denemesi
  message: {
    error: 'Çok fazla kayıt denemesi. Lütfen 1 saat sonra tekrar deneyin.',
    retryAfter: 3600
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// API rate limiter
export const apiRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 dakika
  max: 100, // 100 istek
  message: {
    error: 'API limiti aşıldı. Lütfen daha sonra tekrar deneyin.',
    retryAfter: 900
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Helmet configuration
export const helmetConfig = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https:"],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
      connectSrc: ["'self'"],
      frameSrc: ["'none'"],
      objectSrc: ["'none'"],
      upgradeInsecureRequests: [],
    },
  },
  crossOriginEmbedderPolicy: false,
  crossOriginResourcePolicy: { policy: "cross-origin" },
});

// CORS configuration
export const corsConfig = {
  origin: process.env.NODE_ENV === 'production' 
    ? [process.env.NEXT_PUBLIC_SITE_URL] 
    : ['http://localhost:3000', 'http://localhost:3001'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

// Input sanitization
export const sanitizeInput = (input) => {
  if (typeof input !== 'string') return input;
  
  return input
    .replace(/[<>]/g, '') // Remove < and >
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+=/gi, '') // Remove event handlers
    .trim();
};

// Password strength validation
export const validatePasswordStrength = (password) => {
  const minLength = 8;
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumbers = /\d/.test(password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

  const errors = [];
  
  if (password.length < minLength) {
    errors.push(`Şifre en az ${minLength} karakter olmalıdır`);
  }
  if (!hasUpperCase) {
    errors.push('Şifre en az bir büyük harf içermelidir');
  }
  if (!hasLowerCase) {
    errors.push('Şifre en az bir küçük harf içermelidir');
  }
  if (!hasNumbers) {
    errors.push('Şifre en az bir rakam içermelidir');
  }
  if (!hasSpecialChar) {
    errors.push('Şifre en az bir özel karakter içermelidir');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

// Email validation
export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// SQL Injection prevention
export const preventSQLInjection = (input) => {
  if (typeof input !== 'string') return input;
  
  const sqlKeywords = [
    'SELECT', 'INSERT', 'UPDATE', 'DELETE', 'DROP', 'CREATE', 'ALTER',
    'UNION', 'EXEC', 'EXECUTE', 'SCRIPT', 'DECLARE', 'CAST', 'CONVERT'
  ];
  
  const upperInput = input.toUpperCase();
  for (const keyword of sqlKeywords) {
    if (upperInput.includes(keyword)) {
      throw new Error('Geçersiz karakterler tespit edildi');
    }
  }
  
  return input;
}; 