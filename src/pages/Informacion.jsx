import { useState, useEffect } from 'react';
import { Table, Button, Badge, Spinner, Modal, Form, Card, Row, Col } from 'react-bootstrap';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';

const Informacion = () => {
  const { user } = useAuth();
  const [publicaciones, setPublicaciones] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showModalNoticia, setShowModalNoticia] = useState(false);
  const [showModalAviso, setShowModalAviso] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editId, setEditId] = useState(null); // NUEVO: Estado de edición

  const [formData, setFormData] = useState({
    titulo: '',
    descripcion_corta: '',
    contenido_completo: '',
    categoria: '',
    fuente: '',
    autor: ''
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
    setShowModalNoticia(false);
    setShowModalAviso(false);
    setEditId(null);
    setFormData({ titulo: '', descripcion_corta: '', contenido_completo: '', categoria: '', fuente: '', autor: '' });
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleChangeAviso = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: name === 'titulo' ? value.toUpperCase() : value
    });
  };

  const abrirModalNoticia = () => {
    setEditId(null);
    setFormData({ titulo: '', descripcion_corta: '', contenido_completo: '', categoria: 'Noticia', fuente: '', autor: '' });
    setShowModalNoticia(true);
  };

  const abrirModalAviso = () => {
    setEditId(null);
    setFormData({ titulo: '', descripcion_corta: '', contenido_completo: '', categoria: 'IMPORTANTE', fuente: '', autor: '' });
    setShowModalAviso(true);
  };

  // NUEVO: Función para abrir edición y extraer autor/fuente de ser necesario
  const abrirModalEditar = (pub) => {
    setEditId(pub.id);
    let extrAutor = '';
    let extrFuente = '';
    let extrContenido = pub.contenido_completo || '';

    if (pub.categoria === 'Noticia') {
      const matchAutor = pub.contenido_completo?.match(/Autor:\s*(.*)/);
      const matchFuente = pub.contenido_completo?.match(/Fuente original:\s*(.*)/);
      if (matchAutor) extrAutor = matchAutor[1];
      if (matchFuente) extrFuente = matchFuente[1];
      setShowModalNoticia(true);
    } else {
      setShowModalAviso(true);
    }

    setFormData({
      titulo: pub.titulo,
      descripcion_corta: pub.descripcion_corta,
      contenido_completo: extrContenido,
      categoria: pub.categoria,
      fuente: extrFuente,
      autor: extrAutor
    });
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Está segura de eliminar esta publicación?')) {
      try {
        const { error } = await supabase.from('information').delete().eq('id', id);
        if (error) throw error;
        fetchPublicaciones();
      } catch (error) {
        alert("Error al eliminar: " + error.message);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        titulo: formData.titulo,
        descripcion_corta: formData.descripcion_corta,
        categoria: formData.categoria,
        author_id: user?.id || null
      };

      if (formData.categoria === 'Noticia') {
        payload.contenido_completo = `Autor: ${formData.autor}\nFuente original: ${formData.fuente}`;
      } else {
        payload.contenido_completo = formData.descripcion_corta; // Avisos usan descripcion corta
      }

      if (editId) {
        const { error } = await supabase.from('information').update(payload).eq('id', editId);
        if (error) throw error;
        alert('Publicación actualizada exitosamente');
      } else {
        const { error } = await supabase.from('information').insert([payload]);
        if (error) throw error;
        alert('Publicación creada exitosamente');
      }

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
    switch (categoria) {
      case 'IMPORTANTE': return 'danger';
      case 'Salida': return 'warning';
      case 'Recordatorio': return 'info';
      case 'Noticia': return 'primary';
      case 'Artículo Legal': return 'secondary';
      default: return 'dark';
    }
  };

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h3 className="fw-bold mb-1" style={{ color: 'var(--color-principal, #006A38)' }}>Centro de Comunicaciones</h3>
          <p className="text-muted mb-0">Gestión separada de noticias públicas y avisos internos</p>
        </div>
        <div className="d-flex gap-2">
          <Button variant="outline-primary" onClick={abrirModalNoticia} className="d-flex align-items-center gap-2 fw-bold">
            📰 Subir Noticia (Pública)
          </Button>
          <Button style={{ backgroundColor: '#dc3545', border: 'none' }} onClick={abrirModalAviso} className="d-flex align-items-center gap-2 fw-bold text-white shadow-sm">
            ⚠️ Enviar Aviso (Estudiantes)
          </Button>
        </div>
      </div>

      <Card className="border-0 shadow-sm">
        <Card.Body className="p-0">
          {loading ? (
            <div className="text-center py-5">
              <Spinner animation="border" style={{ color: 'var(--color-principal)' }} />
            </div>
          ) : (
            <Table hover responsive className="align-middle mb-0">
              <thead className="bg-light">
                <tr>
                  <th className="text-muted border-0 py-3 px-4">FECHA</th>
                  <th className="text-muted border-0 py-3">TÍTULO / RESUMEN</th>
                  <th className="text-muted border-0 py-3">TIPO</th>
                  <th className="text-muted border-0 py-3 px-4 text-end">ACCIÓN</th>
                </tr>
              </thead>
              <tbody>
                {publicaciones.map((pub) => (
                  <tr key={pub.id}>
                    <td className="px-4 text-secondary">
                      {new Date(pub.fecha_publicacion).toLocaleDateString('es-CL')}
                    </td>
                    <td>
                      <span className={`d-block text-dark ${['IMPORTANTE', 'Salida', 'Recordatorio'].includes(pub.categoria) ? 'fw-bolder' : 'fw-bold'}`}>
                        {pub.titulo}
                      </span>
                      <span className="text-muted small text-truncate d-inline-block" style={{ maxWidth: '300px' }}>
                        {pub.descripcion_corta}
                      </span>
                    </td>
                    <td>
                      <Badge bg={getCategoriaBadge(pub.categoria)} text={['Salida', 'Recordatorio'].includes(pub.categoria) ? 'dark' : 'light'} className="px-2 py-1 text-uppercase">
                        {pub.categoria || 'General'}
                      </Badge>
                    </td>
                    <td className="px-4 text-end">
                      <Button variant="outline-primary" size="sm" className="me-2 fw-bold" onClick={() => abrirModalEditar(pub)}>
                        Editar
                      </Button>
                      <Button variant="outline-danger" size="sm" className="fw-bold" onClick={() => handleDelete(pub.id)}>
                        Eliminar
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </Card.Body>
      </Card>

      {/* MODAL 1: AVISOS (SOLO ESTUDIANTES) */}
      <Modal show={showModalAviso} onHide={handleClose} size="lg" centered>
        <Modal.Header closeButton className="bg-danger text-white">
          <Modal.Title className="fw-bold">{editId ? 'Editar Aviso Interno' : '⚠️ Enviar Aviso a Estudiantes'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSubmit}>
            <Row className="mb-3">
              <Col md={8}>
                <Form.Group>
                  <Form.Label className="small fw-bold text-danger">Título del Aviso (Se forzará a mayúsculas)</Form.Label>
                  <Form.Control name="titulo" value={formData.titulo} onChange={handleChangeAviso} required placeholder="EJ: SUSPENSIÓN DE ACTIVIDADES" className="fw-bold" />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group>
                  <Form.Label className="small fw-bold">Tipo de Aviso</Form.Label>
                  <Form.Select name="categoria" value={formData.categoria} onChange={handleChangeAviso} required className="fw-bold text-dark">
                    <option value="IMPORTANTE">🔴 IMPORTANTE</option>
                    <option value="Salida">🟡  Salida a Terreno</option>
                    <option value="Recordatorio">🔵 Recordatorio</option>
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-4">
              <Form.Label className="small fw-bold">Descripción del Aviso</Form.Label>
              <Form.Control as="textarea" rows={4} name="descripcion_corta" value={formData.descripcion_corta} onChange={handleChangeAviso} placeholder="Escribe aquí las instrucciones o el comunicado..." required />
            </Form.Group>

            <div className="d-flex justify-content-end gap-2">
              <Button variant="outline-secondary" onClick={handleClose} disabled={saving}>Cancelar</Button>
              <Button type="submit" variant="danger" className="fw-bold" disabled={saving}>
                {saving ? <Spinner animation="border" size="sm" /> : (editId ? 'Guardar Cambios' : 'Publicar Aviso Interno')}
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>

      {/* MODAL 2: NOTICIAS (PÁGINA PRINCIPAL) */}
      <Modal show={showModalNoticia} onHide={handleClose} size="lg" centered>
        <Modal.Header closeButton>
          <Modal.Title className="fw-bold text-success">{editId ? 'Editar Información / Noticia' : '📝 Subir Información / Noticia'}</Modal.Title>
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
                  <Form.Control name="fuente" value={formData.fuente} onChange={handleChange} placeholder="Ej: Ley Chile, Libro..." />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label className="small fw-bold">Autor</Form.Label>
                  <Form.Control name="autor" value={formData.autor} onChange={handleChange} placeholder="Autor de la información" />
                </Form.Group>
              </Col>
            </Row>

            <div className="d-flex justify-content-end gap-2">
              <Button variant="outline-secondary" onClick={handleClose} disabled={saving}>Cancelar</Button>
              <Button type="submit" variant="success" className="fw-bold" disabled={saving}>
                {saving ? <Spinner animation="border" size="sm" /> : (editId ? 'Guardar Cambios' : 'Publicar Información')}
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default Informacion;