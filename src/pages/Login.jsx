import { useState } from 'react';
import { Container, Card, Form, Button, Alert } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault(); // Evita que la página se recargue al enviar el formulario
    setLoading(true);
    setErrorMsg('');

    const { data, error } = await supabase.auth.signInWithPassword({
      email: email,
      password: password,
    });

    if (error) {
      setErrorMsg('Credenciales incorrectas. Verifica tu correo y contraseña.');
      setLoading(false);
    } else {
      // Login exitoso, redirigimos al dashboard interno
      navigate('/dashboard');
    }
  };

  const handleMicrosoftLogin = () => {
    alert("La conexión con Microsoft requiere configuración en el portal de Azure. Lo implementaremos más adelante.");
  };

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

              {errorMsg && <Alert variant="danger">{errorMsg}</Alert>}

              <Form onSubmit={handleLogin}>
                <Form.Group className="mb-3" controlId="formBasicEmail">
                  <Form.Label className="small fw-bold text-muted">Correo electrónico institucional</Form.Label>
                  <Form.Control 
                    type="email" 
                    placeholder="ejemplo@santotomas.cl" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </Form.Group>

                <Form.Group className="mb-4" controlId="formBasicPassword">
                  <Form.Label className="small fw-bold text-muted">Contraseña</Form.Label>
                  <Form.Control 
                    type="password" 
                    placeholder="Ingresa tu contraseña" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </Form.Group>

                <Button 
                  style={{ backgroundColor: 'var(--color-principal)', borderColor: 'var(--color-principal)' }} 
                  className="w-100 mb-3 py-2"
                  type="submit"
                  disabled={loading}
                >
                  {loading ? 'Iniciando sesión...' : 'Iniciar sesión'}
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
                  onClick={handleMicrosoftLogin}
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