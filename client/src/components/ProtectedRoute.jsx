import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ children, roles }) { //changed from role to roles to allow for multiple role access
  const { user } = useAuth();
  const location = useLocation();

  if (!user) {
    return <Navigate to="/home" replace state={{ from: location }} />; //was originally /login but changed to /home for portal page to handle redirection
  }

  if (roles && !roles.includes(user.role)) {
    return <Navigate to={user.role === 'manager' ? '/manager' : '/cashier'} replace />;
  }

  return children;
}
