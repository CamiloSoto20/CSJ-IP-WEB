import { Container, Row, Col, Button } from 'react-bootstrap';

const AboutUs = () => {
  return (
    <section id="quienes-somos" className="py-5 bg-white">
      <Container>
        <Row className="align-items-center">
          {/* Columna de Texto */}
          <Col lg={8} className="mb-4 mb-lg-0 pe-lg-5">
            <h2 style={{ color: 'var(--color-principal)', fontWeight: 'bold' }}>Quiénes Somos</h2>
            <div className="mt-4 text-muted">
              <p><strong>[Contenido Provisional - Pendiente información de la coordinadora]</strong></p>
              <p>
                Aquí se detallará la historia de la Clínica Socio Jurídica, indicando cuándo nació, 
                por qué se creó y cuáles son sus objetivos principales orientados a la comunidad.
              </p>
              <p>
                También incluiremos nuestra experiencia, el trabajo realizado hasta la fecha y la 
                vinculación directa con la institución de educación superior.
              </p>
            </div>
          </Col>
          
          {/* Columna de Llamado a la Acción (CTA) */}
          <Col lg={4}>
            <div 
              className="p-4 rounded shadow-sm text-center" 
              style={{ backgroundColor: '#f8f9fa', borderTop: '4px solid var(--color-secundario)' }}
            >
              <h4 style={{ color: 'var(--color-principal)', fontWeight: '600' }}>¿Necesitas orientación?</h4>
              <p className="text-muted small mb-4 mt-3">
                Estamos para apoyarte. Solicita una atención con nuestro equipo de profesionales.
              </p>
              <Button 
                style={{ 
                  backgroundColor: 'var(--color-principal)', 
                  borderColor: 'var(--color-principal)', 
                  width: '100%' 
                }}
              >
                Agenda tu cita
              </Button>
            </div>
          </Col>
        </Row>
      </Container>
    </section>
  );
};

export default AboutUs;