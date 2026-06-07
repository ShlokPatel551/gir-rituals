if (!process.env.JWT_SECRET && process.env.NODE_ENV === 'production') {
  throw new Error('JWT_SECRET environment variable must be set in production');
}
if (!process.env.JWT_SECRET) {
  console.warn('⚠️  JWT_SECRET not set — using insecure dev default. Set it before deploying.');
}

export const JWT_SECRET = process.env.JWT_SECRET || 'gir-rituals-dev-secret-do-not-use-in-production';
