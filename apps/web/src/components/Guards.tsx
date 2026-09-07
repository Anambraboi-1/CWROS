import { Navigate, Outlet } from 'react-router-dom';
import { useSession } from '../lib/session';

export function RequireAuth() {
  const token = useSession((s) => s.token);
  return token ? <Outlet /> : <Navigate to="/login" replace />;
}

export function RequireGuest() {
  const token = useSession((s) => s.token);
  return token ? <Navigate to="/" replace /> : <Outlet />;
}

export function RequireAdmin() {
  const role = useSession((s) => s.user?.role);
  return role === 'ADMIN' ? <Outlet /> : <Navigate to="/" replace />;
}
