import { Navigate, Outlet } from 'react-router-dom';
import { useSession } from '../lib/session';

export function RequireAdmin() {
  const role = useSession((s) => s.user?.role);
  return role === 'ADMIN' ? <Outlet /> : <Navigate to="/" replace />;
}
