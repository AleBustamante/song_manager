import { useState, useEffect, type FormEvent } from 'react';
import type { Playlist, Song } from '../types/auth';
import '../styles/Modal.scss';

type PlaylistFormData = Omit<Playlist, 'id' | 'createdAt'>;

interface Props {
  initial?: Playlist;
  songs: Song[];
  onSave: (data: PlaylistFormData) => Promise<void>;
  onClose: () => void;
}

export default function PlaylistModal({ initial, songs, onSave, onClose }: Props) {
  const [name, setName] = useState(initial?.name ?? '');
  const [description, setDescription] = useState(initial?.description ?? '');
  const [songIds, setSongIds] = useState<string[]>(initial?.songIds ?? []);
  const [errors, setErrors] = useState<{ name?: string; description?: string }>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    document.getElementById('pl-modal-title')?.focus();
  }, []);

  function validate() {
    const e: typeof errors = {};
    if (!name.trim()) e.name = 'El nombre es obligatorio';
    else if (name.trim().length < 2) e.name = 'Mínimo 2 caracteres';
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function toggleSong(id: string) {
    setSongIds(prev => prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]);
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    setSaving(true);
    try { await onSave({ name: name.trim(), description: description.trim(), songIds }); onClose(); }
    catch (err) { alert((err as Error).message); }
    finally { setSaving(false); }
  }

  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="pl-modal-title" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal modal--wide">
        <div className="modal__header">
          <h2 id="pl-modal-title" tabIndex={-1}>{initial ? 'Editar playlist' : 'Nueva playlist'}</h2>
          <button className="modal__close" onClick={onClose} aria-label="Cerrar">✕</button>
        </div>
        <form onSubmit={handleSubmit} noValidate>
          <div className="modal__body">
            <div className="form-group">
              <label htmlFor="pl-name">Nombre *</label>
              <input id="pl-name" type="text" value={name} onChange={e => setName(e.target.value)} aria-invalid={!!errors.name} aria-describedby={errors.name ? 'pl-name-err' : undefined} />
              {errors.name && <span className="form-error" id="pl-name-err" role="alert">{errors.name}</span>}
            </div>
            <div className="form-group">
              <label htmlFor="pl-desc">Descripción</label>
              <textarea id="pl-desc" value={description} onChange={e => setDescription(e.target.value)} rows={2} />
            </div>
            <fieldset className="form-group">
              <legend>Canciones ({songIds.length} seleccionadas)</legend>
              <div className="song-checklist">
                {songs.map(song => (
                  <label key={song.id} className="song-checklist__item">
                    <input type="checkbox" checked={songIds.includes(song.id)} onChange={() => toggleSong(song.id)} />
                    <span className="song-checklist__title">{song.title}</span>
                    <span className="song-checklist__artist">{song.artist}</span>
                  </label>
                ))}
              </div>
            </fieldset>
          </div>
          <div className="modal__footer">
            <button type="button" className="btn btn--ghost" onClick={onClose}>Cancelar</button>
            <button type="submit" className="btn btn--primary" disabled={saving}>{saving ? 'Guardando…' : 'Guardar'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}
