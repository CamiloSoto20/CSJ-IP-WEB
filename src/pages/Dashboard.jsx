import { Container, Button } from 'react-bootstrap';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  return (
    <Container className="mt-5">
      <h1 style={{ color: 'var(--color-principal)', fontWeight: 'bold' }}>Panel Interno</h1>
      <p className="text-muted">Bienvenido al sistema de gestión de la Clínica Socio Jurídica.</p>
      <hr />
      <Button variant="danger" onClick={handleLogout}>Cerrar sesión</Button>
    </Container>
  );
};

export default Dashboard;