import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { api } from '../lib/api';

type Log = {
  operation_id: string;
  task_description: string;
  status: string;
  processing_time_ms: number;
  source_node: string | null;
  destination_node: string | null;
  distance_km: number | null;
  created_at: string;
};

const LIMIT = 15;

export function OperationHistory() {
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState('');

  const { data } = useQuery({
    queryKey: ['logs', page, status],
    queryFn: async () =>
      (
        await api.get<{ data: Log[]; total: number }>('/operations/logs', {
          params: { page, limit: LIMIT, status: status || undefined }
        })
      ).data
  });

  const totalPages = data ? Math.max(1, Math.ceil(data.total / LIMIT)) : 1;

  return (
    <>
      <div className="title">
        <div>
          <p className="eyebrow">AUDIT TRAIL</p>
          <h1>
            Operation <i>history</i>
          </h1>
        </div>
        <select
          value={status}
          onChange={(e) => {
            setStatus(e.target.value);
            setPage(1);
          }}
        >
          <option value="">All statuses</option>
          <option value="SUCCESS">Success</option>
          <option value="FAILED">Failed</option>
          <option value="PENDING">Pending</option>
        </select>
      </div>
      <article className="panel">
        <div className="table">
          <div className="thead" style={{ gridTemplateColumns: '1.4fr .6fr .6fr .5fr .8fr' }}>
            <span>OPERATION</span>
            <span>ROUTE</span>
            <span>DISTANCE</span>
            <span>STATUS</span>
            <span>WHEN</span>
          </div>
          {data?.data?.length ? (
            data.data.map((log) => (
              <div className="row" key={log.operation_id} style={{ gridTemplateColumns: '1.4fr .6fr .6fr .5fr .8fr' }}>
                <span>
                  <b>{log.operation_id}</b>
                  <small>{log.task_description}</small>
                </span>
                <span>
                  {log.source_node ?? '—'} → {log.destination_node ?? '—'}
                </span>
                <span>{log.distance_km != null ? `${log.distance_km} km` : '—'}</span>
                <span className={`badge ${log.status.toLowerCase()}`}>{log.status}</span>
                <span>{new Date(log.created_at).toLocaleString()}</span>
              </div>
            ))
          ) : (
            <p className="empty">No operations recorded yet.</p>
          )}
        </div>
        <div className="pagination">
          <button disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
            ← Prev
          </button>
          <span>
            Page {page} of {totalPages}
          </span>
          <button disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>
            Next →
          </button>
        </div>
      </article>
    </>
  );
}
