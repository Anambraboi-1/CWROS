import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { FormEvent, useState } from 'react';
import { api } from '../lib/api';

type UserRow = { id: string; username: string; email: string; role: string; is_active: number; created_at: string };

export function UserManagement() {
  const qc = useQueryClient();
  const { data } = useQuery({
    queryKey: ['users'],
    queryFn: async () => (await api.get<{ data: UserRow[] }>('/users')).data.data
  });

  const [form, setForm] = useState({ username: '', email: '', password: '', role: 'OPERATOR' });
  const [error, setError] = useState('');

  const create = useMutation({
    mutationFn: async () => api.post('/users', form),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['users'] });
      setForm({ username: '', email: '', password: '', role: 'OPERATOR' });
      setError('');
    },
    onError: (err: any) => setError(err?.response?.data?.error ?? 'Failed to create user')
  });

  const toggleActive = useMutation({
    mutationFn: async ({ id, activate }: { id: string; activate: boolean }) =>
      api.put(`/users/${id}/${activate ? 'activate' : 'deactivate'}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['users'] })
  });

  const submit = (event: FormEvent) => {
    event.preventDefault();
    create.mutate();
  };

  return (
    <>
      <div className="title">
        <div>
          <p className="eyebrow">ACCESS CONTROL</p>
          <h1>
            User <i>management</i>
          </h1>
        </div>
      </div>
      <section className="grid">
        <article className="panel execute">
          <p className="panel-label">CREATE USER</p>
          <form onSubmit={submit}>
            <input required placeholder="Username" value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} />
            <input required type="email" placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            <input required type="password" minLength={8} placeholder="Password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
            <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
              <option value="OPERATOR">Operator</option>
              <option value="DISPATCHER">Dispatcher</option>
              <option value="ADMIN">Admin</option>
            </select>
            {error && <p className="error">{error}</p>}
            <button disabled={create.isPending}>{create.isPending ? 'CREATING…' : 'CREATE USER →'}</button>
          </form>
        </article>
        <article className="panel">
          <div className="table">
            <div className="thead" style={{ gridTemplateColumns: '1fr .6fr .5fr .5fr' }}>
              <span>USER</span>
              <span>ROLE</span>
              <span>STATUS</span>
              <span></span>
            </div>
            {data?.map((user) => (
              <div className="row" key={user.id} style={{ gridTemplateColumns: '1fr .6fr .5fr .5fr' }}>
                <span>
                  <b>{user.username}</b>
                  <small>{user.email}</small>
                </span>
                <span>{user.role}</span>
                <span className={`badge ${user.is_active ? 'success' : 'failed'}`}>{user.is_active ? 'ACTIVE' : 'INACTIVE'}</span>
                <span>
                  <button className="text" onClick={() => toggleActive.mutate({ id: user.id, activate: !user.is_active })}>
                    {user.is_active ? 'Deactivate' : 'Activate'}
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
