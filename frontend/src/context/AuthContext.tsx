import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { User } from '../types/auth';
import { loginRequest, verifyTokenRequest } from '../api/authApi';

interface AuthContextValue {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem('token');
    if (!stored) { setIsLoading(false); return; }
    verifyTokenRequest(stored)
      .then(u => { setUser(u); setToken(stored); })
      .catch(() => localStorage.removeItem('token'))
      .finally(() => setIsLoading(false));
  }, []);

  async function login(username: string, password: string) {
    const res = await loginRequest({ username, password });
    setUser(res.user);
    setToken(res.token);
    localStorage.setItem('token', res.token);
  }

  function logout() {
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
  }

  return (
    <AuthContext.Provider value={{ user, token, isLoading, login, logout, isAdmin: user?.role === 'admin' }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
