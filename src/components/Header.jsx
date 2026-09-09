import { useState } from 'react';
import { Navbar, Nav, Container, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import AppointmentModal from './AppointmentModal';

const Header = () => {
  const [showModal, setShowModal] = useState(false);

  return (
    <>
      <Navbar bg="white" expand="lg" className="shadow-sm py-3" sticky="top">
        <Container>
          <Navbar.Brand as={Link} to="/" style={{ color: 'var(--color-principal)', fontWeight: 'bold' }}>
            Clínica Socio Jurídica
          </Navbar.Brand>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="me-auto">
              <Nav.Link href="#quienes-somos" className="text-secondary">Quiénes somos</Nav.Link>
              <Nav.Link href="#servicios" className="text-secondary">Servicios</Nav.Link>
              <Nav.Link href="#informacion" className="text-secondary">Información</Nav.Link>
              <Nav.Link href="#charlas" className="text-secondary">Charlas y capacitaciones</Nav.Link>
              <Nav.Link href="#contacto" className="text-secondary">Contacto</Nav.Link>
            </Nav>
            <div className="d-flex gap-2 mt-3 mt-lg-0">
              <Button
                style={{ backgroundColor: 'var(--color-principal)', borderColor: 'var(--color-principal)' }}
                onClick={() => setShowModal(true)}
              >
                Agenda tu cita
              </Button>
              <Button variant="outline-secondary" as={Link} to="/login">
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