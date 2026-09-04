import { FormEvent, useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { QueryClient, QueryClientProvider, useQuery, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { io } from 'socket.io-client';
import { create } from 'zustand';
import { collectionNodes } from './nodes';
import './styles.css';

const api = axios.create({ baseURL: import.meta.env.VITE_API_URL ?? 'http://localhost:4000/api/v1' });
type User = { id: string; email: string; role: 'ADMIN' | 'DISPATCHER' | 'OPERATOR' };
type Metrics = { active_nodes: number; operational_rate: number | string; system_load_ms: number };
type Log = { operation_id: string; task_description: string; status: string; processing_time_ms: number };
type Session = { token: string | null; user: User | null; set: (token: string, user: User) => void; clear: () => void };
const useSession = create<Session>((set) => ({
  token: localStorage.getItem('cwros_token'), user: JSON.parse(localStorage.getItem('cwros_user') || 'null'),
  set: (token, user) => { localStorage.setItem('cwros_token', token); localStorage.setItem('cwros_user', JSON.stringify(user)); set({ token, user }); },
  clear: () => { localStorage.removeItem('cwros_token'); localStorage.removeItem('cwros_user'); set({ token: null, user: null }); }
}));
api.interceptors.request.use((config) => { const token = localStorage.getItem('cwros_token'); if (token) config.headers.Authorization = `Bearer ${token}`; return config; });

function Login() {
  const set = useSession(s => s.set); const [email, setEmail] = useState('admin@cwros.com'); const [password, setPassword] = useState('password'); const [error, setError] = useState('');
  const submit = async (event: FormEvent) => { event.preventDefault(); try { const { data } = await api.post('/auth/login', { email, password }); set(data.token, data.user); } catch { setError('Sign-in failed. Check your credentials.'); } };
  return <main className="login"><section><p className="eyebrow">CWROS // SECURE ACCESS</p><h1>Command<br/><i>Center</i></h1><p className="muted">Operational visibility, live system telemetry, and audited execution in one control surface.</p><form onSubmit={submit}><label>Email<input type="email" value={email} onChange={e => setEmail(e.target.value)} /></label><label>Password<input type="password" value={password} onChange={e => setPassword(e.target.value)} /></label>{error && <p className="error">{error}</p>}<button>Authenticate</button></form><small>Development credentials are prefilled.</small></section></main>;
}
function MetricCard({ label, value, suffix }: { label: string; value: string | number; suffix?: string }) { return <article className="metric"><p>{label}</p><strong>{value}<em>{suffix}</em></strong><span>LIVE</span></article>; }
function NodeMap() {
  const [selected, setSelected] = useState(collectionNodes[0]); const lats = collectionNodes.map(n => n.latitude); const lngs = collectionNodes.map(n => n.longitude);
  const bounds = { minLat: Math.min(...lats), maxLat: Math.max(...lats), minLng: Math.min(...lngs), maxLng: Math.max(...lngs) };
  const point = (lat: number, lng: number) => ({ x: 7 + ((lng - bounds.minLng) / (bounds.maxLng - bounds.minLng)) * 86, y: 90 - ((lat - bounds.minLat) / (bounds.maxLat - bounds.minLat)) * 80 });
  return <article className="panel map-panel"><div className="panel-head"><div><p className="panel-label">NODE GEOGRAPHY</p><h2>Collection point network</h2></div><span className="map-count">{collectionNodes.length} LOCATIONS</span></div><div className="map-wrap"><svg viewBox="0 0 100 100" role="img" aria-label="Geographic layout of CWROS collection nodes">{collectionNodes.map(node => { const p = point(node.latitude, node.longitude); return <g className="map-node" key={node.id} onClick={() => setSelected(node)}><circle cx={p.x} cy={p.y} r={node.kind === 'disposal' ? 3.1 : 1.7} className={node.kind} /><text x={p.x + 2.3} y={p.y - 2}>{node.id}</text></g>; })}</svg><div className="map-key"><span><i/> Collection point</span><span><i className="disposal"/> Disposal site</span></div></div><div className="node-detail"><b>{selected.label}</b><span>{selected.landmark}</span><small>{selected.latitude.toFixed(6)}° N, {selected.longitude.toFixed(6)}° E</small></div></article>;
}
function Dashboard() {
  const { user, clear } = useSession(); const qc = useQueryClient(); const [taskDescription, setTask] = useState(''); const [inputSize, setInput] = useState(''); const [busy, setBusy] = useState(false);
  const { data: metrics } = useQuery({ queryKey: ['metrics'], queryFn: async () => (await api.get<Metrics>('/dashboard/metrics')).data, refetchInterval: 30_000 });
  const { data: logs, refetch } = useQuery<{ data: Log[] }>({ queryKey: ['logs'], queryFn: async () => (await api.get('/operations/logs?limit=8')).data });
  useEffect(() => { const socket = io(import.meta.env.VITE_SOCKET_URL ?? 'http://localhost:4000'); socket.on('metrics:update', (value: Metrics) => qc.setQueryData(['metrics'], value)); return () => { socket.close(); }; }, [qc]);
  const execute = async (event: FormEvent) => { event.preventDefault(); setBusy(true); try { await api.post('/operations/execute', { taskDescription, inputSize: inputSize || undefined }); setTask(''); setInput(''); refetch(); } finally { setBusy(false); } };
  return <div className="shell"><header><div className="brand"><b>◈</b> CWROS <span>COMMAND CENTER</span></div><div className="operator">{user?.role} // {user?.email} <button className="text" onClick={clear}>Sign out</button></div></header><aside><p>OPERATIONS</p><a className="active">Overview</a><a>System logs</a><a>Node registry</a><p>ADMINISTRATION</p><a>Access control</a><a>Configuration</a></aside><main className="dashboard"><div className="title"><div><p className="eyebrow">SYSTEM OVERVIEW</p><h1>Operational <i>status</i></h1></div><div className="online">● ALL SYSTEMS NOMINAL</div></div><section className="metrics"><MetricCard label="MAPPED NODES" value={collectionNodes.length} /><MetricCard label="OPERATIONAL RATE" value={metrics?.operational_rate ?? '—'} suffix="%" /><MetricCard label="SYSTEM LOAD" value={metrics?.system_load_ms ?? '—'} suffix=" ms" /></section><section className="grid"><article className="panel execute"><p className="panel-label">EXECUTE OPERATION</p><h2>Initiate a controlled task</h2><form onSubmit={execute}><input required minLength={3} placeholder="Task description" value={taskDescription} onChange={e => setTask(e.target.value)} /><input placeholder="Input size (optional)" value={inputSize} onChange={e => setInput(e.target.value)} /><button disabled={busy}>{busy ? 'EXECUTING…' : 'RUN OPERATION →'}</button></form><small>Execution is simulated in this MVP and is recorded in the audit log.</small></article><article className="panel"><div className="panel-head"><p className="panel-label">SYSTEM LOG</p><button className="text" onClick={() => refetch()}>Refresh</button></div><div className="table"><div className="thead"><span>OPERATION</span><span>STATUS</span><span>LATENCY</span></div>{logs?.data?.length ? logs.data.map(log => <div className="row" key={log.operation_id}><span><b>{log.operation_id}</b><small>{log.task_description}</small></span><span className={`badge ${log.status.toLowerCase()}`}>{log.status}</span><span>{log.processing_time_ms} ms</span></div>) : <p className="empty">No operations recorded yet.</p>}</div></article></section><NodeMap /></main></div>;
}
function App() { return useSession(s => s.token) ? <Dashboard /> : <Login />; }
createRoot(document.getElementById('root')!).render(<QueryClientProvider client={new QueryClient()}><App /></QueryClientProvider>);
