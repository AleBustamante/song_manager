import { useEffect } from 'react';
import '../styles/Toast.scss';

interface Props {
  message: string;
  type: 'success' | 'error';
  onDismiss: () => void;
}

export default function Toast({ message, type, onDismiss }: Props) {
  useEffect(() => {
    const t = setTimeout(onDismiss, 3500);
    return () => clearTimeout(t);
  }, [onDismiss]);

  return (
    <div className={`toast toast--${type}`} role="alert" aria-live="polite">
      <span className="toast__icon" aria-hidden="true">{type === 'success' ? '✓' : '✕'}</span>
      {message}
      <button className="toast__close" onClick={onDismiss} aria-label="Cerrar notificación">✕</button>
    </div>
  );
}
