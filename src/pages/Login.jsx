import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Form, Button, Alert, Spinner } from 'react-bootstrap';
import './Login.css';
import logoClinica from '../assets/LOGO_CSJ.jpg';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [isLightMode, setIsLightMode] = useState(true);
  const navigate = useNavigate();

  const toggleTheme = () => {
    setIsLightMode(!isLightMode);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      
      const userEmail = email.toLowerCase();
      if (userEmail.includes('soporte')) {
        navigate('/panel-soporte');
      } else if (userEmail.includes('estudiante')) {
        navigate('/panel-estudiante');
      } else {
        navigate('/dashboard');
      }
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`login-container ${!isLightMode ? 'dark-mode' : ''}`}>

      <button
        className="theme-toggle"
        onClick={toggleTheme}
        title={isLightMode ? "Cambiar a modo noche" : "Cambiar a modo día"}
      >
        {isLightMode ? '🌙' : '☀️'}
      </button>

      <div className="login-form-section">
        <div className="login-form-wrapper">
          
          {/* BOTÓN VOLVER INTEGRADO AL CONTENIDO */}
          <Button 
            variant="link" 
            className="text-muted text-decoration-none p-0 mb-4 fw-bold d-flex align-items-center gap-2 btn-volver" 
            onClick={() => navigate('/')}
          >
            &larr; Volver al inicio
          </Button>

          <div className="login-header">
            <img
              src={logoClinica}
              alt="Logo Clínica"
              className="login-logo"
              onError={(e) => { e.target.style.display = 'none' }}
            />
            <h2>Iniciar sesión</h2>
          </div>

          {error && <Alert variant="danger" className="small rounded-3">{error}</Alert>}

          <Form onSubmit={handleLogin}>
            <Form.Group className="mb-4">
              <Form.Label className="custom-label">Correo Electrónico</Form.Label>
              <div className="input-group-custom">
                <span className="input-icon">📧</span>
                <Form.Control
                  type="email"
                  className="custom-input"
                  placeholder="ejemplo@correo.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label className="custom-label">Contraseña</Form.Label>
              <div className="input-group-custom">
                <span className="input-icon">🔒</span>
                <Form.Control
                  type="password"
                  className="custom-input"
                  placeholder="Ingresa tu contraseña"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </Form.Group>

            <div className="text-end mb-4">
              <a 
                href="#" 
                className="forgot-password" 
                onClick={(e) => {
                  e.preventDefault();
                  navigate('/recuperar-password');
                }}
              >
                ¿Olvidaste tu contraseña?
              </a>
            </div>

            <Button
              type="submit"
              className="w-100 btn-ingresar mb-4"
              disabled={loading}
            >
              {loading ? <Spinner animation="border" size="sm" /> : 'Ingresar'}
            </Button>
          </Form>
        </div>
      </div>

      <div className="login-welcome-section">
        <div className="welcome-content">
          <h1>Bienvenido a la Clínica Socio Jurídica</h1>
          <p>
            Aquí es donde te ayudamos en lo social y jurídico y más cosas. Ingresa tus datos para acceder a tu panel de gestión.
          </p>
        </div>
      </div>

    </div>
  );
};

export default Login;