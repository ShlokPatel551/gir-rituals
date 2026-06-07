import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { isAdminLoggedIn, restoreAdminSession } from "../lib/adminAuth";

function ProtectedAdminRoute({ children }) {
  const [ready, setReady] = useState(isAdminLoggedIn());

  useEffect(() => {
    if (isAdminLoggedIn()) return; // already have an in-memory session
    restoreAdminSession().finally(() => setReady(true));
  }, []);

  if (!ready) return null;
  if (!isAdminLoggedIn()) return <Navigate to="/admin/login" replace />;
  return <>{children}</>;
}

export { ProtectedAdminRoute };
