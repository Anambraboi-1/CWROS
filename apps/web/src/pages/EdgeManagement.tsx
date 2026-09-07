import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { FormEvent, useState } from 'react';
import { api } from '../lib/api';

type EdgeRow = { id: string; source: string; destination: string; distance_km: number; is_bidirectional: number };

export function EdgeManagement() {
  const qc = useQueryClient();
  const { data } = useQuery({
    queryKey: ['edges', 'admin'],
    queryFn: async () => (await api.get<{ data: EdgeRow[] }>('/edges')).data.data
  });

  const [form, setForm] = useState({ source: '', destination: '', distance_km: '' });
  const [error, setError] = useState('');

  const create = useMutation({
    mutationFn: async () =>
      api.post('/edges', {
        source: form.source.toUpperCase(),
        destination: form.destination.toUpperCase(),
        distance_km: Number(form.distance_km)
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['edges'] });
      setForm({ source: '', destination: '', distance_km: '' });
      setError('');
    },
    onError: (err: any) => setError(err?.response?.data?.error ?? 'Failed to create edge')
  });

  const deactivate = useMutation({
    mutationFn: async (id: string) => api.delete(`/edges/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['edges'] })
  });

  const submit = (event: FormEvent) => {
    event.preventDefault();
    create.mutate();
  };

  return (
    <>
      <div className="title">
        <div>
          <p className="eyebrow">GRAPH MANAGEMENT</p>
          <h1>
            Edge <i>registry</i>
          </h1>
        </div>
      </div>
      <section className="grid">
        <article className="panel execute">
          <p className="panel-label">ADD EDGE</p>
          <form onSubmit={submit}>
            <input required placeholder="Source code" maxLength={5} value={form.source} onChange={(e) => setForm({ ...form, source: e.target.value })} />
            <input required placeholder="Destination code" maxLength={5} value={form.destination} onChange={(e) => setForm({ ...form, destination: e.target.value })} />
            <input required type="number" step="0.01" min="0" placeholder="Distance (km)" value={form.distance_km} onChange={(e) => setForm({ ...form, distance_km: e.target.value })} />
            {error && <p className="error">{error}</p>}
            <button disabled={create.isPending}>{create.isPending ? 'SAVING…' : 'ADD EDGE →'}</button>
          </form>
          <small>Edges are undirected — both directions are usable in shortest-path calculations.</small>
        </article>
        <article className="panel">
          <div className="table">
            <div className="thead" style={{ gridTemplateColumns: '.5fr .5fr .6fr .5fr' }}>
              <span>FROM</span>
              <span>TO</span>
              <span>DISTANCE</span>
              <span></span>
            </div>
            {data?.map((edge) => (
              <div className="row" key={edge.id} style={{ gridTemplateColumns: '.5fr .5fr .6fr .5fr' }}>
                <span>
                  <b>{edge.source}</b>
                </span>
                <span>
                  <b>{edge.destination}</b>
                </span>
                <span>{edge.distance_km} km</span>
                <span>
                  <button className="text" onClick={() => deactivate.mutate(edge.id)}>
                    Deactivate
                  </button>
                </span>
              </div>
            ))}
          </div>
        </article>
      </section>
    </>
  );
}
