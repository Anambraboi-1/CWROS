import { FormEvent, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/api';

type NodeRow = { code: string; name: string };
type ShortestRouteResponse =
  | {
      success: true;
      operation_id: string;
      path: string[];
      route_names: string[];
      distance_km: number;
      estimated_time_minutes: number;
      estimated_cost: number;
      currency: string;
    }
  | { success: false; error: string };

export function RouteOptimization() {
  const { data: nodes } = useQuery({
    queryKey: ['nodes'],
    queryFn: async () => (await api.get<{ data: NodeRow[] }>('/nodes')).data.data
  });
  const [source, setSource] = useState('A');
  const [destination, setDestination] = useState('R');
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<ShortestRouteResponse | null>(null);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setBusy(true);
    setResult(null);
    try {
      const { data } = await api.post<ShortestRouteResponse>('/routes/shortest-path', { source, destination });
      setResult(data);
    } catch (error: any) {
      setResult(error?.response?.data ?? { success: false, error: 'Request failed' });
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <div className="title">
        <div>
          <p className="eyebrow">ROUTE OPTIMIZATION</p>
          <h1>
            Shortest <i>path</i>
          </h1>
        </div>
      </div>
      <section className="grid">
        <article className="panel execute">
          <p className="panel-label">CALCULATE ROUTE</p>
          <h2>Source and destination</h2>
          <form onSubmit={submit}>
            <label>
              Source
              <select value={source} onChange={(e) => setSource(e.target.value)}>
                {nodes?.map((n) => (
                  <option key={n.code} value={n.code}>
                    {n.code} — {n.name}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Destination
              <select value={destination} onChange={(e) => setDestination(e.target.value)}>
                {nodes?.map((n) => (
                  <option key={n.code} value={n.code}>
                    {n.code} — {n.name}
                  </option>
                ))}
              </select>
            </label>
            <button disabled={busy}>{busy ? 'CALCULATING…' : 'CALCULATE SHORTEST ROUTE →'}</button>
          </form>
          <small>Estimated time and cost are configurable assumptions, not live traffic data.</small>
        </article>
        <article className="panel">
          <p className="panel-label">RESULT</p>
          {!result && <p className="empty">Run a calculation to see the shortest route.</p>}
          {result && !result.success && <p className="error">{result.error}</p>}
          {result && result.success && (
            <div className="route-result">
              <div className="metrics" style={{ gridTemplateColumns: 'repeat(3,1fr)', marginBottom: 20 }}>
                <div className="metric">
                  <p>DISTANCE</p>
                  <strong>
                    {result.distance_km}
                    <em> km</em>
                  </strong>
                </div>
                <div className="metric">
                  <p>EST. TIME</p>
                  <strong>
                    {result.estimated_time_minutes}
                    <em> min</em>
                  </strong>
                </div>
                <div className="metric">
                  <p>EST. COST</p>
                  <strong>
                    {result.estimated_cost}
                    <em> {result.currency}</em>
                  </strong>
                </div>
              </div>
              <p className="panel-label">ROUTE</p>
              <div className="route-path">
                {result.route_names.map((name, i) => (
                  <span key={i} className="route-step">
                    <b>{result.path[i]}</b> {name}
                  </span>
                ))}
              </div>
            </div>
          )}
        </article>
      </section>
    </>
  );
}
