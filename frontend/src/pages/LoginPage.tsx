import { useState, type FormEvent } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useAuth } from '../context/AuthContext';
import '../styles/Login.scss';

export default function LoginPage() {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{ username?: string; password?: string; general?: string }>({});
  const [loading, setLoading] = useState(false);

  if (user) return <Navigate to="/canciones" replace />;

  function validate() {
    const e: typeof errors = {};
    if (!username.trim()) e.username = 'El usuario es obligatorio';
    if (!password) e.password = 'La contraseña es obligatoria';
    else if (password.length < 4) e.password = 'Mínimo 4 caracteres';
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setErrors({});
    if (!validate()) return;
    setLoading(true);
    try {
      await login(username.trim(), password);
      navigate('/canciones');
    } catch (err) {
      setErrors({ general: (err as Error).message });
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <Helmet>
        <title>Iniciar sesión — SongManager</title>
        <meta name="description" content="Accede a tu cuenta de SongManager." />
      </Helmet>

      <div className="login-page">
        <div className="login-card">
          <h1 className="login-card__title">Iniciar sesión</h1>
          <p className="login-card__subtitle">Accede a tu gestor de canciones</p>

          {errors.general && (
            <div className="alert alert--error" role="alert">{errors.general}</div>
          )}

          <form onSubmit={handleSubmit} noValidate>
            <div className="form-group">
              <label htmlFor="username">Usuario</label>
              <input
                id="username"
                type="text"
                autoComplete="username"
                value={username}
                onChange={e => setUsername(e.target.value)}
                aria-invalid={!!errors.username}
                aria-describedby={errors.username ? 'username-err' : undefined}
              />
              {errors.username && <span className="form-error" id="username-err" role="alert">{errors.username}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="password">Contraseña</label>
              <input
                id="password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                aria-invalid={!!errors.password}
                aria-describedby={errors.password ? 'password-err' : undefined}
              />
              {errors.password && <span className="form-error" id="password-err" role="alert">{errors.password}</span>}
            </div>

            <button type="submit" className="btn btn--primary btn--full" disabled={loading}>
              {loading ? 'Ingresando…' : 'Ingresar'}
            </button>
          </form>

          <div className="login-card__hint">
            <p><strong>Demo:</strong></p>
            <p>Admin → <code>admin</code> / <code>admin123</code></p>
            <p>Usuario → <code>user</code> / <code>user123</code></p>
          </div>
        </div>
      </div>
    </>
  );
}
