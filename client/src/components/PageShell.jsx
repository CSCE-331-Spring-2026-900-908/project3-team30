import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function PageShell({ title, subtitle, actions, children }) {
  const { user } = useAuth();

  return (
    <div className="app-shell">
      <header className="topbar">
        <div>
          <p className="eyebrow">Project 2 Web Conversion</p>
          <h1>{title}</h1>
          {subtitle ? <p className="subtle">{subtitle}</p> : null}
        </div>
        <div className="topbar-right">
          {user ? <span className="pill">{user.firstName} {user.lastName} · {user.role}</span> : null}
          <Link className="ghost-link" to={user?.role === 'manager' ? '/manager' : '/cashier'}>Dashboard</Link>
        </div>
      </header>
      {actions ? <div className="page-actions">{actions}</div> : null}
      <main>{children}</main>
    </div>
  );
}
