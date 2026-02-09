import { Navigate, Outlet } from 'react-router-dom';
import { isTokenExpired } from '@/utils/tokenUtils';

const ProtectedRoute = () => {
  const token = localStorage.getItem('auth_token');

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  if (isTokenExpired(token)) {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('table_id');
    localStorage.removeItem('session_id');
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
