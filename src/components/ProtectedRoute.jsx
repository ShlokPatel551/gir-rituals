import { Navigate } from "react-router-dom";
import { useApp } from "../context/AppContext";

function ProtectedRoute({ children }) {
  const { authReady, session } = useApp();
  // Wait for the refresh-cookie check to complete before redirecting
  if (!authReady) return null;
  if (!session) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

export { ProtectedRoute };
