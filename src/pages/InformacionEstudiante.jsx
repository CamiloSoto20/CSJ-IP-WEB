import { useState, useEffect } from 'react';
import { Container, Card, Button, Badge, Spinner, Row, Col, Modal, Form } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';

const InformacionEstudiante = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [noticias, setNoticias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const [formData, setFormData] = useState({
    titulo: '', descripcion_corta: '', fuente: '', autor: ''
  });

  const fetchNoticias = async () => {
    try {
      const { data, error } = await supabase
        .from('information')
        .select('*')
        .in('categoria', ['IMPORTANTE', 'Salida', 'Recordatorio', 'Aporte Estudiante'])
        .order('fecha_publicacion', { ascending: false });
        
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { error } = await supabase.from('information').insert([{
        titulo: formData.titulo,
        descripcion_corta: formData.descripcion_corta,
        fuente: formData.fuente,
        autor_nombre: formData.autor,
        categoria: 'Aporte Estudiante',
        author_id: user?.id || null
      }]);

      if (error) throw error;

      alert('Información subida exitosamente');
      setShowModal(false);
      setFormData({ titulo: '', descripcion_corta: '', fuente: '', autor: '' });
      fetchNoticias();
    } catch (error) {
      alert('Error al guardar: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  const getEstilosAviso = (categoria) => {
    switch(categoria) {
      case 'IMPORTANTE': return { bg: 'danger', border: '#dc3545', icon: '🔴', text: 'light' };
      case 'Salida': return { bg: 'warning', border: '#ffc107', icon: '🟡', text: 'dark' };
      case 'Recordatorio': return { bg: 'info', border: '#0dcaf0', icon: '🔵', text: 'dark' };
      case 'Aporte Estudiante': return { bg: 'success', border: '#198754', icon: '📝', text: 'light' };
      default: return { bg: 'primary', border: 'var(--border-color)', icon: '📰', text: 'light' };
    }
  };

  return (
    <div style={{ backgroundColor: '#f4f7f5', minHeight: '100vh', padding: '2rem 0' }}>
      <Container>
        <Button variant="link" className="text-decoration-none mb-3 px-0 fw-bold" style={{ color: 'var(--color-principal)' }} onClick={() => navigate('/panel-estudiante')}>
          &larr; Volver al Panel
        </Button>

        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h2 style={{ color: 'var(--color-principal)', fontWeight: '800' }}>Muro de Avisos e Información</h2>
            <p className="text-muted">Comunicaciones oficiales y aportes</p>
          </div>
          <Button variant="outline-success" onClick={() => setShowModal(true)} className="fw-bold px-4 py-2 rounded-pill shadow-sm bg-white">
            + Subir Información
          </Button>
        </div>

        {loading ? (
          <div className="text-center py-5"><Spinner animation="border" style={{ color: 'var(--color-principal)' }} /></div>
        ) : (
          <Row className="g-4">
            {noticias.length === 0 ? (
              <Col><p className="text-muted text-center py-5 bg-white rounded shadow-sm">No hay avisos recientes.</p></Col>
            ) : noticias.map(item => {
              const estilos = getEstilosAviso(item.categoria);
              return (
                <Col md={6} lg={4} key={item.id}>
                  <Card className="border-0 shadow-sm h-100" style={{ borderRadius: '15px', borderTop: `4px solid ${estilos.border}` }}>
                    <Card.Body className="d-flex flex-column">
                      <div className="d-flex justify-content-between align-items-start mb-3">
                        <Badge bg={estilos.bg} text={estilos.text} className="px-3 py-2 rounded-pill text-uppercase fw-bold">
                          {estilos.icon} {item.categoria}
                        </Badge>
                        <small className="text-muted fw-bold">
                          {new Date(item.fecha_publicacion || item.created_at).toLocaleDateString('es-CL')}
                        </small>
                      </div>
                      
                      <h5 className="fw-bolder text-dark mb-3">{item.titulo}</h5>
                      <p className="text-secondary mb-4" style={{ fontSize: '0.95rem' }}>{item.descripcion_corta}</p>
                      
                      {item.categoria === 'Aporte Estudiante' && (
                        <div className="mt-auto pt-3 border-top">
                          <p className="small text-muted mb-1"><span className="fw-bold">Autor:</span> {item.autor_nombre || 'No especificado'}</p>
                          <p className="small text-muted mb-0"><span className="fw-bold">Fuente:</span> {item.fuente || 'Propia'}</p>
                        </div>
                      )}
                    </Card.Body>
                  </Card>
                </Col>
              );
            })}
          </Row>
        )}
      </Container>

      {/* Modal Subir Información */}
      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title className="fw-bold text-success">📝 Subir Información / Noticia</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label className="small fw-bold">Nombre de la Información o Noticia</Form.Label>
              <Form.Control name="titulo" value={formData.titulo} onChange={handleChange} required placeholder="Título..." />
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label className="small fw-bold">Descripción</Form.Label>
              <Form.Control as="textarea" rows={4} name="descripcion_corta" value={formData.descripcion_corta} onChange={handleChange} required placeholder="Desarrollo de la información..." />
            </Form.Group>

            <Row className="mb-4">
              <Col md={6}>
                <Form.Group>
                  <Form.Label className="small fw-bold">Fuente</Form.Label>
                  <Form.Control name="fuente" value={formData.fuente} onChange={handleChange} required placeholder="Ej: Ley Chile, Libro..." />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label className="small fw-bold">Autor</Form.Label>
                  <Form.Control name="autor" value={formData.autor} onChange={handleChange} required placeholder="Autor de la información" />
                </Form.Group>
              </Col>
            </Row>

            <div className="d-flex justify-content-end gap-2">
              <Button variant="outline-secondary" onClick={() => setShowModal(false)} disabled={saving}>Cancelar</Button>
              <Button type="submit" variant="success" disabled={saving}>
                {saving ? <Spinner animation="border" size="sm" /> : 'Publicar Información'}
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default InformacionEstudiante;