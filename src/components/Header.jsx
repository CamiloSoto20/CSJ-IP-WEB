import { useState } from 'react';
import { Navbar, Nav, Container, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import AppointmentModal from './AppointmentModal';
import Logo from '../assets/LOGO_CSJ.png';

const Header = () => {
  const [showModal, setShowModal] = useState(false);

  return (
    <>
      <Navbar bg="white" expand="lg" className="shadow-sm py-3" sticky="top">
        <Container>
          <Navbar.Brand as={Link} to="/" className="d-flex align-items-center py-0">
            <img
              src={Logo}
              alt="Santo Tomás Arica - Clínica Socio Jurídica"
              style={{ height: '55px', width: 'auto', objectFit: 'contain' }}
            />
          </Navbar.Brand>

          <Navbar.Toggle aria-controls="basic-navbar-nav" className="border-0 shadow-none" />
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="mx-auto fw-semibold gap-3" style={{ fontSize: '0.95rem' }}>
              <Nav.Link as={Link} to="/" className="text-dark px-2">Inicio</Nav.Link>
              <Nav.Link href="#servicios" className="text-dark px-2">Servicios</Nav.Link>
              <Nav.Link href="#" onClick={(e) => { e.preventDefault(); setShowModal(true); }} className="text-dark px-2">Agenda tu atención</Nav.Link>
              <Nav.Link href="#charlas" className="text-dark px-2">Cursos y capacitaciones</Nav.Link>
              <Nav.Link href="#informacion" className="text-dark px-2">Información</Nav.Link>
              <Nav.Link href="#quienes-somos" className="text-dark px-2">Nosotros</Nav.Link>
              <Nav.Link href="#contacto" className="text-dark px-2">Contacto</Nav.Link>
            </Nav>
            <div className="d-flex mt-3 mt-lg-0">
              <Button variant="dark" as={Link} to="/login" className="px-4 py-2 text-white fw-bold" style={{ borderRadius: '8px', backgroundColor: '#4a4a4a', border: 'none' }}>
                👤 Iniciar sesión
              </Button>
            </div>
          </Navbar.Collapse>
        </Container>
      </Navbar>

      <AppointmentModal show={showModal} handleClose={() => setShowModal(false)} />
    </>
  );
};

export default Header;