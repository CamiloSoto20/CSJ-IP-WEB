import { useState } from 'react';
import { Container, Row, Col, Card, Button, Modal, ListGroup } from 'react-bootstrap';

const Services = () => {
  const [showModal, setShowModal] = useState(false);
  const [servicioSeleccionado, setServicioSeleccionado] = useState(null);

  const handleOpen = (servicio) => {
    setServicioSeleccionado(servicio);
    setShowModal(true);
  };

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
                <div className="icon-box"><span style={{ fontSize: '2.5rem' }}>🤝</span></div>
                <Card.Title as="h4" className="mb-3" style={{ color: 'var(--color-principal)', fontWeight: 'bold' }}>
                  Área Social
                </Card.Title>
                <Card.Text className="text-secondary flex-grow-1" style={{ fontSize: '1.05rem', lineHeight: '1.6' }}>
                  Orientación y apoyo en materias sociales, evaluación detallada de casos y derivación experta a redes de apoyo cuando corresponda.
                </Card.Text>
                <Button 
                  variant="outline-secondary" 
                  className="btn-custom mt-4 fw-bold"
                  onClick={() => handleOpen('Social')}
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
                <div className="icon-box"><span style={{ fontSize: '2.5rem' }}>⚖️</span></div>
                <Card.Title as="h4" className="mb-3" style={{ color: 'var(--color-principal)', fontWeight: 'bold' }}>
                  Área Jurídica
                </Card.Title>
                <Card.Text className="text-secondary flex-grow-1" style={{ fontSize: '1.05rem', lineHeight: '1.6' }}>
                  Orientación y atención especializada en materias jurídicas, asesoría legal básica y acompañamiento inicial en tus procesos.
                </Card.Text>
                <Button 
                  variant="outline-secondary" 
                  className="btn-custom mt-4 fw-bold"
                  onClick={() => handleOpen('Juridica')}
                >
                  Más información
                </Button>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Modal de Detalles Exhaustivos */}
        <Modal show={showModal} onHide={() => setShowModal(false)} size="lg" centered>
          <Modal.Header closeButton className={servicioSeleccionado === 'Social' ? 'bg-info bg-opacity-10' : 'bg-warning bg-opacity-10'}>
            <Modal.Title className="fw-bold" style={{ color: 'var(--color-principal)' }}>
              {servicioSeleccionado === 'Social' ? '🤝 Detalle del Área Social' : '⚖️ Detalle del Área Jurídica'}
            </Modal.Title>
          </Modal.Header>
          <Modal.Body className="p-4 p-md-5">
            {servicioSeleccionado === 'Social' ? (
              <>
                <p className="lead text-muted mb-4">
                  El Área Social de la Clínica Socio Jurídica tiene como objetivo principal brindar un espacio de acogida, diagnóstico y tratamiento para individuos y familias que enfrentan diversas problemáticas o vulnerabilidades sociales.
                </p>
                <h5 className="fw-bold mb-3 text-dark">¿Qué hacemos exactamente?</h5>
                <ListGroup variant="flush">
                  <ListGroup.Item className="px-0 py-3 border-bottom"><strong className="text-primary">Evaluación Socioeconómica:</strong> Entrevistas profundas para determinar la situación actual del grupo familiar y evaluar opciones de beneficios.</ListGroup.Item>
                  <ListGroup.Item className="px-0 py-3 border-bottom"><strong className="text-primary">Visitas Domiciliarias:</strong> Levantamiento de información en terreno para comprender el contexto habitacional y relacional.</ListGroup.Item>
                  <ListGroup.Item className="px-0 py-3 border-bottom"><strong className="text-primary">Derivación a Redes de Apoyo:</strong> Conexión con municipios, fundaciones y programas del Estado (Registro Social de Hogares, subsidios, etc.).</ListGroup.Item>
                  <ListGroup.Item className="px-0 py-3"><strong className="text-primary">Acompañamiento Psicosocial:</strong> Planes de intervención para brindar contención y herramientas de resolución de conflictos.</ListGroup.Item>
                </ListGroup>
              </>
            ) : (
              <>
                <p className="lead text-muted mb-4">
                  El Área Jurídica proporciona asesoría y orientación legal primaria a personas que no cuentan con los recursos para acceder a defensa privada, garantizando el acceso a la información y protección de sus derechos.
                </p>
                <h5 className="fw-bold mb-3 text-dark">Materias que abordamos:</h5>
                <ListGroup variant="flush">
                  <ListGroup.Item className="px-0 py-3 border-bottom"><strong className="text-success">Derecho de Familia:</strong> Orientación en cuidado personal (tuición), régimen comunicacional (visitas), pensión de alimentos y divorcios.</ListGroup.Item>
                  <ListGroup.Item className="px-0 py-3 border-bottom"><strong className="text-success">Violencia Intrafamiliar (VIF):</strong> Orientación inicial sobre medidas de protección y rutas de denuncia seguras.</ListGroup.Item>
                  <ListGroup.Item className="px-0 py-3 border-bottom"><strong className="text-success">Derecho Civil y Contratos:</strong> Asesoría en problemas de arrendamiento, posesiones efectivas, deudas y embargos.</ListGroup.Item>
                  <ListGroup.Item className="px-0 py-3"><strong className="text-success">Derivación Institucional:</strong> Análisis de factibilidad del caso y derivación a las Corporaciones de Asistencia Judicial (CAJ) para representación legal en tribunales.</ListGroup.Item>
                </ListGroup>
              </>
            )}
          </Modal.Body>
          <Modal.Footer className="border-0 bg-light">
            <Button variant="outline-secondary" className="fw-bold" onClick={() => setShowModal(false)}>Cerrar información</Button>
            <Button style={{ backgroundColor: 'var(--color-principal)', border: 'none' }} className="fw-bold px-4" onClick={() => { setShowModal(false); document.querySelector('.btn-custom').click(); }}>
              Agendar Cita Ahora
            </Button>
          </Modal.Footer>
        </Modal>
      </Container>
    </section>
  );
};

export default Services;