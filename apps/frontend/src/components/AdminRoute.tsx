import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * AdminRoute – protects routes that require role === 'ADMIN'.
 * - Not logged in → redirect to /admin/login
 * - Logged in but not admin → redirect to /admin/login with an error flag
 * - Logged in as admin → render children
 */
export function AdminRoute({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          fontFamily: 'Inter, sans-serif',
          fontSize: '0.9rem',
          color: '#6F6F6F',
        }}
      >
        Loading...
      </div>
    );
  }

  // Not authenticated at all
  if (!isAuthenticated) {
    return <Navigate to="/admin/login" state={{ from: location.pathname }} replace />;
  }

  // Authenticated but not admin
  if (user?.role !== 'ADMIN') {
    return <Navigate to="/admin/login" state={{ notAdmin: true }} replace />;
  }

  return <>{children}</>;
}
