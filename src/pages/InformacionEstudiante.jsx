import { useState, useEffect } from 'react';
import { Container, Card, Button, Badge, Modal, Form, Spinner, Row, Col } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

const InformacionEstudiante = () => {
  const navigate = useNavigate();
  const [noticias, setNoticias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    titulo: '', categoria: 'Noticia', descripcion_corta: '', contenido_completo: ''
  });

  const fetchNoticias = async () => {
    try {
      const { data, error } = await supabase
        .from('information')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      setNoticias(data || []);
    } catch (error) {
      console.error("Error al cargar información:", error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNoticias();
  }, []);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubirInfo = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { error } = await supabase.from('information').insert([formData]);
      if (error) throw error;
      
      alert('Información subida exitosamente.');
      setShowModal(false);
      setFormData({ titulo: '', categoria: 'Noticia', descripcion_corta: '', contenido_completo: '' });
      fetchNoticias();
    } catch (error) {
      alert('Error al subir información: ' + error.message);
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
          <h2 style={{ color: 'var(--color-principal)', fontWeight: '800' }}>Centro de Información</h2>
          <Button style={{ backgroundColor: 'var(--color-secundario)', border: 'none', fontWeight: 'bold' }} onClick={() => setShowModal(true)}>
            + Subir Información
          </Button>
        </div>

        {loading ? (
          <div className="text-center py-5"><Spinner animation="border" style={{ color: 'var(--color-principal)' }} /></div>
        ) : (
          <Row className="g-4">
            {noticias.length === 0 ? <p className="text-muted">No hay publicaciones recientes.</p> : noticias.map(item => (
              <Col md={6} key={item.id}>
                <Card className="border-0 shadow-sm h-100" style={{ borderRadius: '15px' }}>
                  <Card.Body>
                    <Badge bg={item.categoria === 'Noticia' ? 'primary' : 'warning'} text="dark" className="mb-2">
                      {item.categoria}
                    </Badge>
                    <h5 className="fw-bold">{item.titulo}</h5>
                    <p className="text-muted mb-0">{item.descripcion_corta}</p>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        )}

        {/* Modal Subir Información */}
        <Modal show={showModal} onHide={() => setShowModal(false)} centered>
          <Modal.Header closeButton>
            <Modal.Title className="fw-bold" style={{ color: 'var(--color-principal)' }}>Publicar Información</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form onSubmit={handleSubirInfo}>
              <Form.Group className="mb-3">
                <Form.Label className="small fw-bold">Título</Form.Label>
                <Form.Control name="titulo" value={formData.titulo} onChange={handleChange} required />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label className="small fw-bold">Categoría</Form.Label>
                <Form.Select name="categoria" value={formData.categoria} onChange={handleChange}>
                  <option value="Noticia">Noticia / Aviso</option>
                  <option value="Material Juridico">Material Jurídico</option>
                  <option value="Guia">Guía de Práctica</option>
                </Form.Select>
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label className="small fw-bold">Descripción Corta</Form.Label>
                <Form.Control name="descripcion_corta" value={formData.descripcion_corta} onChange={handleChange} required />
              </Form.Group>
              <Form.Group className="mb-4">
                <Form.Label className="small fw-bold">Contenido Completo</Form.Label>
                <Form.Control as="textarea" rows={4} name="contenido_completo" value={formData.contenido_completo} onChange={handleChange} />
              </Form.Group>
              <Button type="submit" className="w-100 fw-bold" style={{ backgroundColor: 'var(--color-principal)', border: 'none' }} disabled={saving}>
                {saving ? <Spinner size="sm" /> : 'Publicar'}
              </Button>
            </Form>
          </Modal.Body>
        </Modal>
      </Container>
    </div>
  );
};

export default InformacionEstudiante;