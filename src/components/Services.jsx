import { Container, Row, Col, Card } from 'react-bootstrap';
import { useState } from 'react';
import AppointmentModal from './AppointmentModal';

const Services = () => {
  const [showModal, setShowModal] = useState(false);

  return (
    <>
      {/* SECCIÓN: ¿Cómo podemos ayudarte? */}
      <section id="servicios" className="py-5" style={{ backgroundColor: '#f4f7f5' }}>
        <Container className="py-4">
          <div className="text-center mb-5">
            <h2 className="section-title">¿Cómo podemos ayudarte?</h2>
          </div>

          <Row className="g-4 justify-content-center">
            {/* Tarjeta 1: Presencial */}
            <Col md={6} lg={3}>
              <Card className="h-100 card-modern hover-lift p-2">
                <Card.Body className="d-flex flex-column text-center align-items-center p-4">
                  <div className="icon-box">
                    <span style={{ fontSize: '2.5rem' }}>🧑‍💼</span>
                  </div>
                  <Card.Title as="h5" className="mb-3" style={{ color: 'var(--color-principal)', fontWeight: 'bold' }}>
                    Atención presencial
                  </Card.Title>
                  <Card.Text className="text-secondary flex-grow-1" style={{ fontSize: '0.95rem' }}>
                    Agenda tu cita y recibe atención personalizada en nuestra sede.
                  </Card.Text>
                  <button onClick={() => setShowModal(true)} className="btn btn-link text-decoration-none fw-bold mt-3" style={{ color: 'var(--color-principal)' }}>Agendar &rarr;</button>
                </Card.Body>
              </Card>
            </Col>

            {/* Tarjeta 2: Online (Deshabilitada) */}
            <Col md={6} lg={3}>
              <Card className="h-100 card-modern p-2" style={{ opacity: '0.75' }}>
                <Card.Body className="d-flex flex-column text-center align-items-center p-4">
                  <div className="icon-box" style={{ filter: 'grayscale(100%)', backgroundColor: '#e2e8f0' }}>
                    <span style={{ fontSize: '2.5rem' }}>💬</span>
                  </div>
                  <Card.Title as="h5" className="mb-3" style={{ color: 'var(--color-principal)', fontWeight: 'bold' }}>
                    Atención online
                  </Card.Title>
                  <Card.Text className="text-secondary flex-grow-1" style={{ fontSize: '0.95rem' }}>
                    Realiza tu consulta desde donde estés por videollamada o chat.
                  </Card.Text>
                  <span className="fw-bold mt-3" style={{ color: '#94a3b8', cursor: 'not-allowed' }}>Próximamente...</span>
                </Card.Body>
              </Card>
            </Col>

            {/* Tarjeta 3: Charlas */}
            <Col md={6} lg={3}>
              <Card className="h-100 card-modern hover-lift p-2">
                <Card.Body className="d-flex flex-column text-center align-items-center p-4">
                  <div className="icon-box">
                    <span style={{ fontSize: '2.5rem' }}>🎓</span>
                  </div>
                  <Card.Title as="h5" className="mb-3" style={{ color: 'var(--color-principal)', fontWeight: 'bold' }}>
                    Cursos y charlas
                  </Card.Title>
                  <Card.Text className="text-secondary flex-grow-1" style={{ fontSize: '0.95rem' }}>
                    Inscríbete en nuestras actividades gratuitas para la comunidad.
                  </Card.Text>
                  <a href="#charlas" className="btn btn-link text-decoration-none fw-bold mt-3" style={{ color: 'var(--color-principal)' }}>Ver actividades &rarr;</a>
                </Card.Body>
              </Card>
            </Col>

            {/* Tarjeta 4: Información */}
            <Col md={6} lg={3}>
              <Card className="h-100 card-modern hover-lift p-2">
                <Card.Body className="d-flex flex-column text-center align-items-center p-4">
                  <div className="icon-box">
                    <span style={{ fontSize: '2.5rem' }}>📖</span>
                  </div>
                  <Card.Title as="h5" className="mb-3" style={{ color: 'var(--color-principal)', fontWeight: 'bold' }}>
                    Información social
                  </Card.Title>
                  <Card.Text className="text-secondary flex-grow-1" style={{ fontSize: '0.95rem' }}>
                    Accede a guías, derechos, trámites y noticias relevantes.
                  </Card.Text>
                  <a href="#informacion" className="btn btn-link text-decoration-none fw-bold mt-3" style={{ color: 'var(--color-principal)' }}>Ir a información &rarr;</a>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Container>
      </section>

      {/* SECCIÓN: ¿Por qué elegir nuestra Clínica? */}
      <section className="py-5" style={{ backgroundColor: 'var(--color-principal, )', color: 'white' }}>
        <Container>
          <h4 className="text-center fw-bold mb-5">¿Por qué elegir nuestra Clínica?</h4>
          <Row className="g-4 text-center">
            
            <Col md={3} className="px-3">
              <div className="mb-3"><span style={{ fontSize: '2.8rem' }}>🛡️</span></div>
              <h6 className="fw-bold mb-3">Servicio gratuito y confidencial</h6>
              <p className="small" style={{ opacity: 0.85, lineHeight: '1.6' }}>
                Garantizamos total privacidad y acceso sin costo para quienes más lo necesitan en nuestra comunidad.
              </p>
            </Col>
            
            <Col md={3} className="px-3">
              <div className="mb-3"><span style={{ fontSize: '2.8rem' }}>👥</span></div>
              <h6 className="fw-bold mb-3">Profesionales y estudiantes comprometidos</h6>
              <p className="small" style={{ opacity: 0.85, lineHeight: '1.6' }}>
                Un equipo multidisciplinario guiado por expertos, dispuesto a entregarte la mejor orientación.
              </p>
            </Col>
            
            <Col md={3} className="px-3">
              <div className="mb-3"><span style={{ fontSize: '2.8rem' }}>❤️</span></div>
              <h6 className="fw-bold mb-3">Enfoque en derechos y dignidad</h6>
              <p className="small" style={{ opacity: 0.85, lineHeight: '1.6' }}>
                Tratamos cada caso particular con el respeto, la empatía y la urgencia que mereces.
              </p>
            </Col>
            
            <Col md={3} className="px-3">
              <div className="mb-3"><span style={{ fontSize: '2.8rem' }}>📈</span></div>
              <h6 className="fw-bold mb-3">Impacto real en nuestra comunidad</h6>
              <p className="small" style={{ opacity: 0.85, lineHeight: '1.6' }}>
                Trabajamos todos los días para reducir las brechas sociales y promover la justicia en la región de Arica.
              </p>
            </Col>

          </Row>
        </Container>
      </section>
      
      <AppointmentModal show={showModal} handleClose={() => setShowModal(false)} />
    </>
  );
};

export default Services;