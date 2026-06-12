import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useAuth } from '../context/AuthContext';
import '../styles/Landing.scss';

export default function LandingPage() {
  const { user } = useAuth();

  return (
    <>
      <Helmet>
        <title>SongManager — Gestión de Canciones</title>
        <meta name="description" content="Organiza y gestiona tu colección de canciones y playlists favoritas con SongManager." />
        <meta property="og:title" content="SongManager — Gestión de Canciones" />
        <meta property="og:description" content="Tu gestor de canciones y playlists personal." />
        <meta property="og:type" content="website" />
      </Helmet>

      <section className="landing">
        <div className="landing__hero">
          <div className="landing__hero-text">
            <span className="landing__eyebrow">Gestión de canciones</span>
            <h1 className="landing__title">
              Tu música,<br />
              <span className="landing__accent">organizada.</span>
            </h1>
            <p className="landing__subtitle">
              Crea playlists, guarda tus favoritas y mantén tu colección siempre ordenada.
            </p>
            <div className="landing__actions">
              {user ? (
                <Link to="/canciones" className="btn btn--primary btn--lg">Ver canciones</Link>
              ) : (
                <Link to="/login" className="btn btn--primary btn--lg">Comenzar</Link>
              )}
            </div>
          </div>
          <div className="landing__hero-visual" aria-hidden="true">
            <div className="vinyl">
              <div className="vinyl__groove" />
              <div className="vinyl__center">♪</div>
            </div>
          </div>
        </div>

        <section className="landing__features" aria-label="Características">
          <article className="feature-card">
            <span className="feature-card__icon" aria-hidden="true">🎵</span>
            <h2 className="feature-card__title">Catálogo completo</h2>
            <p>Guarda título, artista, álbum, año, duración y género de cada canción.</p>
          </article>
          <article className="feature-card">
            <span className="feature-card__icon" aria-hidden="true">❤️</span>
            <h2 className="feature-card__title">Favoritas</h2>
            <p>Marca las canciones que más te gustan y accede a ellas rápidamente.</p>
          </article>
          <article className="feature-card">
            <span className="feature-card__icon" aria-hidden="true">📋</span>
            <h2 className="feature-card__title">Playlists</h2>
            <p>Crea y edita listas de reproducción con las canciones que quieras.</p>
          </article>
        </section>
      </section>
    </>
  );
}
