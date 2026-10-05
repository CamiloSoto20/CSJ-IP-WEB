import { Container, Row, Col, Card, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';

const Services = () => {
  return (
    <section id="servicios" className="py-5" style={{ backgroundColor: '#f4f7f5' }}>
      <Container className="py-4">
        <div className="text-center mb-5">
          <h2 className="section-title">Nuestros Servicios</h2>
          <p className="text-muted lead">Atención integral y gratuita para la comunidad</p>
        </div>

        <Row className="g-4 justify-content-center">
          {/* Tarjeta Servicio Social */}
          <Col md={6} lg={5}>
            <Card className="h-100 card-modern hover-lift p-3">
              <Card.Body className="d-flex flex-column text-center align-items-center p-4">
                <div className="icon-box">
                  <span style={{ fontSize: '2.5rem' }}>🤝</span>
                </div>
                <Card.Title as="h4" className="mb-3" style={{ color: 'var(--color-principal)', fontWeight: 'bold' }}>
                  Servicio Social
                </Card.Title>
                <Card.Text className="text-secondary flex-grow-1" style={{ fontSize: '1.05rem', lineHeight: '1.6' }}>
                  Orientación y apoyo en materias sociales, evaluación detallada de casos y derivación experta a redes de apoyo cuando corresponda.
                </Card.Text>
                <Button 
                  variant="outline-secondary" 
                  as={Link} 
                  to="/servicios/social" 
                  className="btn-custom mt-4"
                >
                  Más información
                </Button>
              </Card.Body>
            </Card>
          </Col>

          {/* Tarjeta Servicio Jurídico */}
          <Col md={6} lg={5}>
            <Card className="h-100 card-modern hover-lift p-3">
              <Card.Body className="d-flex flex-column text-center align-items-center p-4">
                <div className="icon-box">
                  <span style={{ fontSize: '2.5rem' }}>⚖️</span>
                </div>
                <Card.Title as="h4" className="mb-3" style={{ color: 'var(--color-principal)', fontWeight: 'bold' }}>
                  Servicio Jurídico
                </Card.Title>
                <Card.Text className="text-secondary flex-grow-1" style={{ fontSize: '1.05rem', lineHeight: '1.6' }}>
                  Orientación y atención especializada en materias jurídicas, asesoría legal básica y acompañamiento inicial en tus procesos.
                </Card.Text>
                <Button 
                  variant="outline-secondary" 
                  as={Link} 
                  to="/servicios/juridico" 
                  className="btn-custom mt-4"
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