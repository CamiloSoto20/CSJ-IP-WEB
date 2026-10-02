import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Spinner } from 'react-bootstrap';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, role, loading } = useAuth();

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <Spinner animation="border" style={{ color: 'var(--color-principal, #006A38)' }} />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Si la ruta exige roles específicos y el usuario actual no lo tiene
  if (allowedRoles && !allowedRoles.includes(role)) {
    // Redirigimos de forma inteligente a su área de trabajo real
    if (role === 'estudiante') return <Navigate to="/panel-estudiante" replace />;
    if (role === 'coordinadora') return <Navigate to="/dashboard" replace />;
    if (role === 'soporte') return <Navigate to="/panel-soporte" replace />;
    
    // Fallback de seguridad
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;