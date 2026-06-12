import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../styles/Navbar.scss';

export default function Navbar() {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate('/login');
  }

  return (
    <header className="navbar" role="banner">
      <div className="navbar__inner">
        <Link to="/" className="navbar__brand" aria-label="SongManager – inicio">
          <span className="navbar__brand-icon" aria-hidden="true">♪</span>
          <span className="navbar__brand-name">SongManager</span>
        </Link>

        {user && (
          <nav className="navbar__nav" aria-label="Navegación principal">
            <NavLink to="/canciones" className={({ isActive }) => isActive ? 'navbar__link navbar__link--active' : 'navbar__link'}>
              Canciones
            </NavLink>
            <NavLink to="/playlists" className={({ isActive }) => isActive ? 'navbar__link navbar__link--active' : 'navbar__link'}>
              Playlists
            </NavLink>
            {isAdmin && (
              <NavLink to="/admin" className={({ isActive }) => isActive ? 'navbar__link navbar__link--active' : 'navbar__link'}>
                Admin
              </NavLink>
            )}
          </nav>
        )}

        <div className="navbar__user">
          {user ? (
            <>
              <span className="navbar__user-name" aria-label={`Sesión iniciada como ${user.name}`}>
                <span className={`navbar__role-badge navbar__role-badge--${user.role}`} aria-hidden="true">
                  {user.role === 'admin' ? 'Admin' : 'Usuario'}
                </span>
                {user.name}
              </span>
              <button onClick={handleLogout} className="btn btn--ghost btn--sm">
                Cerrar sesión
              </button>
            </>
          ) : (
            <Link to="/login" className="btn btn--primary btn--sm">Iniciar sesión</Link>
          )}
        </div>
      </div>
    </header>
  );
}
