import { Container, Row, Col, Button } from 'react-bootstrap';

const AboutUs = () => {
  return (
    <section id="quienes-somos" className="py-5 bg-white">
      <Container className="py-5">
        <Row className="align-items-center g-5">
          {/* Columna de Texto */}
          <Col lg={7} className="pe-lg-5">
            <h2 className="section-title section-title-left">Quiénes Somos</h2>
            <div className="mt-4 text-secondary" style={{ fontSize: '1.1rem', lineHeight: '1.8' }}>
              <p>
                Aquí se detallará la historia de la Clínica Socio Jurídica, indicando cuándo nació, 
                por qué se creó y cuáles son sus objetivos principales orientados a la comunidad.
              </p>
              <p>
                También incluiremos nuestra experiencia, el trabajo realizado hasta la fecha y la 
                vinculación directa con la institución de educación superior para acercar a nuestros estudiantes a la realidad social y legal.
              </p>
            </div>
          </Col>
          
          {/* Columna de Llamado a la Acción (CTA) */}
          <Col lg={5}>
            <div 
              className="p-5 rounded-4 shadow-sm text-center position-relative" 
              style={{ backgroundColor: '#f4f7f5', borderTop: '5px solid var(--color-secundario)' }}
            >
              <h4 className="mb-3" style={{ color: 'var(--color-principal)', fontWeight: '800' }}>¿Necesitas orientación?</h4>
              <p className="text-secondary mb-4">
                Nuestro equipo de profesionales y estudiantes está preparado para escucharte y apoyarte de forma completamente gratuita.
              </p>
              <Button 
                className="btn-custom text-white w-100 py-3 fs-5"
                style={{ backgroundColor: 'var(--color-principal)', border: 'none' }}
                onClick={() => document.querySelector('.btn-custom').click()}
              >
                Agendar ahora
              </Button>
            </div>
          </Col>
        </Row>
      </Container>
    </section>
  );
};

export default AboutUs;