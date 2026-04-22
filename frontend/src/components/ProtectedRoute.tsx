import { Navigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import type { RootState } from '../store';

interface ProtectedRouteProps {
  children: React.ReactNode;
  adminOnly?: boolean;
}

export const ProtectedRoute = ({ children, adminOnly = false }: ProtectedRouteProps) => {
  const auth = useSelector((state: RootState) => state.auth);
  const location = useLocation();

  if (!auth.current) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (adminOnly && auth.current.user.role !== 'ADMIN') {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};
