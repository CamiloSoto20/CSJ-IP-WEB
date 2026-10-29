import { useState } from 'react';
import { Container, Card, Form, Button, Spinner, Alert } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import logoCSJ from '../../assets/LOGO_CSJ.jpg'; 

const RecuperarPassword = () => {
  const [correo, setCorreo] = useState('');
  const [loading, setLoading] = useState(false);
  const [mensaje, setMensaje] = useState(null);
  const navigate = useNavigate();

  const generarCodigo = () => {
    const caracteres = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let codigo = '';
    for (let i = 0; i < 6; i++) {
      codigo += caracteres.charAt(Math.floor(Math.random() * caracteres.length));
    }
    return codigo;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMensaje(null);

    // Limpiamos espacios y forzamos minúsculas para evitar errores tipográficos
    const emailLimpio = correo.trim().toLowerCase();

    try {
      // 1. Validar que el correo realmente exista usando la función RPC segura
      const { data: correoExiste, error: rpcError } = await supabase
        .rpc('verificar_correo_existe', { correo_buscado: emailLimpio });

      if (rpcError) throw rpcError;

      if (!correoExiste) {
        setMensaje({ tipo: 'danger', texto: 'Este correo no está registrado en la plataforma.' });
        setLoading(false);
        return;
      }

      // 2. Bloqueo de seguridad: Revisar si ya recuperó su clave en las últimas 24 horas
      const hace24Horas = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
      const { data: recientes } = await supabase
        .from('solicitudes_password')
        .select('id')
        .eq('correo', emailLimpio)
        .eq('estado', 'Aprobado')
        .gte('created_at', hace24Horas);

      if (recientes && recientes.length > 0) {
        setMensaje({ tipo: 'danger', texto: 'Ya has restablecido tu contraseña recientemente. Por seguridad, debes esperar 24 horas.' });
        setLoading(false);
        return;
      }

      // 3. Generar Código y Fecha de Expiración (5 horas)
      const codigoSecreto = generarCodigo();
      const expiraEn = new Date(Date.now() + 5 * 60 * 60 * 1000).toISOString();

      // 4. Guardar solicitud en Supabase
      const { error } = await supabase
        .from('solicitudes_password')
        .insert([{ 
          correo: emailLimpio,
          codigo: codigoSecreto,
          expira_en: expiraEn,
          estado: 'Pendiente'
        }]);

      if (error) throw error;

      setMensaje({
        tipo: 'success',
        texto: 'Código de recuperación generado con éxito. Anótalo, llévalo a Soporte TI y un agente validará tu cambio de contraseña.',
        codigo: codigoSecreto
      });
      setCorreo('');

    } catch (error) {
      setMensaje({ tipo: 'danger', texto: 'Hubo un error al procesar tu solicitud. Intenta nuevamente.' });
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
                <p className="text-muted small">Ingresa tu correo para generar un código seguro de restablecimiento.</p>
              </div>

              {mensaje && (
                <Alert variant={mensaje.tipo} className="small text-center fw-bold">
                  {mensaje.texto}
                  {mensaje.codigo && (
                    <div className="mt-3 p-3 bg-white border border-success rounded text-center">
                      <span className="d-block text-muted mb-1" style={{ fontSize: '0.8rem' }}>TU CÓDIGO TEMPORAL (Válido por 5 hrs)</span>
                      <strong className="fs-2 text-success tracking-widest" style={{ letterSpacing: '3px' }}>{mensaje.codigo}</strong>
                    </div>
                  )}
                </Alert>
              )}

              {!mensaje?.codigo && (
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
                    {loading ? <Spinner size="sm" /> : 'Generar Código de Seguridad'}
                  </Button>
                </Form>
              )}

              <Button 
                variant="link" 
                className="w-100 text-decoration-none text-muted small mt-2" 
                onClick={() => navigate('/login')}
              >
                Volver al inicio de sesión
              </Button>
            </Card>
          </div>
        </div>
      </Container>
    </div>
  );
};

export default RecuperarPassword;