import { Container, Row, Col, Button, Badge } from 'react-bootstrap';
import imagenclinica from '../assets/e45e6df4-79f7-4895-9abd-957b5da27003.jpg'; // Asegúrate de que la ruta sea correcta

const Hero = () => {
  return (
    <section className="bg-white position-relative" style={{ minHeight: '85vh', display: 'flex', alignItems: 'center', overflow: 'hidden' }}>
      {/* Fondo decorativo sutil */}
      <div className="position-absolute top-0 end-0 w-50 h-100" style={{ backgroundColor: 'rgba(120, 190, 32, 0.03)', borderBottomLeftRadius: '100px' }}></div>
      
      <Container className="py-5 position-relative z-1">
        <Row className="align-items-center g-5">
          <Col lg={6} className="pe-lg-5">
            <Badge bg="success" className="bg-opacity-10 text-success mb-3 px-3 py-2 rounded-pill fw-bold" style={{ letterSpacing: '1px' }}>
              ATENCIÓN GRATUITA Y PROFESIONAL
            </Badge>
            <h1 style={{ color: 'var(--color-principal)', fontWeight: '800', fontSize: '3.5rem', lineHeight: '1.2' }}>
              Orientación y apoyo integral para la comunidad.
            </h1>
            <p className="lead mt-4 mb-5 text-secondary" style={{ fontSize: '1.15rem' }}>
              La Clínica Socio Jurídica entrega orientación en materias jurídicas y sociales, promoviendo el acceso a la justicia y el bienestar de quienes más lo necesitan.
            </p>
            <div className="d-flex gap-3">
              <Button 
                size="lg"
                className="btn-custom text-white px-5"
                style={{ backgroundColor: 'var(--color-secundario)', border: 'none' }}
                onClick={() => document.querySelector('.btn-custom').click()} // Simula el click al nav
              >
                Agenda tu cita
              </Button>
            </div>
          </Col>
          <Col lg={6}>
            <div className="position-relative">
              <img 
                src={imagenclinica} 
                alt="Equipo Clínica Socio Jurídica" 
                className="img-fluid rounded-4 shadow-lg w-100"
                style={{ objectFit: 'cover', minHeight: '450px' }}
                onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1556761175-4b46a572b786?auto=format&fit=crop&q=80&w=1000' }}
              />
            </div>
          </Col>
        </Row>
      </Container>
    </section>
  );
};

export default Hero;