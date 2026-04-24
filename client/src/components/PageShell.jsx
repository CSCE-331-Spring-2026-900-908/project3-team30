import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function PageShell({ title, subtitle, actions, children }) {
  const { user } = useAuth();

  return (
    <div className="app-shell">
      <header className="topbar">
        <div>
          <h1>{title}</h1>
          {subtitle ? <p className="subtle">{subtitle}</p> : null}
        </div>
        
      </header>
      {actions ? <div className="page-actions">{actions}</div> : null}
      <main>{children}</main>
    </div>
  );
}
