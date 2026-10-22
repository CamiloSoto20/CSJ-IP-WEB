import { Container, Row, Col, Button } from 'react-bootstrap';
import { useState } from 'react';
import AppointmentModal from './AppointmentModal';
import imagen from '../assets/e45e6df4-79f7-4895-9abd-957b5da27003.jpg';

const Hero = () => {
  const [showModal, setShowModal] = useState(false);

  return (
    <section className="bg-light position-relative" style={{ padding: '6rem 0', overflow: 'hidden' }}>
      {/* Fondo degradado sutil */}
      <div className="position-absolute top-0 end-0 h-100 w-50" style={{ background: 'linear-gradient(135deg, rgba(200,200,200,0.2) 0%, rgba(240,240,240,0.5) 100%)', borderBottomLeftRadius: '200px', zIndex: 0 }}></div>
      
      <Container className="position-relative z-1">
        <Row className="align-items-center g-5">
          <Col lg={6} className="pe-lg-5">
            <h1 style={{ color: '#014236', fontWeight: '800', fontSize: '3rem', lineHeight: '1.2', letterSpacing: '-1px' }}>
              Orientación social y jurídica para una comunidad con más derechos y oportunidades
            </h1>
            <p className="mt-4 mb-5 text-secondary fw-medium" style={{ fontSize: '1.1rem', maxWidth: '90%' }}>
              Atención gratuita, confidencial y profesional para acompañar tus necesidades sociales y jurídicas.
            </p>
            <div className="d-flex flex-wrap gap-3">
              <Button 
                className="text-white px-4 py-2 d-flex align-items-center gap-2 fw-bold"
                style={{ backgroundColor: '#045344', border: 'none', borderRadius: '8px' }}
                onClick={() => setShowModal(true)}
              >
                📅 Agendar atención
              </Button>
            </div>
          </Col>
          <Col lg={6}>
            <div className="position-relative" style={{ padding: '1rem' }}>
              {/* Decoración de la imagen (borde desfasado) */}
              <div className="position-absolute w-100 h-100 rounded-4" style={{ top: '20px', left: '20px', border: '3px solid rgba(120, 190, 32, 0.4)', zIndex: 0 }}></div>
              <img 
                src={imagen} 
                alt="Atención Clínica" 
                className="img-fluid rounded-4 shadow-lg w-100 position-relative z-1"
                style={{ objectFit: 'cover', minHeight: '400px', borderBottomRightRadius: '80px' }}
                onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?auto=format&fit=crop&q=80&w=1000' }}
              />
              {/* Logo integrado en la imagen inferior */}
              <div className="position-absolute bottom-0 start-0 m-4 p-3 bg-white rounded-3 shadow z-2 d-flex align-items-center justify-content-center">
                <img src="/assets/LOGO_CSJ.png" alt="Logo" style={{ height: '35px' }} onError={(e) => e.target.style.display='none'} />
              </div>
            </div>
          </Col>
        </Row>
      </Container>
      <AppointmentModal show={showModal} handleClose={() => setShowModal(false)} />
    </section>
  );
};

export default Hero;