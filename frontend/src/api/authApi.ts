import type { AuthCredentials, AuthResponse } from '../types/auth';

// ─── Backend URL ──────────────────────────────────────────────────────────────
// To connect a real backend, set this env variable in your .env file:
//   VITE_API_URL=https://your-backend-url.com
const API_URL = import.meta.env.VITE_API_URL || null;

// ─── Mock users (used only when API_URL is not set) ───────────────────────────
const MOCK_USERS = [
  { id: '1', username: 'admin', password: 'admin123', name: 'Administrador', role: 'admin' as const },
  { id: '2', username: 'user', password: 'user123', name: 'Usuario Demo', role: 'user' as const },
];

function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export async function loginRequest(credentials: AuthCredentials): Promise<AuthResponse> {
  if (API_URL) {
    const res = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials),
    });
    if (!res.ok) throw new Error('Credenciales incorrectas');
    return res.json();
  }

  // Simulated auth
  await delay(500);
  const found = MOCK_USERS.find(
    u => u.username === credentials.username && u.password === credentials.password,
  );
  if (!found) throw new Error('Credenciales incorrectas');
  const { password: _, ...user } = found;
  return { user, token: `mock-token-${user.id}` };
}

export async function verifyTokenRequest(token: string): Promise<AuthResponse['user']> {
  if (API_URL) {
    const res = await fetch(`${API_URL}/auth/verify`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error('Token inválido');
    return res.json();
  }

  // Simulated verify
  await delay(200);
  const id = token.replace('mock-token-', '');
  const found = MOCK_USERS.find(u => u.id === id);
  if (!found) throw new Error('Token inválido');
  const { password: _, ...user } = found;
  return user;
}
