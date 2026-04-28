import { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ children, roles }) {
  const { user, setManagerUser } = useAuth();
  const location = useLocation();
  const [oauthHandled, setOauthHandled] = useState(false);

  const params = new URLSearchParams(location.search);
  const oauthSuccess = params.get('oauth') === 'success';

  useEffect(() => {
    if (oauthSuccess) {
      setManagerUser();
      setOauthHandled(true);
    }
  }, [oauthSuccess, setManagerUser]);

  if (oauthSuccess && !oauthHandled) {
    return (
      <div className="centered-page">
        <div className="card">
          <p className="subtle">Signing in manager...</p>
        </div>
      </div>
    );
  }

  if (oauthSuccess && oauthHandled) {
    return <Navigate to={location.pathname} replace />;
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
