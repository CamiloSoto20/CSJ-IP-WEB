import { useState } from 'react';
import { Container, Card, Form, Button, Spinner, Alert } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import logoCSJ from '../../assets/LOGO_CSJ.jpg'; // Asegúrate de tener el logo en la carpeta assets

const RecuperarPassword = () => {
  const [correo, setCorreo] = useState('');
  const [loading, setLoading] = useState(false);
  const [mensaje, setMensaje] = useState(null);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMensaje(null);

    try {
      const { error } = await supabase
        .from('solicitudes_password')
        .insert([{ correo: correo.trim() }]);

      if (error) throw error;

      setMensaje({
        tipo: 'success',
        texto: 'Solicitud enviada. Soporte TI revisará tu caso y se pondrá en contacto contigo.'
      });
      setCorreo('');
    } catch (error) {
      setMensaje({
        tipo: 'danger',
        texto: 'Hubo un error al enviar la solicitud. Intenta nuevamente.'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="d-flex align-items-center justify-content-center vh-100" style={{ backgroundColor: '#f4f7f5' }}>
      <Container>
        <div className="row justify-content-center">
          <div className="col-12 col-md-8 col-lg-5">
            <Card className="shadow-lg border-0 rounded-4 p-4">
              <div className="text-center mb-4">
                <img src={logoCSJ} alt="Logo Clínica" style={{ maxWidth: '80px', marginBottom: '1rem' }} />
                <h4 className="fw-bold" style={{ color: 'var(--color-principal, #006A38)' }}>Recuperar Contraseña</h4>
                <p className="text-muted small">Ingresa tu correo institucional y enviaremos una solicitud de restablecimiento a Soporte TI.</p>
              </div>

              {mensaje && (
                <Alert variant={mensaje.tipo} className="small text-center fw-bold">
                  {mensaje.texto}
                </Alert>
              )}

              <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-4">
                  <Form.Label className="small fw-bold">Correo Electrónico</Form.Label>
                  <Form.Control 
                    type="email" 
                    placeholder="ejemplo@csj.cl" 
                    value={correo} 
                    onChange={(e) => setCorreo(e.target.value)} 
                    required 
                  />
                </Form.Group>

                <Button 
                  type="submit" 
                  className="w-100 fw-bold py-2 mb-3" 
                  style={{ backgroundColor: 'var(--color-principal, #006A38)', border: 'none' }} 
                  disabled={loading}
                >
                  {loading ? <Spinner size="sm" /> : 'Enviar Solicitud a Soporte'}
                </Button>

                <Button 
                  variant="link" 
                  className="w-100 text-decoration-none text-muted small" 
                  onClick={() => navigate('/login')}
                >
                  Volver al inicio de sesión
                </Button>
              </Form>
            </Card>
          </div>
        </div>
      </Container>
    </div>
  );
};

export default RecuperarPassword;