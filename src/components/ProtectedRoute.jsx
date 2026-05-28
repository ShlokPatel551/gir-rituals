import { Navigate } from "react-router-dom";
import { useApp } from "../context/AppContext";
function ProtectedRoute({ children }) {
  const { session } = useApp();
  if (!session) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
}
export {
  ProtectedRoute
};
