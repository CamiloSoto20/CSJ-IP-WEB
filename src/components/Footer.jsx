import { Container, Row, Col } from 'react-bootstrap';

const Footer = () => {
  return (
    <footer className="pt-5 pb-4" style={{ backgroundColor: 'var(--color-texto)', color: 'white' }}>
      <Container>
        <Row className="gy-4">
          {/* Columna Institucional */}
          <Col lg={4}>
            <h5 className="mb-3" style={{ color: 'var(--color-secundario)', fontWeight: 'bold' }}>
              Clínica Socio Jurídica
            </h5>
            <p className="small text-light mb-0" style={{ opacity: 0.9 }}>
              Entregando orientación y apoyo integral gratuito a la comunidad, promoviendo el acceso a la justicia y el bienestar social.
            </p>
          </Col>
          
          {/* Columna de Contacto */}
          <Col lg={4}>
            <h5 className="mb-3" style={{ color: 'var(--color-secundario)', fontWeight: 'bold' }}>
              Contacto
            </h5>
            <ul className="list-unstyled small text-light mb-0" style={{ opacity: 0.9 }}>
              <li className="mb-2">📍 <strong>Dirección:</strong> [Por definir]</li>
              <li className="mb-2">📞 <strong>Teléfono:</strong> [Por definir]</li>
              <li className="mb-2">✉️ <strong>Correo:</strong> [Por definir]</li>
            </ul>
          </Col>
          
          {/* Columna de Enlaces Rápidos */}
          <Col lg={4}>
            <h5 className="mb-3" style={{ color: 'var(--color-secundario)', fontWeight: 'bold' }}>
              Navegación
            </h5>
            <ul className="list-unstyled small">
              <li className="mb-2">
                <a href="#quienes-somos" className="text-light text-decoration-none" style={{ opacity: 0.9 }}>Quiénes somos</a>
              </li>
              <li className="mb-2">
                <a href="#servicios" className="text-light text-decoration-none" style={{ opacity: 0.9 }}>Servicios</a>
              </li>
              <li className="mb-2">
                <a href="/login" className="text-light text-decoration-none" style={{ opacity: 0.9 }}>Acceso interno</a>
              </li>
            </ul>
          </Col>
        </Row>
        
        <hr className="mt-4 mb-3" style={{ borderColor: 'rgba(255,255,255,0.2)' }} />
        
        <div className="text-center small text-light" style={{ opacity: 0.8 }}>
          &copy; {new Date().getFullYear()} Clínica Socio Jurídica. Todos los derechos reservados.
        </div>
      </Container>
    </footer>
  );
};

export default Footer;