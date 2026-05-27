import type { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';

export function ProtectedRoute({ children }: { children: ReactNode }) {
  const { session } = useApp();
  if (!session) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
}
