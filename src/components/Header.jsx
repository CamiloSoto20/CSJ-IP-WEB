import { useState } from 'react';
import { Navbar, Nav, Container, Button } from 'react-bootstrap';
import { Link, useLocation } from 'react-router-dom';
import AppointmentModal from './AppointmentModal';

const Header = () => {
  const [showModal, setShowModal] = useState(false);
  const location = useLocation();

  return (
    <>
      <Navbar bg="white" expand="lg" className="shadow-sm py-3" sticky="top">
        <Container>
          <Navbar.Brand as={Link} to="/" className="d-flex align-items-center gap-2" style={{ color: 'var(--color-principal)', fontWeight: '800', fontSize: '1.4rem' }}>
            <span style={{ color: 'var(--color-secundario)' }}>⚖️</span> Clínica Socio Jurídica
          </Navbar.Brand>
          <Navbar.Toggle aria-controls="basic-navbar-nav" className="border-0 shadow-none" />
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="mx-auto fw-medium">
              <Nav.Link href="#quienes-somos" className="text-secondary px-3 hover-text-principal">Quiénes somos</Nav.Link>
              <Nav.Link href="#servicios" className="text-secondary px-3 hover-text-principal">Servicios</Nav.Link>
              <Nav.Link href="#informacion" className="text-secondary px-3 hover-text-principal">Información</Nav.Link>
              <Nav.Link href="#charlas" className="text-secondary px-3 hover-text-principal">Charlas y capacitaciones</Nav.Link>
            </Nav>
            <div className="d-flex flex-column flex-lg-row gap-3 mt-3 mt-lg-0">
              <Button
                className="btn-custom text-white"
                style={{ backgroundColor: 'var(--color-principal)', border: 'none' }}
                onClick={() => setShowModal(true)}
              >
                Agenda tu cita
              </Button>
              <Button variant="outline-secondary" as={Link} to="/login" className="btn-custom bg-transparent">
                Iniciar sesión
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