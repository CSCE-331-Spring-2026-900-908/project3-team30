import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ children, roles }) {
  const { user } = useAuth();
  const location = useLocation();

  const params = new URLSearchParams(location.search);
  const oauth = params.get('oauth');

  if (oauth === 'success') {
    return children;
  }

  if (!user) {
    return <Navigate to="/home" replace state={{ from: location }} />;
  }

  if (roles && !roles.includes(user.role)) {
    return (
      <Navigate
        to={user.role === 'manager' ? '/manager' : '/cashier'}
        replace
      />
    );
  }

  return children;
}