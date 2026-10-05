import { Container, Row, Col } from 'react-bootstrap';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="pt-5 pb-4" style={{ backgroundColor: '#1e293b', color: 'white' }}>
      <Container className="pt-3">
        <Row className="gy-4">
          {/* Columna Institucional */}
          <Col lg={5} className="pe-lg-5">
            <h4 className="mb-4 d-flex align-items-center gap-2" style={{ color: 'white', fontWeight: '800' }}>
              <span style={{ color: 'var(--color-secundario)' }}>⚖️</span> Clínica Socio Jurídica
            </h4>
            <p className="text-light mb-0" style={{ opacity: 0.75, lineHeight: '1.8', fontSize: '0.95rem' }}>
              Entregando orientación y apoyo integral gratuito a la comunidad, promoviendo el acceso a la justicia, la equidad y el bienestar social mediante el compromiso de nuestros profesionales y estudiantes.
            </p>
          </Col>
          
          {/* Columna de Contacto */}
          <Col lg={4}>
            <h5 className="mb-4" style={{ color: 'var(--color-secundario)', fontWeight: 'bold' }}>
              Contacto Directo
            </h5>
            <ul className="list-unstyled text-light mb-0" style={{ opacity: 0.8, lineHeight: '2' }}>
              <li>📍 <strong className="ms-2">Dirección:</strong> Arturo Prat 269, Santiago</li>
              <li>📞 <strong className="ms-2">Teléfono:</strong> +56 9 1234 5678</li>
              <li>✉️ <strong className="ms-2">Correo:</strong> contacto@csj.cl</li>
            </ul>
          </Col>
          
          {/* Columna de Enlaces Rápidos */}
          <Col lg={3}>
            <h5 className="mb-4" style={{ color: 'var(--color-secundario)', fontWeight: 'bold' }}>
              Navegación
            </h5>
            <ul className="list-unstyled">
              <li className="mb-2">
                <a href="#quienes-somos" className="text-light text-decoration-none hover-text-secundario transition-all" style={{ opacity: 0.8 }}>Quiénes somos</a>
              </li>
              <li className="mb-2">
                <a href="#servicios" className="text-light text-decoration-none hover-text-secundario transition-all" style={{ opacity: 0.8 }}>Nuestros Servicios</a>
              </li>
              <li className="mb-2">
                <a href="#charlas" className="text-light text-decoration-none hover-text-secundario transition-all" style={{ opacity: 0.8 }}>Charlas y Talleres</a>
              </li>
              <li className="mb-2 mt-4">
                <Link to="/login" className="text-light fw-bold text-decoration-none" style={{ opacity: 0.9 }}>
                  🔒 Acceso Interno CSJ
                </Link>
              </li>
            </ul>
          </Col>
        </Row>
        
        <hr className="mt-5 mb-4" style={{ borderColor: 'rgba(255,255,255,0.1)' }} />
        
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-center small text-light" style={{ opacity: 0.6 }}>
          <span>&copy; {new Date().getFullYear()} Clínica Socio Jurídica. Todos los derechos reservados.</span>
          <span className="mt-2 mt-md-0">Desarrollado para la comunidad.</span>
        </div>
      </Container>
    </footer>
  );
};

export default Footer;