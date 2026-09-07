import { Link } from 'react-router-dom';

export function NotFound() {
  return (
    <div className="not-found">
      <p className="eyebrow">404</p>
      <h1>
        Route not <i>found</i>
      </h1>
      <p className="muted">This screen doesn't exist in the CWROS command center.</p>
      <Link to="/">
        <button>← Back to dashboard</button>
      </Link>
    </div>
  );
}
