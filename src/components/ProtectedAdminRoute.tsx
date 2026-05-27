import type { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { isAdminLoggedIn } from '../lib/adminAuth';

export function ProtectedAdminRoute({ children }: { children: ReactNode }) {
  if (!isAdminLoggedIn()) {
    return <Navigate to="/admin/login" replace />;
  }
  return <>{children}</>;
}
