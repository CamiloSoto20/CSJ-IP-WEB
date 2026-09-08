import { Container, Card, Form, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';

const Login = () => {
  return (
    <div style={{ backgroundColor: 'var(--color-fondo)', minHeight: '100vh', display: 'flex', alignItems: 'center' }}>
      <Container>
        <div className="d-flex justify-content-center">
          <Card className="shadow-lg border-0" style={{ maxWidth: '450px', width: '100%' }}>
            <Card.Body className="p-5">
              <div className="text-center mb-4">
                <h2 style={{ color: 'var(--color-principal)', fontWeight: 'bold' }}>Clínica Socio Jurídica</h2>
                <p className="text-muted">Acceso exclusivo para equipo interno</p>
              </div>

              <Form>
                <Form.Group className="mb-3" controlId="formBasicEmail">
                  <Form.Label className="small fw-bold text-muted">Correo electrónico institucional</Form.Label>
                  <Form.Control type="email" placeholder="ejemplo@santotomas.cl" />
                </Form.Group>

                <Form.Group className="mb-4" controlId="formBasicPassword">
                  <Form.Label className="small fw-bold text-muted">Contraseña</Form.Label>
                  <Form.Control type="password" placeholder="Ingresa tu contraseña" />
                </Form.Group>

                <Button 
                  style={{ backgroundColor: 'var(--color-principal)', borderColor: 'var(--color-principal)' }} 
                  className="w-100 mb-3 py-2"
                  type="button"
                >
                  Iniciar sesión
                </Button>

                <div className="d-flex align-items-center my-4">
                  <hr className="flex-grow-1 text-muted" />
                  <span className="mx-2 text-muted small">o ingresa con</span>
                  <hr className="flex-grow-1 text-muted" />
                </div>

                <Button 
                  variant="outline-secondary" 
                  className="w-100 py-2 d-flex justify-content-center align-items-center gap-2"
                  type="button"
                >
                  <img src="https://upload.wikimedia.org/wikipedia/commons/4/44/Microsoft_logo.svg" alt="Microsoft" style={{ width: '20px' }} />
                  Microsoft
                </Button>
              </Form>
              
              <div className="text-center mt-4">
                <Link to="/" className="text-decoration-none small text-muted">
                  ← Volver a la página principal
                </Link>
              </div>
            </Card.Body>
          </Card>
        </div>
      </Container>
    </div>
  );
};

export default Login;