import { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Modal, Form, Spinner, Alert, Badge } from 'react-bootstrap';
import { supabase } from '../lib/supabase';

const CharlasPublicas = () => {
  const [charlas, setCharlas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [charlaSeleccionada, setCharlaSeleccionada] = useState(null);
  
  // Estados del formulario
  const [formData, setFormData] = useState({ rut: '', nombre: '', correo: '', telefono: '' });
  const [enviando, setEnviando] = useState(false);
  const [mensaje, setMensaje] = useState({ tipo: '', texto: '' });

  useEffect(() => {
    const fetchCharlasActivas = async () => {
      try {
        const { data, error } = await supabase
          .from('talks')
          .select('*')
          .eq('estado', 'Disponible')
          .order('fecha', { ascending: true });

        if (error) throw error;
        setCharlas(data || []);
      } catch (error) {
        console.error("Error al cargar charlas:", error.message);
      } finally {
        setLoading(false);
      }
    };
    fetchCharlasActivas();
  }, []);

  const handleOpen = (charla) => {
    setCharlaSeleccionada(charla);
    setShowModal(true);
    setMensaje({ tipo: '', texto: '' });
  };

  const handleClose = () => {
    setShowModal(false);
    setCharlaSeleccionada(null);
    setFormData({ rut: '', nombre: '', correo: '', telefono: '' });
  };

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setEnviando(true);
    setMensaje({ tipo: '', texto: '' });

    try {
      const { error } = await supabase.from('talk_registrations').insert([{
        talk_id: charlaSeleccionada.id,
        ...formData
      }]);

      if (error) throw error;

      setMensaje({ tipo: 'success', texto: '¡Inscripción confirmada exitosamente!' });
      setTimeout(() => handleClose(), 3000);
    } catch (error) {
      console.error(error);
      setMensaje({ tipo: 'danger', texto: 'Ocurrió un error al intentar inscribirte.' });
    } finally {
      setEnviando(false);
    }
  };

  if (loading) return <div className="text-center py-5"><Spinner animation="border" style={{ color: 'var(--color-principal)' }} /></div>;
  if (charlas.length === 0) return null; // No mostramos la sección si no hay charlas

  return (
    <section id="charlas" className="py-5 bg-light">
      <Container>
        <div className="text-center mb-5">
          <h2 style={{ color: 'var(--color-principal)', fontWeight: 'bold' }}>Charlas y Talleres Comunitarios</h2>
          <p className="text-muted">Inscríbete en nuestras próximas actividades gratuitas</p>
        </div>

        <Row className="g-4">
          {charlas.map(charla => (
            <Col md={6} lg={4} key={charla.id}>
              <Card className="h-100 shadow-sm border-0">
                <Card.Body className="d-flex flex-column">
                  <Badge bg="success" className="align-self-start mb-2">Inscripciones Abiertas</Badge>
                  <Card.Title className="fw-bold">{charla.titulo}</Card.Title>
                  <Card.Text className="text-muted small flex-grow-1">{charla.descripcion}</Card.Text>
                  <hr className="my-2" />
                  <div className="small mb-3">
                    <div>📅 {charla.fecha} | ⏰ {charla.hora.substring(0, 5)} hrs</div>
                    <div>📍 {charla.ubicacion}</div>
                  </div>
                  <Button 
                    style={{ backgroundColor: 'var(--color-principal)', borderColor: 'var(--color-principal)' }} 
                    className="w-100"
                    onClick={() => handleOpen(charla)}
                  >
                    Inscribirme
                  </Button>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>

        {/* Modal de Inscripción */}
        <Modal show={showModal} onHide={handleClose} centered>
          <Modal.Header closeButton>
            <Modal.Title style={{ color: 'var(--color-principal)', fontWeight: 'bold' }}>
              Inscripción a Charla
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {charlaSeleccionada && (
              <div className="mb-4 p-3 rounded" style={{ backgroundColor: 'var(--color-fondo)' }}>
                <h6 className="fw-bold mb-1">{charlaSeleccionada.titulo}</h6>
                <small className="text-muted">📅 {charlaSeleccionada.fecha} a las {charlaSeleccionada.hora.substring(0, 5)} hrs</small>
              </div>
            )}

            {mensaje.texto && <Alert variant={mensaje.tipo}>{mensaje.texto}</Alert>}

            {!mensaje.texto || mensaje.tipo === 'danger' ? (
              <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3">
                  <Form.Label className="small fw-bold">RUT</Form.Label>
                  <Form.Control name="rut" value={formData.rut} onChange={handleChange} placeholder="Ej: 12345678-9" required />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label className="small fw-bold">Nombre completo</Form.Label>
                  <Form.Control name="nombre" value={formData.nombre} onChange={handleChange} required />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label className="small fw-bold">Correo electrónico</Form.Label>
                  <Form.Control type="email" name="correo" value={formData.correo} onChange={handleChange} required />
                </Form.Group>
                <Form.Group className="mb-4">
                  <Form.Label className="small fw-bold">Teléfono</Form.Label>
                  <Form.Control type="tel" name="telefono" value={formData.telefono} onChange={handleChange} required />
                </Form.Group>
                <Button type="submit" style={{ backgroundColor: 'var(--color-principal)', borderColor: 'var(--color-principal)' }} className="w-100" disabled={enviando}>
                  {enviando ? <Spinner animation="border" size="sm" /> : 'Confirmar Inscripción'}
                </Button>
              </Form>
            ) : null}
          </Modal.Body>
        </Modal>
      </Container>
    </section>
  );
};

export default CharlasPublicas;