import { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Badge, Modal, Form, Spinner, Table } from 'react-bootstrap';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';

const Informacion = () => {
  const { user } = useAuth();
  const [noticias, setNoticias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // Modales
  const [showNoticiaModal, setShowNoticiaModal] = useState(false);
  const [showAvisoModal, setShowAvisoModal] = useState(false);

  // Estados de formularios
  const [formDataAviso, setFormDataAviso] = useState({
    categoria: 'Recordatorio', descripcion_corta: ''
  });

  const [formDataNoticia, setFormDataNoticia] = useState({
    titulo: '', descripcion_corta: '', fuente: '', autor: ''
  });

  useEffect(() => {
    fetchInformacion();
  }, []);

  const fetchInformacion = async () => {
    try {
      const { data, error } = await supabase
        .from('information')
        .select('*')
        .order('fecha_publicacion', { ascending: false });
      if (error) throw error;
      setNoticias(data || []);
    } catch (error) {
      console.error("Error cargando informacion:", error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAvisoChange = (e) => setFormDataAviso({ ...formDataAviso, [e.target.name]: e.target.value });
  const handleNoticiaChange = (e) => setFormDataNoticia({ ...formDataNoticia, [e.target.name]: e.target.value });

  // Crear Aviso Privado (Mayúsculas)
  const handleSubmitAviso = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { error } = await supabase.from('information').insert([{
        titulo: formDataAviso.categoria.toUpperCase(),
        categoria: formDataAviso.categoria,
        descripcion_corta: formDataAviso.descripcion_corta,
        author_id: user?.id
      }]);

      if (error) throw error;
      alert('Aviso interno publicado exitosamente');
      setShowAvisoModal(false);
      setFormDataAviso({ categoria: 'Recordatorio', descripcion_corta: '' });
      fetchInformacion();
    } catch (error) {
      alert("Error al publicar aviso.");
    } finally {
      setSaving(false);
    }
  };

  // Crear Noticia Pública (Formato Estudiante)
  const handleSubmitNoticia = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { error } = await supabase.from('information').insert([{
        titulo: formDataNoticia.titulo,
        descripcion_corta: formDataNoticia.descripcion_corta,
        fuente: formDataNoticia.fuente,
        autor_nombre: formDataNoticia.autor,
        categoria: 'Noticia',
        author_id: user?.id
      }]);

      if (error) throw error;
      alert('Noticia publicada exitosamente');
      setShowNoticiaModal(false);
      setFormDataNoticia({ titulo: '', descripcion_corta: '', fuente: '', autor: '' });
      fetchInformacion();
    } catch (error) {
      alert("Error al publicar noticia.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if(window.confirm('¿Eliminar esta publicación?')) {
      try {
        await supabase.from('information').delete().eq('id', id);
        fetchInformacion();
      } catch(e) {
        alert("Error al eliminar");
      }
    }
  };

  const getEstilosAviso = (categoria) => {
    switch(categoria) {
      case 'IMPORTANTE': return { bg: 'danger', icon: '🔴' };
      case 'Salida': return { bg: 'warning', text: 'dark', icon: '🟡' };
      case 'Recordatorio': return { bg: 'info', text: 'dark', icon: '🔵' };
      case 'Aporte Estudiante': return { bg: 'success', icon: '📝' };
      default: return { bg: 'primary', icon: '📰' };
    }
  };

  return (
    <Container fluid className="py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 style={{ color: 'var(--color-principal)', fontWeight: '800' }}>Centro de Comunicación</h2>
          <p className="text-muted">Gestión de Avisos Internos y Noticias Públicas</p>
        </div>
        <div className="d-flex gap-2">
          <Button variant="outline-danger" className="fw-bold shadow-sm" onClick={() => setShowAvisoModal(true)}>
            📢 Enviar Aviso Privado
          </Button>
          <Button style={{ backgroundColor: 'var(--color-principal)', border: 'none' }} className="fw-bold px-4 shadow-sm" onClick={() => setShowNoticiaModal(true)}>
            + Publicar Noticia Pública
          </Button>
        </div>
      </div>

      <Card className="border-0 shadow-sm rounded-4 overflow-hidden">
        {loading ? (
          <div className="text-center py-5"><Spinner animation="border" variant="success" /></div>
        ) : (
          <Table responsive hover className="align-middle mb-0">
            <thead className="bg-light text-muted small text-uppercase">
              <tr>
                <th className="px-4 py-3">Fecha</th>
                <th className="py-3">Categoría</th>
                <th className="py-3">Título y Contenido</th>
                <th className="py-3">Fuente / Autor</th>
                <th className="px-4 py-3 text-end">Acción</th>
              </tr>
            </thead>
            <tbody>
              {noticias.length === 0 ? (
                <tr><td colSpan="5" className="text-center py-5 text-muted">No hay publicaciones.</td></tr>
              ) : (
                noticias.map(item => {
                  const estilos = getEstilosAviso(item.categoria);
                  return (
                    <tr key={item.id}>
                      <td className="px-4 text-muted small">{new Date(item.fecha_publicacion || item.created_at).toLocaleDateString('es-CL')}</td>
                      <td>
                        <Badge bg={estilos.bg} text={estilos.text || 'light'} className="py-2 px-3 text-uppercase fw-bold rounded-pill">
                          {estilos.icon} {item.categoria}
                        </Badge>
                      </td>
                      <td>
                        <span className="fw-bold d-block text-dark">{item.titulo}</span>
                        <small className="text-muted d-block text-truncate" style={{ maxWidth: '300px' }}>{item.descripcion_corta}</small>
                      </td>
                      <td>
                        <span className="small d-block text-muted">A: {item.autor_nombre || '-'}</span>
                        <span className="small d-block text-muted">F: {item.fuente || '-'}</span>
                      </td>
                      <td className="px-4 text-end">
                        <Button variant="outline-danger" size="sm" onClick={() => handleDelete(item.id)}>Eliminar</Button>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </Table>
        )}
      </Card>

      {/* Modal Noticia Pública (Formato Estudiante) */}
      <Modal show={showNoticiaModal} onHide={() => setShowNoticiaModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title className="fw-bold text-success">📝 Subir Información / Noticia</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSubmitNoticia}>
            <Form.Group className="mb-3">
              <Form.Label className="small fw-bold">Nombre de la Información o Noticia</Form.Label>
              <Form.Control name="titulo" value={formDataNoticia.titulo} onChange={handleNoticiaChange} required placeholder="Título..." />
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label className="small fw-bold">Descripción</Form.Label>
              <Form.Control as="textarea" rows={4} name="descripcion_corta" value={formDataNoticia.descripcion_corta} onChange={handleNoticiaChange} required placeholder="Desarrollo de la información..." />
            </Form.Group>

            <Row className="mb-4">
              <Col md={6}>
                <Form.Group>
                  <Form.Label className="small fw-bold">Fuente</Form.Label>
                  <Form.Control name="fuente" value={formDataNoticia.fuente} onChange={handleNoticiaChange} required placeholder="Ej: Ley Chile, Libro..." />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label className="small fw-bold">Autor</Form.Label>
                  <Form.Control name="autor" value={formDataNoticia.autor} onChange={handleNoticiaChange} required placeholder="Autor de la información" />
                </Form.Group>
              </Col>
            </Row>

            <div className="d-flex justify-content-end gap-2">
              <Button variant="outline-secondary" onClick={() => setShowNoticiaModal(false)} disabled={saving}>Cancelar</Button>
              <Button type="submit" variant="success" disabled={saving}>
                {saving ? <Spinner animation="border" size="sm" /> : 'Publicar Información'}
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>

      {/* Modal Aviso Privado */}
      <Modal show={showAvisoModal} onHide={() => setShowAvisoModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title className="fw-bold text-danger">📢 Nuevo Aviso Estudiantes</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSubmitAviso}>
            <Form.Group className="mb-3">
              <Form.Label className="small fw-bold">Categoría de Urgencia</Form.Label>
              <Form.Select name="categoria" value={formDataAviso.categoria} onChange={handleAvisoChange}>
                <option value="Recordatorio">Recordatorio (Azul)</option>
                <option value="Salida">Salida a Terreno (Amarillo)</option>
                <option value="IMPORTANTE">IMPORTANTE (Rojo)</option>
              </Form.Select>
            </Form.Group>

            <Form.Group className="mb-4">
              <Form.Label className="small fw-bold">Detalle del Aviso</Form.Label>
              <Form.Control as="textarea" rows={4} name="descripcion_corta" value={formDataAviso.descripcion_corta} onChange={handleAvisoChange} required placeholder="Escriba las instrucciones o detalles aquí..." />
            </Form.Group>

            <div className="d-flex justify-content-end gap-2">
              <Button variant="outline-secondary" onClick={() => setShowAvisoModal(false)} disabled={saving}>Cancelar</Button>
              <Button type="submit" variant="danger" disabled={saving}>
                {saving ? <Spinner animation="border" size="sm" /> : 'Enviar Aviso a Estudiantes'}
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>

    </Container>
  );
};

export default Informacion;