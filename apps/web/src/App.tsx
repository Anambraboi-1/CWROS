import { Navigate, Route, Routes } from 'react-router-dom';
import { Layout } from './components/Layout';
import { RequireAdmin } from './components/Guards';
import { Dashboard } from './pages/Dashboard';
import { RouteOptimization } from './pages/RouteOptimization';
import { MapView } from './pages/MapView';
import { OperationHistory } from './pages/OperationHistory';
import { NodeManagement } from './pages/NodeManagement';
import { EdgeManagement } from './pages/EdgeManagement';
import { SystemSettings } from './pages/SystemSettings';
import { UserManagement } from './pages/UserManagement';
import { NotFound } from './pages/NotFound';

export function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Dashboard />} />
        <Route path="routes" element={<RouteOptimization />} />
        <Route path="map" element={<MapView />} />
        <Route path="history" element={<OperationHistory />} />
        <Route element={<RequireAdmin />}>
          <Route path="nodes" element={<NodeManagement />} />
          <Route path="edges" element={<EdgeManagement />} />
          <Route path="settings" element={<SystemSettings />} />
          <Route path="users" element={<UserManagement />} />
        </Route>
      </Route>
      <Route path="/404" element={<NotFound />} />
      <Route path="*" element={<Navigate to="/404" replace />} />
    </Routes>
  );
}
