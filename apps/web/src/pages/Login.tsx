import { FormEvent, useState } from 'react';
import { api } from '../lib/api';
import { useSession } from '../lib/session';

export function Login() {
  const set = useSession((s) => s.set);
  const [email, setEmail] = useState('admin@cwros.com');
  const [password, setPassword] = useState('password');
  const [error, setError] = useState('');

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setError('');
    try {
      const { data } = await api.post('/auth/login', { email, password });
      set(data.token, data.user);
    } catch {
      setError('Sign-in failed. Check your credentials.');
    }
  };

  return (
    <main className="login">
      <section>
        <p className="eyebrow">CWROS // SECURE ACCESS</p>
        <h1>
          Command
          <br />
          <i>Center</i>
        </h1>
        <p className="muted">
          Waste disposal route optimization for the CUDA axis — shortest-path calculation, operational visibility,
          and audited execution in one control surface.
        </p>
        <form onSubmit={submit}>
          <label>
            Email
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          </label>
          <label>
            Password
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
          </label>
          {error && <p className="error">{error}</p>}
          <button>Authenticate</button>
        </form>
        <small>Development credentials are prefilled.</small>
      </section>
    </main>
  );
}
