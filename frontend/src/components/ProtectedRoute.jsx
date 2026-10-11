import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getDashboardPath } from "../utils/roleRoutes";

export default function ProtectedRoute({ allowedRoles }) {
  const { user, isAuthenticated, checking } = useAuth();
  if (checking) return <div className="min-h-screen grid place-items-center text-slate-500">Restoring your session…</div>;

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (!allowedRoles.includes(user.role)) {
    return (
      <Navigate
        to={getDashboardPath(user.role)}
        replace
      />
    );
  }

  return <Outlet />;
}