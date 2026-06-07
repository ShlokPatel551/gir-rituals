import jwt from 'jsonwebtoken';
import { JWT_SECRET as SECRET } from '../lib/secret.js';

export function requireAuth(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Unauthorized' });
  try {
    req.user = jwt.verify(token, SECRET);
    next();
  } catch {
    res.status(401).json({ error: 'Invalid or expired token' });
  }
}

export function requireAdmin(req, res, next) {
  requireAuth(req, res, () => {
    if (req.user.role !== 'admin' && !req.user.isAdmin)
      return res.status(403).json({ error: 'Forbidden' });
    next();
  });
}

// Flexible role guard: requireRole('admin', 'staff')
export function requireRole(...roles) {
  return (req, res, next) => {
    requireAuth(req, res, () => {
      const userRole = req.user.role || (req.user.isAdmin ? 'admin' : 'customer');
      if (!roles.includes(userRole))
        return res.status(403).json({ error: 'Forbidden' });
      next();
    });
  };
}
