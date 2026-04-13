// import { Navigate, useLocation } from 'react-router-dom';
// import { useAuth } from '../context/AuthContext';

// export default function ProtectedRoute({ children, role }) { //changed from role to role to allow for multiple role access
//   const { user } = useAuth();
//   const location = useLocation();

//   const params = new URLSearchParams(location.search);
//   const oauth = params.get('oauth');

//   if (oauth === 'success') {
//     //console.log('allow auth');
//     return children;
//   }

//   if (!user) {
//     return children; 
//     // return <Navigate to="/home" replace state={{ from: location }} />; //was originally /login but changed to /home for portal page to handle redirection
//   }

//   // if (role && !role.includes(user.role)) {
//   //   console.log('wrong role → redirecting to /home');
//   //   return <Navigate to={user.role === 'manager' ? '/manager' : '/cashier'} replace />;
//   // }

//   return children;
// }
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ children, roles }) { //changed from role to roles to allow for multiple role access
  const { user, setManagerUser  } = useAuth();
  const location = useLocation();

  const params = new URLSearchParams(location.search);
  const oauth = params.get('oauth');

  if (oauth === 'success') {
    //console.log('allow auth');
    setManagerUser();
    return children;
  }

  if (!user) {
    return <Navigate to="/home" replace state={{ from: location }} />; //was originally /login but changed to /home for portal page to handle redirection
  }

  if (roles && !roles.includes(user.role)) {
    console.log('wrong role → redirecting to /home');
    return <Navigate to={user.role === 'manager' ? '/manager' : '/cashier'} replace />;
  }

  return children;
}
