import { createContext, useContext, useMemo, useState } from 'react';
import { api } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('authUser');
    return saved ? JSON.parse(saved) : null;
  });

  const [loading, setLoading] = useState(false);

  const persistUser = (nextUser) => {
    setUser(nextUser);

    if (nextUser) {
      localStorage.setItem('authUser', JSON.stringify(nextUser));
    } else {
      localStorage.removeItem('authUser');
    }
  };

  const value = useMemo(() => ({
    user,
    loading,

    async login(pin) {
      setLoading(true);
      try {
        const result = await api.login(pin);
        persistUser(result);
        return result;
      } finally {
        setLoading(false);
      }
    },

    startManagerLogin() {
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
      window.location.href = `${API_BASE_URL}/oauth2/authorization/google`;
    },

    setManagerUser() {
      persistUser({ role: 'manager' });
    },

    logout() {
      persistUser(null);
      window.location.href = window.location.origin;
    },
  }), [user, loading]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}