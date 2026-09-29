import { useState, useEffect } from 'react';
import { Container, Card, Button, Badge, Modal, Form, Spinner, Row, Col } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

const CharlasEstudiante = () => {
  const navigate = useNavigate();
  const [charlas, setCharlas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    titulo: '', fecha: '', hora: '', cupos: 30, descripcion: ''
  });

  const fetchCharlas = async () => {
    try {
      const { data, error } = await supabase
        .from('talks')
        .select('*')
        .order('fecha', { ascending: true });
      if (error) throw error;
      setCharlas(data || []);
    } catch (error) {
      console.error("Error al cargar charlas:", error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCharlas();
  }, []);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubirCharla = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { error } = await supabase.from('talks').insert([formData]);
      if (error) throw error;
      
      alert('Charla propuesta/subida exitosamente.');
      setShowModal(false);
      setFormData({ titulo: '', fecha: '', hora: '', cupos: 30, descripcion: '' });
      fetchCharlas();
    } catch (error) {
      alert('Error al subir charla: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ backgroundColor: '#f4f7f5', minHeight: '100vh', padding: '2rem 0' }}>
      <Container>
        <Button variant="link" className="text-decoration-none mb-3 px-0 fw-bold" style={{ color: 'var(--color-principal)' }} onClick={() => navigate('/panel-estudiante')}>
          &larr; Volver al Panel
        </Button>

        <div className="d-flex justify-content-between align-items-center mb-4">
          <h2 style={{ color: 'var(--color-principal)', fontWeight: '800' }}>Charlas y Talleres</h2>
          <Button style={{ backgroundColor: 'var(--color-secundario)', border: 'none', fontWeight: 'bold' }} onClick={() => setShowModal(true)}>
            + Subir Charla
          </Button>
        </div>

        {loading ? (
          <div className="text-center py-5"><Spinner animation="border" style={{ color: 'var(--color-principal)' }} /></div>
        ) : (
          <Row className="g-4">
            {charlas.length === 0 ? <p className="text-muted">No hay charlas registradas.</p> : charlas.map(charla => (
              <Col md={6} lg={4} key={charla.id}>
                <Card className="border-0 shadow-sm h-100" style={{ borderRadius: '15px' }}>
                  <Card.Body>
                    <Badge bg="success" className="mb-2">Disponible</Badge>
                    <h5 className="fw-bold">{charla.titulo}</h5>
                    <p className="text-muted small mb-3">{charla.descripcion}</p>
                    <div className="d-flex justify-content-between text-muted small fw-bold">
                      <span>📅 {charla.fecha}</span>
                      <span>⏰ {charla.hora}</span>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        )}

        {/* Modal Subir Charla */}
        <Modal show={showModal} onHide={() => setShowModal(false)} centered>
          <Modal.Header closeButton>
            <Modal.Title className="fw-bold" style={{ color: 'var(--color-principal)' }}>Proponer Nueva Charla</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form onSubmit={handleSubirCharla}>
              <Form.Group className="mb-3">
                <Form.Label className="small fw-bold">Título de la Charla</Form.Label>
                <Form.Control name="titulo" value={formData.titulo} onChange={handleChange} required />
              </Form.Group>
              <Row className="mb-3">
                <Col>
                  <Form.Label className="small fw-bold">Fecha</Form.Label>
                  <Form.Control type="date" name="fecha" value={formData.fecha} onChange={handleChange} required />
                </Col>
                <Col>
                  <Form.Label className="small fw-bold">Hora</Form.Label>
                  <Form.Control type="time" name="hora" value={formData.hora} onChange={handleChange} required />
                </Col>
              </Row>
              <Form.Group className="mb-4">
                <Form.Label className="small fw-bold">Descripción</Form.Label>
                <Form.Control as="textarea" rows={3} name="descripcion" value={formData.descripcion} onChange={handleChange} required />
              </Form.Group>
              <Button type="submit" className="w-100 fw-bold" style={{ backgroundColor: 'var(--color-principal)', border: 'none' }} disabled={saving}>
                {saving ? <Spinner size="sm" /> : 'Guardar Charla'}
              </Button>
            </Form>
          </Modal.Body>
        </Modal>
      </Container>
    </div>
  );
};

export default CharlasEstudiante;