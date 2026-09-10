import { useState, useEffect } from 'react';
import { Table, Button, Badge, Spinner, Modal, Form } from 'react-bootstrap';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';

const Informacion = () => {
  const { user } = useAuth();
  const [publicaciones, setPublicaciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  
  // Agregamos descripcion_corta al estado inicial
  const [formData, setFormData] = useState({ 
    titulo: '', 
    descripcion_corta: '', 
    contenido_completo: '', 
    categoria: 'Noticia' 
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
    setFormData({ titulo: '', descripcion_corta: '', contenido_completo: '', categoria: 'Noticia' });
  };

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { error } = await supabase.from('information').insert([{
        ...formData,
        author_id: user.id
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

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 style={{ color: 'var(--color-principal)', fontWeight: 'bold' }}>Centro de Información</h2>
        <Button style={{ backgroundColor: 'var(--color-principal)', borderColor: 'var(--color-principal)' }} onClick={() => setShowModal(true)}>
          + Nueva Publicación
        </Button>
      </div>

      <div className="bg-white p-4 rounded shadow-sm border-0">
        {loading ? (
          <div className="text-center py-5"><Spinner animation="border" style={{ color: 'var(--color-principal)' }} /></div>
        ) : (
          <Table hover className="align-middle mb-0">
            <thead className="text-muted small">
              <tr>
                <th>FECHA</th>
                <th>TÍTULO</th>
                <th>CATEGORÍA</th>
                <th className="text-end">ESTADO</th>
              </tr>
            </thead>
            <tbody>
              {publicaciones.map((pub) => (
                <tr key={pub.id}>
                  <td className="text-secondary">{new Date(pub.fecha_publicacion).toLocaleDateString('es-CL')}</td>
                  <td className="fw-bold">{pub.titulo}</td>
                  <td>
                    <Badge bg={pub.categoria === 'Noticia' ? 'info' : 'primary'}>{pub.categoria}</Badge>
                  </td>
                  <td className="text-end">
                    <Badge bg="success">Publicado</Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}
        {!loading && publicaciones.length === 0 && (
          <div className="text-center text-muted py-4">No hay publicaciones registradas.</div>
        )}
      </div>

      <Modal show={showModal} onHide={handleClose} size="lg">
        <Modal.Header closeButton>
          <Modal.Title style={{ color: 'var(--color-principal)', fontWeight: 'bold' }}>Crear Publicación</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label className="small fw-bold">Título</Form.Label>
              <Form.Control name="titulo" value={formData.titulo} onChange={handleChange} required />
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label className="small fw-bold">Categoría</Form.Label>
              <Form.Select name="categoria" value={formData.categoria} onChange={handleChange} required>
                <option value="Noticia">Noticia</option>
                <option value="Artículo">Artículo Legal</option>
              </Form.Select>
            </Form.Group>

            {/* Nuevo campo agregado */}
            <Form.Group className="mb-3">
              <Form.Label className="small fw-bold">Descripción Corta (Resumen)</Form.Label>
              <Form.Control as="textarea" rows={2} name="descripcion_corta" value={formData.descripcion_corta} onChange={handleChange} placeholder="Breve resumen que se mostrará en la tarjeta principal..." required />
            </Form.Group>

            <Form.Group className="mb-4">
              <Form.Label className="small fw-bold">Contenido Completo</Form.Label>
              <Form.Control as="textarea" rows={6} name="contenido_completo" value={formData.contenido_completo} onChange={handleChange} required />
            </Form.Group>
            
            <div className="d-flex justify-content-end gap-2">
              <Button variant="outline-secondary" onClick={handleClose} disabled={saving}>Cancelar</Button>
              <Button type="submit" style={{ backgroundColor: 'var(--color-principal)', borderColor: 'var(--color-principal)' }} disabled={saving}>
                {saving ? <Spinner animation="border" size="sm" /> : 'Publicar'}
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default Informacion;