import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute({
  allowedRoles,
}) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="mx-auto mb-4 h-9 w-9 animate-spin rounded-full border-4 border-slate-200 border-t-primary-600" />

          <p className="text-sm font-semibold text-slate-700">
            Verifying your session...
          </p>

          <p className="mt-1 text-xs text-slate-400">
            Please wait
          </p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <Navigate
        to="/login"
        replace
        state={{ from: location }}
      />
    );
  }

  if (
    allowedRoles &&
    !allowedRoles.includes(user.role)
  ) {
    return (
      <Navigate
        to="/dashboard"
        replace
        state={{
          unauthorized: true,
        }}
      />
    );
  }

  return <Outlet />;
}