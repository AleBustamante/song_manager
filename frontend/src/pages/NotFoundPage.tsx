import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import '../styles/ErrorPages.scss';

export default function NotFoundPage() {
  return (
    <>
      <Helmet>
        <title>404 — Página no encontrada — SongManager</title>
      </Helmet>
      <div className="error-page">
        <span className="error-page__code" aria-hidden="true">404</span>
        <h1>Página no encontrada</h1>
        <p>La ruta que buscas no existe.</p>
        <Link to="/" className="btn btn--primary">Volver al inicio</Link>
      </div>
    </>
  );
}
