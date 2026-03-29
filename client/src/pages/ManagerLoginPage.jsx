import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const { login, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleDigit = (digit) => {
    if (pin.length >= 4) return;
    setPin((prev) => prev + digit);
  };

  const submit = async () => {
    try {
      setError('');
      const user = await login(pin);
      if (user.role !== 'manager') {
        throw new Error('Manager access only');
      }
      navigate(location.state?.from?.pathname || '/manager', { replace: true });
    } catch (err) {
      setError(err.message || 'Login failed');
      setPin('');
    }
  };

  return (
    <div className="centered-page">
      <div className="login-card card">
        {/* <p className="eyebrow">JavaFX → React</p> */}
        <h1>Manager Login</h1>
        <p className="subtle">Use mock PIN 1111 (manager), 2222 (cashier), or 3333 (cashier).</p>
        <div className="pin-display">{pin || '••••'}</div>
        {error ? <p className="error-text">{error}</p> : <p className="subtle">Enter your 4-digit manager PIN.</p>}
        <div className="pin-grid">
          {[1,2,3,4,5,6,7,8,9].map((digit) => (
            <button key={digit} className="pin-button" onClick={() => handleDigit(String(digit))}>{digit}</button>
          ))}
          <button className="pin-button ghost" onClick={() => setPin('')}>Clear</button>
          <button className="pin-button" onClick={() => handleDigit('0')}>0</button>
          <button className="pin-button ghost" onClick={() => setPin((prev) => prev.slice(0, -1))}>⌫</button>
        </div>
        <button className="primary-button" disabled={pin.length !== 4 || loading} onClick={submit}>
          {loading ? 'Signing in…' : 'Sign In'}
        </button>
      </div>
    </div>
  );
}
