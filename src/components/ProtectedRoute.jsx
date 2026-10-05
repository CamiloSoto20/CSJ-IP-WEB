import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Spinner } from 'react-bootstrap';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, role, loading } = useAuth();

  // Esperamos a que Supabase confirme la sesión y el rol
  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100 bg-light">
        <div className="text-center">
          <Spinner animation="border" style={{ color: 'var(--color-principal, #006A38)' }} />
          <p className="text-muted mt-3 fw-bold">Verificando accesos...</p>
        </div>
      </div>
    );
  }

  // Si no hay usuario logueado, lo mandamos al login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // RBAC: Si la ruta tiene roles restringidos y el usuario NO tiene ese rol
  if (allowedRoles && role && !allowedRoles.includes(role)) {
    // Lo devolvemos inmediatamente al panel que realmente le corresponde según su rol en BD
    if (role === 'estudiante') return <Navigate to="/panel-estudiante" replace />;
    if (role === 'coordinadora') return <Navigate to="/dashboard" replace />;
    if (role === 'soporte') return <Navigate to="/panel-soporte" replace />;
    
    // Fallback de seguridad extrema
    return <Navigate to="/login" replace />;
  }

  // Si pasa todas las pruebas, renderizamos la vista protegida
  return children;
};

export default ProtectedRoute;