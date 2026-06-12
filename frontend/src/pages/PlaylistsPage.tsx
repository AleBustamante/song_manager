import { useState, useEffect, useCallback } from 'react';
import { Helmet } from 'react-helmet-async';
import { useAuth } from '../context/AuthContext';
import { getPlaylists, createPlaylist, updatePlaylist, deletePlaylist } from '../api/songsApi';
import { getSongs } from '../api/songsApi';
import type { Playlist, Song } from '../types/auth';
import PlaylistModal from '../components/PlaylistModal';
import Toast from '../components/Toast';
import '../styles/Playlists.scss';

export default function PlaylistsPage() {
  const { token, isAdmin } = useAuth();
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [songs, setSongs] = useState<Song[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Playlist | undefined>();
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const load = useCallback(async () => {
    try {
      const [pl, sg] = await Promise.all([getPlaylists(token ?? undefined), getSongs(token ?? undefined)]);
      setPlaylists(pl);
      setSongs(sg);
    } catch { showToast('Error al cargar datos', 'error'); }
    finally { setLoading(false); }
  }, [token]);

  useEffect(() => { load(); }, [load]);

  function showToast(message: string, type: 'success' | 'error') { setToast({ message, type }); }

  async function handleSave(data: Omit<Playlist, 'id' | 'createdAt'>) {
    if (editing) {
      const updated = await updatePlaylist(editing.id, data, token ?? undefined);
      setPlaylists(prev => prev.map(p => p.id === updated.id ? updated : p));
      showToast('Playlist actualizada', 'success');
    } else {
      const created = await createPlaylist(data, token ?? undefined);
      setPlaylists(prev => [...prev, created]);
      showToast('Playlist creada', 'success');
    }
  }

  async function handleDelete(pl: Playlist) {
    if (!confirm(`¿Eliminar "${pl.name}"?`)) return;
    try {
      await deletePlaylist(pl.id, token ?? undefined);
      setPlaylists(prev => prev.filter(p => p.id !== pl.id));
      showToast('Playlist eliminada', 'success');
    } catch { showToast('Error al eliminar', 'error'); }
  }

  function getSongsForPlaylist(pl: Playlist) {
    return songs.filter(s => pl.songIds.includes(s.id));
  }

  function openNew() { setEditing(undefined); setModalOpen(true); }
  function openEdit(pl: Playlist) { setEditing(pl); setModalOpen(true); }

  return (
    <>
      <Helmet>
        <title>Playlists — SongManager</title>
        <meta name="description" content="Gestiona tus playlists de canciones favoritas." />
      </Helmet>

      {toast && <Toast message={toast.message} type={toast.type} onDismiss={() => setToast(null)} />}

      <div className="page-container">
        <div className="page-header">
          <h1>Playlists</h1>
          {isAdmin && (
            <button className="btn btn--primary" onClick={openNew}>+ Nueva playlist</button>
          )}
        </div>

        {loading ? (
          <p className="state-message" role="status">Cargando playlists…</p>
        ) : playlists.length === 0 ? (
          <p className="state-message">{isAdmin ? 'No hay playlists. Crea la primera.' : 'No hay playlists disponibles.'}</p>
        ) : (
          <div className="playlists-grid">
            {playlists.map(pl => {
              const plSongs = getSongsForPlaylist(pl);
              const isOpen = expanded === pl.id;
              return (
                <article key={pl.id} className="playlist-card">
                  <div className="playlist-card__header">
                    <div className="playlist-card__info">
                      <h2 className="playlist-card__name">{pl.name}</h2>
                      {pl.description && <p className="playlist-card__desc">{pl.description}</p>}
                      <span className="playlist-card__meta">{plSongs.length} canciones · {pl.createdAt}</span>
                    </div>
                    <div className="playlist-card__actions">
                      <button
                        className="btn btn--ghost btn--sm"
                        onClick={() => setExpanded(isOpen ? null : pl.id)}
                        aria-expanded={isOpen}
                        aria-controls={`pl-songs-${pl.id}`}
                      >
                        {isOpen ? 'Ocultar' : 'Ver canciones'}
                      </button>
                      {isAdmin && (
                        <>
                          <button className="btn btn--ghost btn--sm" onClick={() => openEdit(pl)}>Editar</button>
                          <button className="btn btn--danger btn--sm" onClick={() => handleDelete(pl)}>Eliminar</button>
                        </>
                      )}
                    </div>
                  </div>

                  {isOpen && (
                    <ol className="playlist-card__songs" id={`pl-songs-${pl.id}`} aria-label={`Canciones de ${pl.name}`}>
                      {plSongs.length === 0 ? (
                        <li className="playlist-card__empty">Sin canciones</li>
                      ) : plSongs.map((song, idx) => (
                        <li key={song.id} className="playlist-card__song-item">
                          <span className="playlist-card__song-num">{idx + 1}</span>
                          <span className="playlist-card__song-title">{song.title}</span>
                          <span className="playlist-card__song-artist">{song.artist}</span>
                          <span className="playlist-card__song-duration">{song.duration}</span>
                        </li>
                      ))}
                    </ol>
                  )}
                </article>
              );
            })}
          </div>
        )}
      </div>

      {modalOpen && (
        <PlaylistModal initial={editing} songs={songs} onSave={handleSave} onClose={() => setModalOpen(false)} />
      )}
    </>
  );
}
