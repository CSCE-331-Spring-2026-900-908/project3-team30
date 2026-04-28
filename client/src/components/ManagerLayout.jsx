import { NavLink } from 'react-router-dom';
import PageShell from './PageShell';
import { useAuth } from '../context/AuthContext';

const managerNavItems = [
  { label: 'Dashboard', to: '/manager', end: true },
  { label: 'Orders', to: '/manager/orders' },
  { label: 'Manage Menu', to: '/manager/menu' },
  { label: 'Happy Hour', to: '/manager/happy-hour' },
  { label: 'Inventory', to: '/manager/inventory' },
  { label: 'Employees', to: '/manager/employees' },
  { label: 'Reports', to: '/manager/reports' }
];

export default function ManagerLayout({ title, subtitle, actions, children }) {
  const { logout } = useAuth();

  return (
    <PageShell
      title={title}
      titleClassName="manager-page-title"
      actions={
        <div className="inline-actions manager-top-actions">
          {actions}
        </div>
      }
    >
      <div className="manager-shell">
        <aside className="card manager-sidebar" aria-label="Manager navigation">
          <div className="manager-sidebar-header">
            <p className="eyebrow">Manager</p>
            <strong>Admin Tools</strong>
          </div>

          <nav className="manager-nav">
            {managerNavItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) => (isActive ? 'active' : undefined)}
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
        </aside>

        <main className="manager-content">
          {children}
        </main>
      </div>
    </PageShell>
  );
}
