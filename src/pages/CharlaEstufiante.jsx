import { useState, useEffect } from 'react';
import { Container, Card, Button, Modal, Form, Row, Col, Spinner, Badge } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';

const CharlasEstudiante = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [charlas, setCharlas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showModal, setShowModal] = useState(false);

  // Mapeado a los nombres reales de tu BD
  const [formData, setFormData] = useState({
    titulo: '', descripcion: '', fecha: '', hora: '', ubicacion: ''
  });
  const [afiche, setAfiche] = useState(null);

  useEffect(() => {
    fetchCharlas();
  }, []);

  const fetchCharlas = async () => {
    try {
      const { data, error } = await supabase
        .from('talks')
        .select('*')
        .order('fecha', { ascending: false });
      if (error) throw error;
      setCharlas(data || []);
    } catch (error) {
      console.error("Error al cargar charlas:", error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    
    try {
      let aficheUrl = null;

      // Subir Afiche
      if (afiche) {
        const fileExt = afiche.name.split('.').pop();
        const fileName = `afiche_${Date.now()}.${fileExt}`;
        const { error: errAfiche } = await supabase.storage.from('charlas').upload(fileName, afiche);
        if (!errAfiche) {
          aficheUrl = supabase.storage.from('charlas').getPublicUrl(fileName).data.publicUrl;
        }
      }

      // Insertar calzando con las columnas exactas de Supabase
      const { error } = await supabase.from('talks').insert([{
        titulo: formData.titulo,
        descripcion: formData.descripcion,
        fecha: formData.fecha,
        hora: formData.hora,
        ubicacion: formData.ubicacion,
        imagen_url: aficheUrl,
        cupos_totales: 30, // Agregado para que no de error
        cupos_disponibles: 30,
        estado: 'Disponible'
      }]);

      if (error) throw error;

      alert('Charla registrada exitosamente.');
      setShowModal(false);
      setFormData({ titulo: '', descripcion: '', fecha: '', hora: '', ubicacion: '' });
      setAfiche(null);
      fetchCharlas();
    } catch (error) {
      alert('Error al guardar la charla: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Container className="py-4">
      <Button variant="link" className="text-decoration-none mb-3 px-0 fw-bold" style={{ color: 'var(--color-principal)' }} onClick={() => navigate('/panel-estudiante')}>
        &larr; Volver al Panel
      </Button>

      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 style={{ color: 'var(--color-principal)', fontWeight: '800' }}>Charlas y Capacitaciones</h2>
          <p className="text-muted">Espacio de formación y registro de actividades</p>
        </div>
        <Button style={{ backgroundColor: 'var(--color-principal)', border: 'none' }} onClick={() => setShowModal(true)} className="fw-bold px-4 py-2 rounded-pill shadow-sm">
          + Subir Charla
        </Button>
      </div>

      {loading ? (
        <div className="text-center py-5"><Spinner animation="border" style={{ color: 'var(--color-principal)' }} /></div>
      ) : (
        <Row className="g-4">
          {charlas.length === 0 ? (
            <Col><p className="text-muted text-center py-5 bg-white rounded shadow-sm">No hay charlas registradas.</p></Col>
          ) : charlas.map(charla => (
            <Col md={6} lg={4} key={charla.id}>
              <Card className="border-0 shadow-sm h-100 rounded-4 overflow-hidden">
                {charla.imagen_url && (
                  <div style={{ height: '200px', backgroundImage: `url(${charla.imagen_url})`, backgroundSize: 'cover', backgroundPosition: 'center' }} />
                )}
                <Card.Body className="d-flex flex-column p-4">
                  <Badge bg="success" className="mb-2 align-self-start">{charla.fecha} | {charla.hora}</Badge>
                  <h5 className="fw-bold mb-2">{charla.titulo}</h5>
                  <p className="small text-muted mb-3"><span className="fw-bold text-dark">📍 Lugar:</span> {charla.ubicacion}</p>
                  <p className="text-secondary small mb-4 flex-grow-1">{charla.descripcion}</p>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      )}

      {/* Modal Subir Charla */}
      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg" centered>
        <Modal.Header closeButton>
          <Modal.Title className="fw-bold" style={{ color: 'var(--color-principal)' }}>Registrar Nueva Charla</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label className="small fw-bold">Nombre de la Charla</Form.Label>
              <Form.Control name="titulo" value={formData.titulo} onChange={handleChange} required placeholder="Ej: Capacitación en Derecho de Familia..." />
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label className="small fw-bold">Descripción</Form.Label>
              <Form.Control as="textarea" rows={3} name="descripcion" value={formData.descripcion} onChange={handleChange} required placeholder="Resumen de los temas tratados..." />
            </Form.Group>

            <Row className="mb-3">
              <Col md={4}>
                <Form.Group>
                  <Form.Label className="small fw-bold">Fecha</Form.Label>
                  <Form.Control type="date" name="fecha" value={formData.fecha} onChange={handleChange} required />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group>
                  <Form.Label className="small fw-bold">Hora</Form.Label>
                  <Form.Control type="time" name="hora" value={formData.hora} onChange={handleChange} required />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group>
                  <Form.Label className="small fw-bold">Lugar / Ubicación</Form.Label>
                  <Form.Control name="ubicacion" value={formData.ubicacion} onChange={handleChange} required placeholder="Ej: Sala 302, Teams..." />
                </Form.Group>
              </Col>
            </Row>

            <Row className="mb-4">
              <Col md={12}>
                <Form.Group>
                  <Form.Label className="small fw-bold">Afiche (Imagen)</Form.Label>
                  <Form.Control type="file" accept="image/*" onChange={(e) => setAfiche(e.target.files[0])} />
                </Form.Group>
              </Col>
            </Row>

            <div className="d-flex justify-content-end gap-2">
              <Button variant="outline-secondary" onClick={() => setShowModal(false)} disabled={saving}>Cancelar</Button>
              <Button type="submit" style={{ backgroundColor: 'var(--color-principal)', border: 'none' }} disabled={saving}>
                {saving ? <Spinner animation="border" size="sm" /> : 'Subir Charla'}
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>
    </Container>
  );
};

export default CharlasEstudiante;