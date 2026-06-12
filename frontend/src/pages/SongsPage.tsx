import { useState, useEffect, useCallback } from 'react';
import { Helmet } from 'react-helmet-async';
import { useAuth } from '../context/AuthContext';
import { getSongs, createSong, updateSong, deleteSong } from '../api/songsApi';
import type { Song } from '../types/auth';
import SongModal from '../components/SongModal';
import Toast from '../components/Toast';
import '../styles/Songs.scss';

export default function SongsPage() {
  const { token, isAdmin } = useAuth();
  const [songs, setSongs] = useState<Song[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterFav, setFilterFav] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Song | undefined>();
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const load = useCallback(async () => {
    try { setSongs(await getSongs(token ?? undefined)); }
    catch { showToast('Error al cargar canciones', 'error'); }
    finally { setLoading(false); }
  }, [token]);

  useEffect(() => { load(); }, [load]);

  function showToast(message: string, type: 'success' | 'error') {
    setToast({ message, type });
  }

  const filtered = songs.filter(s => {
    const q = search.toLowerCase();
    const matchSearch = !q || s.title.toLowerCase().includes(q) || s.artist.toLowerCase().includes(q) || s.album.toLowerCase().includes(q);
    return matchSearch && (!filterFav || s.favorite);
  });

  async function handleSave(data: Omit<Song, 'id'>) {
    if (editing) {
      const updated = await updateSong(editing.id, data, token ?? undefined);
      setSongs(prev => prev.map(s => s.id === updated.id ? updated : s));
      showToast('Canción actualizada', 'success');
    } else {
      const created = await createSong(data, token ?? undefined);
      setSongs(prev => [...prev, created]);
      showToast('Canción añadida', 'success');
    }
  }

  async function handleDelete(song: Song) {
    if (!confirm(`¿Eliminar "${song.title}"?`)) return;
    try {
      await deleteSong(song.id, token ?? undefined);
      setSongs(prev => prev.filter(s => s.id !== song.id));
      showToast('Canción eliminada', 'success');
    } catch { showToast('Error al eliminar', 'error'); }
  }

  async function handleToggleFav(song: Song) {
    const updated = await updateSong(song.id, { favorite: !song.favorite }, token ?? undefined);
    setSongs(prev => prev.map(s => s.id === updated.id ? updated : s));
  }

  function openNew() { setEditing(undefined); setModalOpen(true); }
  function openEdit(s: Song) { setEditing(s); setModalOpen(true); }

  return (
    <>
      <Helmet>
        <title>Canciones — SongManager</title>
        <meta name="description" content="Explora y gestiona tu colección de canciones." />
      </Helmet>

      {toast && <Toast message={toast.message} type={toast.type} onDismiss={() => setToast(null)} />}

      <div className="page-container">
        <div className="page-header">
          <h1>Canciones</h1>
          {isAdmin && (
            <button className="btn btn--primary" onClick={openNew}>+ Nueva canción</button>
          )}
        </div>

        <div className="songs-controls">
          <div className="search-bar">
            <label htmlFor="song-search" className="sr-only">Buscar canciones</label>
            <input
              id="song-search"
              type="search"
              placeholder="Buscar por título, artista o álbum…"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <label className="toggle-label">
            <input type="checkbox" checked={filterFav} onChange={e => setFilterFav(e.target.checked)} />
            Solo favoritas
          </label>
        </div>

        {loading ? (
          <p className="state-message" role="status">Cargando canciones…</p>
        ) : filtered.length === 0 ? (
          <p className="state-message">No se encontraron canciones.</p>
        ) : (
          <div className="table-wrapper" role="region" aria-label="Lista de canciones">
            <table className="songs-table">
              <thead>
                <tr>
                  <th scope="col">Título</th>
                  <th scope="col">Artista</th>
                  <th scope="col">Álbum</th>
                  <th scope="col">Año</th>
                  <th scope="col">Duración</th>
                  <th scope="col">Género</th>
                  <th scope="col"><span className="sr-only">Favorita</span></th>
                  {isAdmin && <th scope="col"><span className="sr-only">Acciones</span></th>}
                </tr>
              </thead>
              <tbody>
                {filtered.map(song => (
                  <tr key={song.id}>
                    <td className="song-title">{song.title}</td>
                    <td>{song.artist}</td>
                    <td>{song.album}</td>
                    <td>{song.year}</td>
                    <td>{song.duration}</td>
                    <td><span className="genre-tag">{song.genre}</span></td>
                    <td>
                      <button
                        className={`fav-btn ${song.favorite ? 'fav-btn--active' : ''}`}
                        onClick={() => handleToggleFav(song)}
                        aria-label={song.favorite ? `Quitar "${song.title}" de favoritas` : `Añadir "${song.title}" a favoritas`}
                        aria-pressed={song.favorite}
                      >
                        {song.favorite ? '♥' : '♡'}
                      </button>
                    </td>
                    {isAdmin && (
                      <td className="actions-cell">
                        <button className="btn btn--ghost btn--sm" onClick={() => openEdit(song)}>Editar</button>
                        <button className="btn btn--danger btn--sm" onClick={() => handleDelete(song)}>Eliminar</button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {modalOpen && (
        <SongModal initial={editing} onSave={handleSave} onClose={() => setModalOpen(false)} />
      )}
    </>
  );
}
