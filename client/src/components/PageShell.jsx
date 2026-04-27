import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function PageShell({ title, subtitle, actions, children }) {
  const { user } = useAuth();

  return (
    <div className="app-shell">
      <header className="topbar" role="banner">
        <div>
          <h1>{title}</h1>
          
        </div>
        {subtitle ? <p className="subtle">{subtitle}</p> : null}
      </header>
      {actions ? <nav className="page-actions" aria-label="Page actions">{actions}</nav> : null}
      <main>{children}</main>
    </div>
  );
}
