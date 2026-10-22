import { Container, Row, Col } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import sello from '../assets/sellos-ipcft-color-fb.jpg';
import logo from '../assets/LOGO_CSJ.png';

const Footer = () => {
  return (
    <footer id="contacto" className="w-100 mt-auto">
      {/* 1. Sección oscura institucional de la clínica */}
      <div className="pt-5 pb-4" style={{ backgroundColor: '#014236', color: 'white' }}>
        <Container>
          <Row className="gy-4 align-items-start">
            {/* Columna 1: Info Clínica */}
            <Col lg={4} md={6} className="pe-lg-4">
              <div className="bg-white d-inline-block px-3 py-2 rounded-3 mb-3 shadow-sm">
                <img
                  src={logo}
                  alt="Logo Clínica Socio Jurídica"
                  style={{ height: '55px', width: 'auto', objectFit: 'contain' }}
                />
              </div>
              <h6 className="fw-bold text-light mb-3" style={{ color: 'var(--color-secundario, #78BE20)' }}>Santo Tomás Arica</h6>
              <p className="text-light mb-0" style={{ opacity: 0.8, lineHeight: '1.7', fontSize: '0.92rem' }}>
                Promovemos el acceso a derechos y acompañamos a la comunidad con respeto, cercanía y compromiso.
              </p>
              <div className="d-flex gap-3 mt-4">
                {/* Enlace a Facebook */}
                <a 
                  href="https://www.facebook.com/clinica.socio.juridica.santo.tomas/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="bg-secondary bg-opacity-25 text-white rounded-circle d-flex align-items-center justify-content-center hover-lift text-decoration-none" 
                  style={{ width: '42px', height: '42px', transition: 'all 0.3s ease' }}
                  title="Visítanos en Facebook"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
                    <path d="M16 8.049c0-4.446-3.582-8.05-8-8.05C3.58 0-.002 3.603-.002 8.05c0 4.017 2.926 7.347 6.75 7.951v-5.625h-2.03V8.05H6.75V6.275c0-2.017 1.195-3.131 3.022-3.131.876 0 1.791.157 1.791.157v1.98h-1.009c-.993 0-1.303.621-1.303 1.258v1.51h2.218l-.354 2.326H9.25V16c3.824-.604 6.75-3.934 6.75-7.951z"/>
                  </svg>
                </a>

                {/* Enlace a Instagram */}
                <a 
                  href="https://www.instagram.com/clinicasociojuridica.arica/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="bg-secondary bg-opacity-25 text-white rounded-circle d-flex align-items-center justify-content-center hover-lift text-decoration-none" 
                  style={{ width: '42px', height: '42px', transition: 'all 0.3s ease' }}
                  title="Visítanos en Instagram"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
                    <path d="M8 0C5.829 0 5.556.01 4.703.048 3.85.088 3.269.222 2.76.42a3.917 3.917 0 0 0-1.417.923A3.927 3.927 0 0 0 .42 2.76C.222 3.268.087 3.85.048 4.7.01 5.555 0 5.827 0 8.001c0 2.172.01 2.444.048 3.297.04.852.174 1.433.372 1.942.205.526.478.972.923 1.417.444.445.89.719 1.416.923.51.198 1.09.333 1.942.372C5.555 15.99 5.827 16 8 16s2.444-.01 3.298-.048c.851-.04 1.434-.174 1.943-.372a3.916 3.916 0 0 0 1.416-.923c.445-.445.718-.891.923-1.417.197-.509.332-1.09.372-1.942C15.99 10.445 16 10.173 16 8s-.01-2.445-.048-3.299c-.04-.851-.175-1.433-.372-1.941a3.926 3.926 0 0 0-.923-1.417A3.911 3.911 0 0 0 13.24.42c-.51-.198-1.092-.333-1.943-.372C10.443.01 10.172 0 7.998 0h.003zm-.717 1.442h.718c2.136 0 2.389.007 3.232.046.78.036 1.204.166 1.486.275.373.145.64.319.92.599.28.28.453.546.598.92.11.281.24.705.275 1.485.039.843.047 1.096.047 3.231s-.008 2.389-.047 3.232c-.035.78-.166 1.203-.275 1.485a2.47 2.47 0 0 1-.599.919c-.28.28-.546.453-.92.598-.28.11-.704.24-1.485.276-.843.038-1.096.047-3.232.047s-2.39-.009-3.233-.047c-.78-.036-1.203-.166-1.485-.276a2.478 2.478 0 0 1-.92-.598 2.48 2.48 0 0 1-.6-.92c-.109-.281-.24-.705-.275-1.485-.038-.843-.046-1.096-.046-3.233 0-2.136.008-2.388.046-3.231.036-.78.166-1.204.276-1.486.145-.373.319-.64.599-.92.28-.28.546-.453.92-.598.282-.11.705-.24 1.485-.276.738-.034 1.024-.044 2.515-.045v.002zm4.988 1.328a.96.96 0 1 0 0 1.92.96.96 0 0 0 0-1.92zm-4.27 1.122a4.109 4.109 0 1 0 0 8.217 4.109 4.109 0 0 0 0-8.217zm0 1.441a2.667 2.667 0 1 1 0 5.334 2.667 2.667 0 0 1 0-5.334z"/>
                  </svg>
                </a>
              </div>
            </Col>

            {/* Columna 2: Enlaces Rápidos */}
            <Col lg={2} md={6}>
              <h5 className="mb-4" style={{ color: 'var(--color-secundario, #78BE20)', fontWeight: 'bold' }}>
                Enlaces rápidos
              </h5>
              <ul className="list-unstyled mb-0">
                <li className="mb-2"><a href="/" className="text-light text-decoration-none" style={{ opacity: 0.85 }}>Inicio</a></li>
                <li className="mb-2"><a href="#servicios" className="text-light text-decoration-none" style={{ opacity: 0.85 }}>Servicios</a></li>
                <li className="mb-2"><a href="#agendar" className="text-light text-decoration-none" style={{ opacity: 0.85 }}>Agenda tu atención</a></li>
                <li className="mb-2"><a href="#charlas" className="text-light text-decoration-none" style={{ opacity: 0.85 }}>Cursos y capacitaciones</a></li>
                <li className="mb-2"><a href="#informacion" className="text-light text-decoration-none" style={{ opacity: 0.85 }}>Información</a></li>
                <li className="mb-2"><a href="#contacto" className="text-light text-decoration-none" style={{ opacity: 0.85 }}>Contacto</a></li>
              </ul>
            </Col>

            {/* Columna 3: Información */}
            <Col lg={3} md={6}>
              <h5 className="mb-4" style={{ color: 'var(--color-secundario, #78BE20)', fontWeight: 'bold' }}>
                Información
              </h5>
              <ul className="list-unstyled mb-0">
                <li className="mb-2"><Link to="/faq" className="text-light text-decoration-none" style={{ opacity: 0.85 }}>Preguntas frecuentes</Link></li>
                <li className="mb-2"><Link to="/guias" className="text-light text-decoration-none" style={{ opacity: 0.85 }}>Guías y documentos</Link></li>
                <li className="mb-2"><Link to="/noticias" className="text-light text-decoration-none" style={{ opacity: 0.85 }}>Noticias</Link></li>
                <li className="mb-2"><Link to="/terminos" className="text-light text-decoration-none" style={{ opacity: 0.85 }}>Términos y condiciones</Link></li>
                <li className="mb-2"><Link to="/privacidad" className="text-light text-decoration-none" style={{ opacity: 0.85 }}>Política de privacidad</Link></li>
              </ul>
            </Col>

            {/* Columna 4: Contacto */}
            <Col lg={3} md={6}>
              <h5 className="mb-4" style={{ color: 'var(--color-secundario, #78BE20)', fontWeight: 'bold' }}>
                Contacto
              </h5>
              <ul className="list-unstyled text-light mb-0" style={{ opacity: 0.85, lineHeight: '2' }}>
                <li className="d-flex align-items-start gap-2 mb-2">
                  <span>📍</span>
                  <div>
                    <strong>Sede Arica</strong><br/>
                    Av. 18 de Septiembre N°1191, Sede Arica
                  </div>
                </li>
                <li className="d-flex align-items-center gap-2 mb-2">
                  <span>📞</span> +58 2 5784 22
                </li>
                <li className="d-flex align-items-center gap-2 mb-2">
                  <span>✉️</span> csj.arica@santotomas.cl
                </li>
                <li className="d-flex align-items-start gap-2 mt-3">
                  <span>🕒</span>
                  <div>
                    <strong>Horario de atención:</strong><br/>
                    Lunes a Jueves 09:00 a 18:00 hrs.<br/>
                    y Viernes 09:00 a 14:00 hrs.
                  </div>
                </li>
              </ul>
            </Col>
          </Row>
        </Container>
      </div>

      {/* 2. Franja inferior de Acreditación Institucional */}
      <div className="bg-white w-100 py-4 border-top">
        <Container className="d-flex justify-content-center align-items-center">
          <img
            src={sello} 
            alt="Acreditación Institucional"
            className="img-fluid"
            style={{
              maxHeight: '110px', 
              width: 'auto',
              maxWidth: '100%',
              objectFit: 'contain'
            }}
          />
        </Container>
      </div>

      {/* 3. Copyright final */}
      <div className="py-3" style={{ backgroundColor: '#014236' }}>
        <Container className="d-flex justify-content-center align-items-center small text-light" style={{ opacity: 1.0 }}>
          <span>&copy; {new Date().getFullYear()} Santo Tomás | Todos los derechos reservados</span>
        </Container>
      </div>
    </footer>
  );
};

export default Footer;