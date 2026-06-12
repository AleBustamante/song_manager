import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import '../styles/ErrorPages.scss';

export default function UnauthorizedPage() {
  return (
    <>
      <Helmet>
        <title>Acceso denegado — SongManager</title>
      </Helmet>
      <div className="error-page">
        <span className="error-page__code" aria-hidden="true">403</span>
        <h1>Acceso denegado</h1>
        <p>No tienes permisos para ver esta página.</p>
        <Link to="/canciones" className="btn btn--primary">Ir a canciones</Link>
      </div>
    </>
  );
}
