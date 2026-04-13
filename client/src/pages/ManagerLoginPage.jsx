// import { useState } from 'react';
// import { useLocation, useNavigate } from 'react-router-dom';
// import { useAuth } from '../context/AuthContext';
import { useLocation } from 'react-router-dom';


// OLD PIN CODE REPLACED WITH GOOGLE AUTH LOGIN
// export default function LoginPage() {
//   const [pin, setPin] = useState('');
//   const [error, setError] = useState('');
//   const { login, loading } = useAuth();
//   const navigate = useNavigate();
//   const location = useLocation();

//   const handleDigit = (digit) => {
//     if (pin.length >= 4) return;
//     setPin((prev) => prev + digit);
//   };

//   const submit = async () => {
//     try {
//       setError('');
//       const user = await login(pin);
//       if (user.role !== 'manager') {
//         throw new Error('Manager access only');
//       }
//       navigate(location.state?.from?.pathname || '/manager', { replace: true });
//     } catch (err) {
//       setError(err.message || 'Login failed');
//       setPin('');
//     }
//   };

//  
// }

export default function ManagerLoginPage() {
  const location = useLocation();
  //
  const params = new URLSearchParams(location.search);
  const error = params.get('error');

  const handleGoogleLogin = () => {
    window.location.href = 'http://localhost:8080/oauth2/authorization/google';
  };

  let message = 'Manager login now uses Google authentication instead of a Pin.';

  if (error === 'unauthorized') {
    message = 'That Google account does not have manager permissions.';
  } else if (error === 'oauth_failed') {
    message = 'Google login failed.';
  }

  return (
    <div className="centered-page">
      <div className="login-card card">
        <h1>Manager Login</h1>
        <p className="subtle">{message}</p>

        <button className="primary-button" onClick={handleGoogleLogin}>
          Sign in with Google
        </button>
      </div>
    </div>
  );
}