import { Container, Row, Col, Card, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const navigate = useNavigate();

  return (
    <div style={{ backgroundColor: '#f8f9fa', minHeight: '100vh', padding: '2rem' }}>
      <Container fluid>
        <div className="d-flex justify-content-between align-items-center mb-5 border-bottom pb-3">
          <div>
            <h2 className="fw-bold mb-1" style={{ color: 'var(--color-principal)' }}>Panel de Coordinación</h2>
            <p className="text-muted mb-0">Visión general y gestión de atenciones</p>
          </div>
          <Button 
            variant="outline-secondary" 
            onClick={() => navigate('/login')}
          >
            Cerrar Sesión
          </Button>
        </div>

        <Row className="g-4 mb-5">
          <Col md={3}>
            <Card className="border-0 shadow-sm h-100 rounded-3">
              <Card.Body className="d-flex flex-column justify-content-center align-items-center p-4">
                <h6 className="text-muted text-uppercase fw-bold mb-2">Fichas Activas</h6>
                <h2 className="fw-bold mb-0" style={{ color: 'var(--color-principal)' }}>24</h2>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3}>
            <Card className="border-0 shadow-sm h-100 rounded-3">
              <Card.Body className="d-flex flex-column justify-content-center align-items-center p-4">
                <h6 className="text-muted text-uppercase fw-bold mb-2">Citas Hoy</h6>
                <h2 className="fw-bold mb-0" style={{ color: 'var(--color-principal)' }}>8</h2>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3}>
            <Card className="border-0 shadow-sm h-100 rounded-3">
              <Card.Body className="d-flex flex-column justify-content-center align-items-center p-4">
                <h6 className="text-muted text-uppercase fw-bold mb-2">Charlas Activas</h6>
                <h2 className="fw-bold mb-0" style={{ color: 'var(--color-principal)' }}>3</h2>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3}>
            <Card className="border-0 shadow-sm h-100 rounded-3">
              <Card.Body className="d-flex flex-column justify-content-center align-items-center p-4">
                <h6 className="text-muted text-uppercase fw-bold mb-2">Estudiantes</h6>
                <h2 className="fw-bold mb-0" style={{ color: 'var(--color-principal)' }}>12</h2>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        <h5 className="fw-bold mb-4" style={{ color: '#404040' }}>Accesos Rápidos de Gestión</h5>
        <Row className="g-4">
          <Col md={6} lg={4}>
            <Card className="border-0 shadow-sm h-100 rounded-3 hover-card">
              <Card.Body className="p-4">
                <h5 className="fw-bold" style={{ color: 'var(--color-principal)' }}>Ficha Atención Social</h5>
                <p className="text-muted small mb-4">
                  Crear nueva ficha de atención, seguimiento y cierre para área social.
                </p>
                <Button 
                  className="w-100 fw-bold" 
                  style={{ backgroundColor: 'var(--color-principal)', border: 'none' }}
                  onClick={() => navigate('/fichas-sociales/nueva')}
                >
                  Ingresar Nueva Ficha
                </Button>
              </Card.Body>
            </Card>
          </Col>
          <Col md={6} lg={4}>
            <Card className="border-0 shadow-sm h-100 rounded-3 hover-card">
              <Card.Body className="p-4">
                <h5 className="fw-bold" style={{ color: 'var(--color-principal)' }}>Fichas Jurídicas</h5>
                <p className="text-muted small mb-4">
                  Gestión y seguimiento de atenciones del área jurídica.
                </p>
                <Button 
                  className="w-100 fw-bold" 
                  variant="outline-secondary"
                  onClick={() => alert('Módulo Jurídico en desarrollo')}
                >
                  Ver Casos Jurídicos
                </Button>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default Dashboard;