import { Navigate } from 'react-router-dom';
import type { Role } from '../types/auth';
import { useAuth } from '../context/AuthContext';

interface Props {
  children: React.ReactNode;
  requiredRole?: Role;
}

export default function ProtectedRoute({ children, requiredRole }: Props) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="loading-screen" role="status" aria-live="polite">
        <span>Cargando…</span>
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;

  if (requiredRole && user.role !== requiredRole) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <>{children}</>;
}
