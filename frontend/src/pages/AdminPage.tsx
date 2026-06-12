import { Helmet } from 'react-helmet-async';
import { useAuth } from '../context/AuthContext';
import '../styles/Admin.scss';

const DEMO_USERS = [
  { id: '1', name: 'Administrador', username: 'admin', role: 'Administrador' },
  { id: '2', name: 'Usuario Demo', username: 'user', role: 'Usuario' },
];

export default function AdminPage() {
  const { user } = useAuth();

  return (
    <>
      <Helmet>
        <title>Panel Admin — SongManager</title>
        <meta name="description" content="Panel de administración de SongManager." />
      </Helmet>

      <div className="page-container">
        <div className="page-header">
          <h1>Panel de administración</h1>
        </div>

        <div className="admin-welcome">
          <p>Bienvenido, <strong>{user?.name}</strong>. Tienes acceso completo al sistema.</p>
        </div>

        <section className="admin-section">
          <h2>Usuarios del sistema</h2>
          <p className="admin-section__note">
            La gestión completa de usuarios requiere un backend con JWT (Opción B del proyecto).
          </p>
          <div className="table-wrapper">
            <table className="songs-table">
              <thead>
                <tr>
                  <th scope="col">Nombre</th>
                  <th scope="col">Usuario</th>
                  <th scope="col">Rol</th>
                  <th scope="col">Estado</th>
                </tr>
              </thead>
              <tbody>
                {DEMO_USERS.map(u => (
                  <tr key={u.id}>
                    <td>{u.name}</td>
                    <td><code>{u.username}</code></td>
                    <td>
                      <span className={`role-badge role-badge--${u.role === 'Administrador' ? 'admin' : 'user'}`}>
                        {u.role}
                      </span>
                    </td>
                    <td><span className="status-badge status-badge--active">Activo</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="admin-section">
          <h2>Permisos por rol</h2>
          <div className="permissions-grid">
            <div className="permissions-card permissions-card--admin">
              <h3>Administrador</h3>
              <ul>
                <li>✓ Ver canciones y playlists</li>
                <li>✓ Crear registros</li>
                <li>✓ Editar registros</li>
                <li>✓ Eliminar registros</li>
                <li>✓ Acceso al panel admin</li>
              </ul>
            </div>
            <div className="permissions-card permissions-card--user">
              <h3>Usuario</h3>
              <ul>
                <li>✓ Ver canciones y playlists</li>
                <li>✓ Marcar favoritas</li>
                <li>✗ Crear registros</li>
                <li>✗ Editar registros</li>
                <li>✗ Eliminar registros</li>
              </ul>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
