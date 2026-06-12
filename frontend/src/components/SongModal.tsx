import { useState, useEffect, type FormEvent } from 'react';
import type { Song } from '../types/auth';
import '../styles/Modal.scss';

type SongFormData = Omit<Song, 'id'>;

interface Props {
  initial?: Song;
  onSave: (data: SongFormData) => Promise<void>;
  onClose: () => void;
}

const EMPTY: SongFormData = { title: '', artist: '', album: '', year: new Date().getFullYear(), duration: '', genre: '', favorite: false };

export default function SongModal({ initial, onSave, onClose }: Props) {
  const [form, setForm] = useState<SongFormData>(initial ? { ...initial } : EMPTY);
  const [errors, setErrors] = useState<Partial<Record<keyof SongFormData, string>>>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const el = document.getElementById('modal-title');
    el?.focus();
  }, []);

  function validate(): boolean {
    const e: typeof errors = {};
    if (!form.title.trim()) e.title = 'El título es obligatorio';
    else if (form.title.trim().length < 2) e.title = 'Mínimo 2 caracteres';
    if (!form.artist.trim()) e.artist = 'El artista es obligatorio';
    if (!form.album.trim()) e.album = 'El álbum es obligatorio';
    if (!form.year || form.year < 1900 || form.year > new Date().getFullYear()) e.year = 'Año inválido';
    if (!form.duration.match(/^\d{1,2}:\d{2}$/)) e.duration = 'Formato: m:ss o mm:ss';
    if (!form.genre.trim()) e.genre = 'El género es obligatorio';
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    setSaving(true);
    try { await onSave(form); onClose(); }
    catch (err) { alert((err as Error).message); }
    finally { setSaving(false); }
  }

  function field(name: keyof SongFormData, label: string, type = 'text', extra?: object) {
    const id = `field-${name}`;
    return (
      <div className="form-group">
        <label htmlFor={id}>{label}</label>
        <input
          id={id}
          type={type}
          value={String(form[name])}
          onChange={e => setForm(f => ({ ...f, [name]: type === 'number' ? Number(e.target.value) : e.target.value }))}
          aria-invalid={!!errors[name]}
          aria-describedby={errors[name] ? `${id}-err` : undefined}
          {...extra}
        />
        {errors[name] && <span className="form-error" id={`${id}-err`} role="alert">{errors[name]}</span>}
      </div>
    );
  }

  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="modal-title" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal__header">
          <h2 id="modal-title" tabIndex={-1}>{initial ? 'Editar canción' : 'Nueva canción'}</h2>
          <button className="modal__close" onClick={onClose} aria-label="Cerrar">✕</button>
        </div>
        <form onSubmit={handleSubmit} noValidate>
          <div className="modal__body">
            {field('title', 'Título *')}
            {field('artist', 'Artista *')}
            {field('album', 'Álbum *')}
            <div className="form-row">
              {field('year', 'Año *', 'number', { min: 1900, max: new Date().getFullYear() })}
              {field('duration', 'Duración *', 'text', { placeholder: '3:45' })}
            </div>
            {field('genre', 'Género *')}
            <div className="form-group form-group--checkbox">
              <input id="field-favorite" type="checkbox" checked={form.favorite} onChange={e => setForm(f => ({ ...f, favorite: e.target.checked }))} />
              <label htmlFor="field-favorite">Marcar como favorita</label>
            </div>
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
