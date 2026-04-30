import { useEffect } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ children, roles }) {
  const { user, setManagerUser } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const params = new URLSearchParams(location.search);
  const oauthSuccess = params.get('oauth') === 'success';
  const effectiveUser = oauthSuccess ? { role: 'manager' } : user;

  useEffect(() => {
    if (oauthSuccess) {
      setManagerUser();
      navigate(location.pathname, { replace: true });
    }
  }, [oauthSuccess, setManagerUser, navigate, location.pathname]);

  if (!effectiveUser) {
    return <Navigate to="/home" replace state={{ from: location }} />;
  }

  if (roles && !roles.includes(effectiveUser.role)) {
    return (
      <Navigate
        to={effectiveUser.role === 'manager' ? '/manager' : '/cashier'}
        replace
      />
    );
  }

  return children;
}
