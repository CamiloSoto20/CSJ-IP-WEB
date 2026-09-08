import { Container, Row, Col, Card, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';

const Services = () => {
  return (
    <section id="servicios" className="py-5" style={{ backgroundColor: 'var(--color-fondo)' }}>
      <Container>
        <div className="text-center mb-5">
          <h2 style={{ color: 'var(--color-principal)', fontWeight: 'bold' }}>Nuestros Servicios</h2>
          <p className="text-muted">Atención integral y gratuita para la comunidad</p>
        </div>

        <Row className="g-4 justify-content-center">
          {/* Tarjeta Servicio Social */}
          <Col md={6} lg={5}>
            <Card className="h-100 shadow-sm border-0">
              <Card.Body className="p-4 d-flex flex-column text-center">
                <div className="mb-3">
                  <span style={{ fontSize: '3rem' }}>🤝</span>
                </div>
                <Card.Title style={{ color: 'var(--color-principal)', fontWeight: 'bold' }}>
                  Servicio Social
                </Card.Title>
                <Card.Text className="text-muted flex-grow-1">
                  Orientación y apoyo en materias sociales, evaluación de casos y derivación a redes de apoyo cuando corresponda.
                </Card.Text>
                <Button 
                  variant="outline-secondary" 
                  as={Link} 
                  to="/servicios/social" 
                  className="mt-3 align-self-center"
                >
                  Más información
                </Button>
              </Card.Body>
            </Card>
          </Col>

          {/* Tarjeta Servicio Jurídico */}
          <Col md={6} lg={5}>
            <Card className="h-100 shadow-sm border-0">
              <Card.Body className="p-4 d-flex flex-column text-center">
                <div className="mb-3">
                  <span style={{ fontSize: '3rem' }}>⚖️</span>
                </div>
                <Card.Title style={{ color: 'var(--color-principal)', fontWeight: 'bold' }}>
                  Servicio Jurídico
                </Card.Title>
                <Card.Text className="text-muted flex-grow-1">
                  Orientación y atención en materias jurídicas, asesoría legal básica y acompañamiento inicial.
                </Card.Text>
                <Button 
                  variant="outline-secondary" 
                  as={Link} 
                  to="/servicios/juridico" 
                  className="mt-3 align-self-center"
                >
                  Más información
                </Button>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </section>
  );
};

export default Services;