import { Navigate } from "react-router-dom";
import { isAdminLoggedIn } from "../lib/adminAuth";
function ProtectedAdminRoute({ children }) {
  if (!isAdminLoggedIn()) {
    return <Navigate to="/admin/login" replace />;
  }
  return <>{children}</>;
}
export {
  ProtectedAdminRoute
};
