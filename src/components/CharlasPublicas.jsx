import { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Modal, Form, Spinner, Alert, Badge } from 'react-bootstrap';
import { supabase } from '../lib/supabase';

const CharlasPublicas = () => {
  const [charlas, setCharlas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [charlaSeleccionada, setCharlaSeleccionada] = useState(null);
  
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
  if (charlas.length === 0) return null; 

  return (
    <section id="charlas" className="py-5 bg-white">
      <Container className="py-4">
        <div className="text-center mb-5">
          <h2 className="section-title">Charlas y Talleres Comunitarios</h2>
          <p className="text-muted lead">Inscríbete en nuestras próximas actividades formativas gratuitas</p>
        </div>

        <Row className="g-4">
          {charlas.map(charla => (
            <Col md={6} lg={4} key={charla.id}>
              <Card className="h-100 card-modern hover-lift border-1" style={{ borderColor: 'rgba(0,0,0,0.05)' }}>
                {charla.afiche_url && (
                   <Card.Img variant="top" src={charla.afiche_url} style={{ height: '200px', objectFit: 'cover' }} />
                )}
                <Card.Body className="d-flex flex-column p-4">
                  <div className="d-flex justify-content-between mb-3">
                    <Badge bg="success" className="px-3 py-2 rounded-pill bg-opacity-10 text-success border border-success fw-bold">Inscripciones Abiertas</Badge>
                  </div>
                  <Card.Title className="fw-bold mb-3" style={{ color: 'var(--color-principal)', fontSize: '1.25rem' }}>{charla.titulo || charla.nombre}</Card.Title>
                  <Card.Text className="text-secondary small flex-grow-1" style={{ lineHeight: '1.6' }}>{charla.descripcion}</Card.Text>
                  
                  <div className="bg-light rounded-3 p-3 mb-4 small text-dark fw-medium">
                    <div className="mb-2">📅 <strong>Fecha:</strong> {new Date(charla.fecha).toLocaleDateString('es-CL')}</div>
                    <div className="mb-2">⏰ <strong>Hora:</strong> {charla.hora.substring(0, 5)} hrs</div>
                    <div className="mb-0">📍 <strong>Lugar:</strong> {charla.lugar || charla.ubicacion}</div>
                  </div>
                  
                  <Button 
                    className="btn-custom w-100 text-white"
                    style={{ backgroundColor: 'var(--color-principal)', border: 'none' }} 
                    onClick={() => handleOpen(charla)}
                  >
                    Inscribirme
                  </Button>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>

        <Modal show={showModal} onHide={handleClose} centered>
          <Modal.Header closeButton className="border-0 pb-0">
            <Modal.Title style={{ color: 'var(--color-principal)', fontWeight: '800' }}>
              Confirmar Inscripción
            </Modal.Title>
          </Modal.Header>
          <Modal.Body className="p-4">
            {charlaSeleccionada && (
              <div className="mb-4 p-3 rounded-4" style={{ backgroundColor: 'rgba(120, 190, 32, 0.1)' }}>
                <h6 className="fw-bold mb-2 text-dark">{charlaSeleccionada.titulo || charlaSeleccionada.nombre}</h6>
                <small className="text-secondary fw-bold">📅 {new Date(charlaSeleccionada.fecha).toLocaleDateString('es-CL')} a las {charlaSeleccionada.hora.substring(0, 5)} hrs</small>
              </div>
            )}

            {mensaje.texto && <Alert variant={mensaje.tipo} className="rounded-3">{mensaje.texto}</Alert>}

            {!mensaje.texto || mensaje.tipo === 'danger' ? (
              <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3">
                  <Form.Label className="small fw-bold text-secondary">RUT</Form.Label>
                  <Form.Control name="rut" value={formData.rut} onChange={handleChange} placeholder="Ej: 12345678-9" required className="py-2" />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label className="small fw-bold text-secondary">Nombre completo</Form.Label>
                  <Form.Control name="nombre" value={formData.nombre} onChange={handleChange} required className="py-2" />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label className="small fw-bold text-secondary">Correo electrónico</Form.Label>
                  <Form.Control type="email" name="correo" value={formData.correo} onChange={handleChange} required className="py-2" />
                </Form.Group>
                <Form.Group className="mb-4">
                  <Form.Label className="small fw-bold text-secondary">Teléfono</Form.Label>
                  <Form.Control type="tel" name="telefono" value={formData.telefono} onChange={handleChange} required className="py-2" />
                </Form.Group>
                <Button type="submit" className="btn-custom w-100 text-white py-2 fs-6" style={{ backgroundColor: 'var(--color-principal)', border: 'none' }} disabled={enviando}>
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