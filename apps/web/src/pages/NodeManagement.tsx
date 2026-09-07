import { useQueryClient, useQuery, useMutation } from '@tanstack/react-query';
import { FormEvent, useState } from 'react';
import { api } from '../lib/api';

type NodeRow = {
  code: string;
  name: string;
  description: string | null;
  latitude: number | null;
  longitude: number | null;
  node_type: string;
};

export function NodeManagement() {
  const qc = useQueryClient();
  const { data } = useQuery({
    queryKey: ['nodes', 'admin'],
    queryFn: async () => (await api.get<{ data: NodeRow[] }>('/nodes')).data.data
  });

  const [form, setForm] = useState({ code: '', name: '', latitude: '', longitude: '', node_type: 'COLLECTION_POINT' });
  const [error, setError] = useState('');

  const create = useMutation({
    mutationFn: async () =>
      api.post('/nodes', {
        code: form.code,
        name: form.name,
        latitude: form.latitude ? Number(form.latitude) : undefined,
        longitude: form.longitude ? Number(form.longitude) : undefined,
        node_type: form.node_type
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['nodes'] });
      setForm({ code: '', name: '', latitude: '', longitude: '', node_type: 'COLLECTION_POINT' });
      setError('');
    },
    onError: (err: any) => setError(err?.response?.data?.error ?? 'Failed to create node')
  });

  const deactivate = useMutation({
    mutationFn: async (code: string) => api.delete(`/nodes/${code}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['nodes'] })
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
            Node <i>registry</i>
          </h1>
        </div>
      </div>
      <section className="grid">
        <article className="panel execute">
          <p className="panel-label">ADD NODE</p>
          <form onSubmit={submit}>
            <input required placeholder="Code (e.g. S)" maxLength={5} value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })} />
            <input required placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            <input placeholder="Latitude" value={form.latitude} onChange={(e) => setForm({ ...form, latitude: e.target.value })} />
            <input placeholder="Longitude" value={form.longitude} onChange={(e) => setForm({ ...form, longitude: e.target.value })} />
            <select value={form.node_type} onChange={(e) => setForm({ ...form, node_type: e.target.value })}>
              <option value="COLLECTION_POINT">Collection point</option>
              <option value="JUNCTION">Junction</option>
              <option value="DESTINATION">Destination</option>
            </select>
            {error && <p className="error">{error}</p>}
            <button disabled={create.isPending}>{create.isPending ? 'SAVING…' : 'ADD NODE →'}</button>
          </form>
        </article>
        <article className="panel">
          <div className="table">
            <div className="thead" style={{ gridTemplateColumns: '.4fr 1fr .6fr .5fr' }}>
              <span>CODE</span>
              <span>NAME</span>
              <span>TYPE</span>
              <span></span>
            </div>
            {data?.map((node) => (
              <div className="row" key={node.code} style={{ gridTemplateColumns: '.4fr 1fr .6fr .5fr' }}>
                <span>
                  <b>{node.code}</b>
                </span>
                <span>{node.name}</span>
                <span>{node.node_type}</span>
                <span>
                  <button className="text" onClick={() => deactivate.mutate(node.code)}>
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
