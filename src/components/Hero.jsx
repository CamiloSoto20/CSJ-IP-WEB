import { Container, Row, Col, Button } from 'react-bootstrap';

const Hero = () => {
  return (
    <section className="bg-light py-5" style={{ minHeight: '80vh', display: 'flex', alignItems: 'center' }}>
      <Container>
        <Row className="align-items-center">
          <Col lg={6} className="mb-4 mb-lg-0 pe-lg-5">
            <h1 style={{ color: 'var(--color-principal)', fontWeight: 'bold', fontSize: '3rem' }}>
              Orientación y apoyo integral para la comunidad
            </h1>
            <p className="lead mt-3 mb-4" style={{ color: 'var(--color-texto)' }}>
              La Clínica Socio Jurídica entrega atención gratuita y profesional en materias jurídicas y sociales, promoviendo el acceso a la justicia y el bienestar.
            </p>
            <Button 
              size="lg"
              style={{ backgroundColor: 'var(--color-secundario)', borderColor: 'var(--color-secundario)', color: 'white' }}
            >
              Agenda tu cita
            </Button>
          </Col>
          <Col lg={6}>
            <img 
              src="/images/image.jpg" 
              alt="Frontis o equipo de la Clínica Socio Jurídica" 
              className="img-fluid rounded shadow-lg"
              style={{ objectFit: 'cover', width: '100%', maxHeight: '500px' }}
            />
          </Col>
        </Row>
      </Container>
    </section>
  );
};

export default Hero;