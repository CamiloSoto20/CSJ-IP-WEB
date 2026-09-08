import { Navbar, Nav, Container, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';

const Header = () => {
  return (
    <Navbar bg="white" expand="lg" className="shadow-sm sticky-top">
      <Container>
        <Navbar.Brand as={Link} to="/" style={{ color: 'var(--color-principal)', fontWeight: 'bold' }}>
          Clínica Socio Jurídica
        </Navbar.Brand>

        <Navbar.Toggle aria-controls="navbar-nav" />

        <Navbar.Collapse id="navbar-nav">
          <Nav className="me-auto">
            <Nav.Link href="#quienes-somos">Quiénes somos</Nav.Link>
            <Nav.Link href="#servicios">Servicios</Nav.Link>
            <Nav.Link href="#informacion">Información</Nav.Link>
            <Nav.Link href="#charlas">Charlas y capacitaciones</Nav.Link>
            <Nav.Link href="#contacto">Contacto</Nav.Link>
          </Nav>

          <div className="d-flex gap-2 mt-3 mt-lg-0">
            <Button 
              style={{ backgroundColor: 'var(--color-principal)', borderColor: 'var(--color-principal)' }}
            >
              Agenda tu cita
            </Button>
            <Button 
              variant="outline-secondary" 
              as={Link} 
              to="/login"
            >
              Iniciar sesión
            </Button>
          </div>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default Header;