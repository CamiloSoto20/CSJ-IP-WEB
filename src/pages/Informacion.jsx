import { useState, useEffect } from 'react';
import { Table, Button, Badge, Spinner, Modal, Form, Card } from 'react-bootstrap';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';

const Informacion = () => {
  const { user } = useAuth();
  const [publicaciones, setPublicaciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  
  const [formData, setFormData] = useState({ 
    titulo: '', 
    descripcion_corta: '', 
    contenido_completo: '', 
    categoria: 'Aviso (Estudiantes)' // Por defecto en aviso
  });

  const fetchPublicaciones = async () => {
    try {
      const { data, error } = await supabase
        .from('information')
        .select('*')
        .order('fecha_publicacion', { ascending: false });

      if (error) throw error;
      setPublicaciones(data || []);
    } catch (error) {
      console.error("Error:", error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPublicaciones();
  }, []);

  const handleClose = () => {
    setShowModal(false);
    setFormData({ titulo: '', descripcion_corta: '', contenido_completo: '', categoria: 'Aviso (Estudiantes)' });
  };

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { error } = await supabase.from('information').insert([{
        ...formData,
        author_id: user?.id || null // Previene error si auth demora en cargar
      }]);

      if (error) throw error;
      
      alert('Publicación creada exitosamente');
      fetchPublicaciones();
      handleClose();
    } catch (error) {
      console.error(error);
      alert('Error al guardar: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  const getCategoriaBadge = (categoria) => {
    if (categoria?.includes('Aviso')) return 'danger';
    if (categoria === 'Noticia') return 'info';
    return 'primary';
  };

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h3 className="fw-bold mb-1" style={{ color: 'var(--color-principal, #006A38)' }}>Centro de Comunicaciones</h3>
          <p className="text-muted mb-0">Gestión de avisos, noticias y artículos</p>
        </div>
        <Button 
          style={{ backgroundColor: 'var(--color-principal)', border: 'none' }} 
          onClick={() => setShowModal(true)}
          className="d-flex align-items-center gap-2"
        >
          <span>+</span> Nueva Publicación
        </Button>
      </div>

      <Card className="border-0 shadow-sm">
        <Card.Body className="p-0">
          {loading ? (
            <div className="text-center py-5">
              <Spinner animation="border" style={{ color: 'var(--color-principal)' }} />
              <p className="text-muted mt-2 mb-0">Cargando publicaciones...</p>
            </div>
          ) : (
            <Table hover responsive className="align-middle mb-0">
              <thead className="bg-light">
                <tr>
                  <th className="text-muted border-0 py-3 px-4">FECHA</th>
                  <th className="text-muted border-0 py-3">TÍTULO / RESUMEN</th>
                  <th className="text-muted border-0 py-3">CATEGORÍA</th>
                  <th className="text-muted border-0 py-3 px-4 text-end">ESTADO</th>
                </tr>
              </thead>
              <tbody>
                {publicaciones.map((pub) => (
                  <tr key={pub.id}>
                    <td className="px-4 text-secondary">
                      {new Date(pub.fecha_publicacion).toLocaleDateString('es-CL')}
                    </td>
                    <td>
                      <span className="fw-bold d-block text-dark">{pub.titulo}</span>
                      <span className="text-muted small text-truncate d-inline-block" style={{ maxWidth: '300px' }}>
                        {pub.descripcion_corta}
                      </span>
                    </td>
                    <td>
                      <Badge bg={getCategoriaBadge(pub.categoria)} className="px-2 py-1">
                        {pub.categoria || 'General'}
                      </Badge>
                    </td>
                    <td className="px-4 text-end">
                      <Badge bg="success" className="bg-opacity-25 text-success border border-success">
                        Publicado
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
          {!loading && publicaciones.length === 0 && (
            <div className="text-center text-muted py-5">
              No hay publicaciones registradas.
            </div>
          )}
        </Card.Body>
      </Card>

      <Modal show={showModal} onHide={handleClose} size="lg" centered>
        <Modal.Header closeButton>
          <Modal.Title className="fw-bold" style={{ color: 'var(--color-principal, #006A38)' }}>Crear Nueva Publicación</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSubmit}>
            <Row className="mb-3">
              <Col md={8}>
                <Form.Group>
                  <Form.Label className="small fw-bold">Título del Anuncio</Form.Label>
                  <Form.Control name="titulo" value={formData.titulo} onChange={handleChange} required placeholder="Ej: Suspensión de actividades..." />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group>
                  <Form.Label className="small fw-bold">Tipo de Publicación</Form.Label>
                  <Form.Select name="categoria" value={formData.categoria} onChange={handleChange} required>
                    <option value="Aviso (Estudiantes)">⚠️ Aviso (Estudiantes)</option>
                    <option value="Noticia">📰 Noticia General</option>
                    <option value="Artículo Legal">⚖️ Artículo Legal</option>
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-3">
              <Form.Label className="small fw-bold">Resumen / Subtítulo</Form.Label>
              <Form.Control as="textarea" rows={2} name="descripcion_corta" value={formData.descripcion_corta} onChange={handleChange} placeholder="Texto breve visible en las tarjetas principales..." required />
            </Form.Group>

            <Form.Group className="mb-4">
              <Form.Label className="small fw-bold">Contenido Completo</Form.Label>
              <Form.Control as="textarea" rows={6} name="contenido_completo" value={formData.contenido_completo} onChange={handleChange} placeholder="Detalles de la publicación..." required />
            </Form.Group>
            
            <div className="d-flex justify-content-end gap-2">
              <Button variant="outline-secondary" onClick={handleClose} disabled={saving}>Cancelar</Button>
              <Button type="submit" style={{ backgroundColor: 'var(--color-principal)', border: 'none' }} disabled={saving}>
                {saving ? <Spinner animation="border" size="sm" /> : 'Publicar Inmediatamente'}
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>
    </div>
  );
};

// Importaciones faltantes añadidas al final por limpieza visual (Col, Row de react-bootstrap)
import { Col, Row } from 'react-bootstrap';

export default Informacion;