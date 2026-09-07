import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { api } from '../lib/api';
import { MetricCard } from '../components/MetricCard';

type Metrics = {
  active_nodes: number;
  active_edges: number;
  operational_rate: number | string;
  average_processing_time_ms: number;
  total_operations: number;
};

type Log = {
  operation_id: string;
  task_description: string;
  status: string;
  processing_time_ms: number;
};

export function Dashboard() {
  const { data: metrics } = useQuery({
    queryKey: ['metrics'],
    queryFn: async () => (await api.get<Metrics>('/dashboard/metrics')).data,
    refetchInterval: 15_000
  });
  const { data: logs } = useQuery<{ data: Log[] }>({
    queryKey: ['logs', 'preview'],
    queryFn: async () => (await api.get('/operations/logs?limit=6')).data,
    refetchInterval: 15_000
  });

  return (
    <>
      <div className="title">
        <div>
          <p className="eyebrow">SYSTEM OVERVIEW</p>
          <h1>
            Operational <i>status</i>
          </h1>
        </div>
        <div className="online">● ALL SYSTEMS NOMINAL</div>
      </div>
      <section className="metrics">
        <MetricCard label="MAPPED NODES" value={metrics?.active_nodes ?? '—'} />
        <MetricCard label="ACTIVE ROUTES" value={metrics?.active_edges ?? '—'} />
        <MetricCard label="OPERATIONAL RATE" value={metrics?.operational_rate ?? '—'} suffix="%" />
      </section>
      <section className="grid">
        <article className="panel execute">
          <p className="panel-label">ROUTE OPTIMIZATION</p>
          <h2>Calculate a shortest disposal route</h2>
          <p className="muted">
            Select a collection point and destination to run Dijkstra's shortest-path algorithm across the CUDA axis
            graph.
          </p>
          <Link to="/routes" style={{ display: 'block', marginTop: 14 }}>
            <button>OPEN ROUTE OPTIMIZATION →</button>
          </Link>
          <small style={{ display: 'block', marginTop: 10 }}>Total operations recorded: {metrics?.total_operations ?? 0}</small>
        </article>
        <article className="panel">
          <div className="panel-head">
            <p className="panel-label">SYSTEM LOG</p>
            <Link to="/history" className="text">
              View all
            </Link>
          </div>
          <div className="table">
            <div className="thead">
              <span>OPERATION</span>
              <span>STATUS</span>
              <span>LATENCY</span>
            </div>
            {logs?.data?.length ? (
              logs.data.map((log) => (
                <div className="row" key={log.operation_id}>
                  <span>
                    <b>{log.operation_id}</b>
                    <small>{log.task_description}</small>
                  </span>
                  <span className={`badge ${log.status.toLowerCase()}`}>{log.status}</span>
                  <span>{log.processing_time_ms} ms</span>
                </div>
              ))
            ) : (
              <p className="empty">No operations recorded yet.</p>
            )}
          </div>
        </article>
      </section>
    </>
  );
}
