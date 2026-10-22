import { Container, Row, Col, Button } from 'react-bootstrap';

const AboutUs = () => {
  return (
    <section id="quienes-somos" className="py-5 bg-white">
      <Container className="py-5">
        <Row className="align-items-center g-5">
          <Col lg={7} className="pe-lg-5">
            <h2 className="section-title section-title-left">Quiénes Somos</h2>
            <div className="mt-4 text-secondary" style={{ fontSize: '1.1rem', lineHeight: '1.8' }}>
              <p>
                La Clínica Socio Jurídica comenzó su historia en 2020 en la ciudad de Arica, como una respuesta concreta e innovadora a las necesidades de la comunidad local. Ante un escenario donde muchas familias de la región enfrentaban barreras para acceder a orientación legal y apoyo social, el Área de Ciencias Sociales de la institución impulsó un proyecto pionero que buscaba acortar esa brecha.

                Arica se convirtió así en la sede piloto a nivel nacional del modelo de Clínica Socio Jurídica en Santo Tomás, marcando el camino para que la iniciativa se replicara posteriormente en otros puntos del país. Lo que empezó como una propuesta centrada en el compromiso comunitario y la Vinculación con el Medio, rápidamente se consolidó como un espacio donde la ética, el rigor profesional y la empatía se encuentran día a día.

                Desde sus inicios, la clínica funciona como un puente de doble vía: por un lado, brinda atención y acompañamiento multidisciplinario gratuito a quienes más lo necesitan; por otro, abre sus puertas para que los estudiantes en etapa final de formación pongan sus conocimientos al servicio de personas reales, enfrentando desafíos auténticos bajo la guía de sus docentes.

                Hoy, la Clínica Socio Jurídica sigue creciendo con la misma convicción con la que nació: poner el conocimiento al servicio del desarrollo humano, la justicia social y el bienestar de las familias de la Región de Arica y Parinacota.
              </p>
              <p>
                También incluiremos nuestra experiencia, el trabajo realizado hasta la fecha y la
                vinculación directa con la institución de educación superior para acercar a nuestros estudiantes a la realidad social y legal.
              </p>
            </div>
          </Col>

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