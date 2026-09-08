import { Outlet, Link, useNavigate } from 'react-router-dom';
import { Container, Row, Col, Nav, Button } from 'react-bootstrap';
import { supabase } from '../lib/supabase';

const DashboardLayout = () => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  return (
    <Container fluid className="vh-100 d-flex flex-column p-0">
      <Row className="flex-grow-1 m-0">
        {/* Sidebar Lateral */}
        <Col md={3} lg={2} className="p-3 d-flex flex-column" style={{ backgroundColor: 'var(--color-texto)' }}>
          <h5 className="mb-4 text-center mt-2" style={{ color: 'var(--color-secundario)', fontWeight: 'bold' }}>
            Clínica Interna
          </h5>
          
          <Nav className="flex-column mb-auto gap-2">
            <Nav.Link as={Link} to="/dashboard" className="text-white px-3 py-2 rounded" style={{ backgroundColor: 'rgba(255,255,255,0.1)' }}>
              🏠 Inicio
            </Nav.Link>
            <Nav.Link as={Link} to="/dashboard/fichas" className="text-white px-3 py-2 rounded hover-effect">
              📂 Fichas
            </Nav.Link>
            <Nav.Link as={Link} to="/dashboard/citas" className="text-white px-3 py-2 rounded hover-effect">
              📅 Citas
            </Nav.Link>
          </Nav>
          
          <hr className="text-secondary" />
          <Button variant="outline-light" onClick={handleLogout} className="w-100 mt-auto mb-2">
            Cerrar sesión
          </Button>
        </Col>

        <Col md={9} lg={10} className="p-4 overflow-auto" style={{ backgroundColor: '#f8f9fa' }}>
          <Outlet />
        </Col>
      </Row>
    </Container>
  );
};

export default DashboardLayout;