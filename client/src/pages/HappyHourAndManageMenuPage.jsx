import { Link } from 'react-router-dom';
import PageShell from '../components/PageShell';

export default function HappyHourAndManageMenuPage() {
  return (
    <PageShell
      title="Manage Menu and Happy Hour"
    >
      <div className="quick-grid two-col">
        <Link className="quick-link card" to="/manager/menu/menu">
          Manage Menu
        </Link>
        <Link className="quick-link card" to="/manager/menu/happyhour">
          Edit Happy Hour
        </Link>
      </div>
    </PageShell>
  );
}