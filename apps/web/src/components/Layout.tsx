import { NavLink, Outlet } from 'react-router-dom';
import { useSession } from '../lib/session';

export function Layout() {
  const { user, clear } = useSession();
  const isAdmin = user?.role === 'ADMIN';

  return (
    <div className="shell">
      <header>
        <div className="brand">
          <b>◈</b> CWROS <span>COMMAND CENTER</span>
        </div>
        <div className="operator">
          {user?.role} // {user?.email}{' '}
          <button className="text" onClick={clear}>
            Sign out
          </button>
        </div>
      </header>
      <aside>
        <p>OPERATIONS</p>
        <NavLink to="/" end className={({ isActive }) => (isActive ? 'active' : undefined)}>
          Overview
        </NavLink>
        <NavLink to="/routes" className={({ isActive }) => (isActive ? 'active' : undefined)}>
          Route optimization
        </NavLink>
        <NavLink to="/map" className={({ isActive }) => (isActive ? 'active' : undefined)}>
          Map view
        </NavLink>
        <NavLink to="/history" className={({ isActive }) => (isActive ? 'active' : undefined)}>
          Operation history
        </NavLink>
        {isAdmin && (
          <>
            <p>ADMINISTRATION</p>
            <NavLink to="/nodes" className={({ isActive }) => (isActive ? 'active' : undefined)}>
              Node registry
            </NavLink>
            <NavLink to="/edges" className={({ isActive }) => (isActive ? 'active' : undefined)}>
              Edge registry
            </NavLink>
            <NavLink to="/settings" className={({ isActive }) => (isActive ? 'active' : undefined)}>
              Configuration
            </NavLink>
            <NavLink to="/users" className={({ isActive }) => (isActive ? 'active' : undefined)}>
              Access control
            </NavLink>
          </>
        )}
      </aside>
      <main className="dashboard">
        <Outlet />
      </main>
    </div>
  );
}
