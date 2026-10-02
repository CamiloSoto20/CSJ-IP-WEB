import { useState, useEffect } from 'react';
import { Container, Card, Button, Modal, Form, Row, Col, Spinner, Badge, Table } from 'react-bootstrap';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';

const Charlas = () => {
  const { user } = useAuth();
  const [charlas, setCharlas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const [formData, setFormData] = useState({
    nombre: '', descripcion: '', fecha: '', hora: '', lugar: ''
  });
  const [afiche, setAfiche] = useState(null);
  const [archivoCharla, setArchivoCharla] = useState(null);

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
      let charlaUrl = null;

      // Subir Afiche
      if (afiche) {
        const fileExt = afiche.name.split('.').pop();
        const fileName = `afiche_coord_${Date.now()}.${fileExt}`;
        const { error: errAfiche } = await supabase.storage.from('charlas').upload(fileName, afiche);
        if (!errAfiche) {
          aficheUrl = supabase.storage.from('charlas').getPublicUrl(fileName).data.publicUrl;
        }
      }

      // Subir Archivo de la Charla
      if (archivoCharla) {
        const fileExt = archivoCharla.name.split('.').pop();
        const fileName = `charla_coord_${Date.now()}.${fileExt}`;
        const { error: errCharla } = await supabase.storage.from('charlas').upload(fileName, archivoCharla);
        if (!errCharla) {
          charlaUrl = supabase.storage.from('charlas').getPublicUrl(fileName).data.publicUrl;
        }
      }

      const { error } = await supabase.from('talks').insert([{
        nombre: formData.nombre,
        descripcion: formData.descripcion,
        fecha: formData.fecha,
        hora: formData.hora,
        lugar: formData.lugar,
        afiche_url: aficheUrl,
        archivo_url: charlaUrl,
        estudiante_id: user?.id // En este caso registrará el ID de la coordinadora
      }]);

      if (error) throw error;

      alert('Charla registrada exitosamente.');
      setShowModal(false);
      setFormData({ nombre: '', descripcion: '', fecha: '', hora: '', lugar: '' });
      setAfiche(null);
      setArchivoCharla(null);
      fetchCharlas();
    } catch (error) {
      alert('Error al guardar la charla: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if(window.confirm('¿Está segura de eliminar esta charla?')) {
      try {
        const { error } = await supabase.from('talks').delete().eq('id', id);
        if (error) throw error;
        fetchCharlas();
      } catch (error) {
        alert("Error al eliminar: " + error.message);
      }
    }
  };

  return (
    <Container fluid className="py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 style={{ color: 'var(--color-principal)', fontWeight: '800' }}>Charlas y Capacitaciones</h2>
          <p className="text-muted">Gestión de actividades de formación</p>
        </div>
        <Button style={{ backgroundColor: 'var(--color-principal)', border: 'none' }} onClick={() => setShowModal(true)} className="fw-bold px-4 py-2 rounded-pill shadow-sm">
          + Subir Charla
        </Button>
      </div>

      {loading ? (
        <div className="text-center py-5"><Spinner animation="border" style={{ color: 'var(--color-principal)' }} /></div>
      ) : (
        <Card className="border-0 shadow-sm rounded-4 overflow-hidden">
          <Table responsive hover className="align-middle mb-0">
            <thead className="bg-light text-muted small text-uppercase">
              <tr>
                <th className="px-4 py-3">Fecha y Hora</th>
                <th className="py-3">Charla</th>
                <th className="py-3">Ubicación</th>
                <th className="py-3">Archivos</th>
                <th className="px-4 py-3 text-end">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {charlas.length === 0 ? (
                <tr>
                  <td colSpan="5" className="text-center py-5 text-muted">No hay charlas registradas.</td>
                </tr>
              ) : (
                charlas.map(charla => (
                  <tr key={charla.id}>
                    <td className="px-4">
                      <Badge bg="success" className="d-inline-block py-2 px-3 rounded-pill">{charla.fecha} | {charla.hora}</Badge>
                    </td>
                    <td>
                      <span className="fw-bold d-block text-dark">{charla.nombre}</span>
                      <small className="text-muted text-truncate d-block" style={{ maxWidth: '250px' }}>{charla.descripcion}</small>
                    </td>
                    <td>{charla.lugar}</td>
                    <td>
                      <div className="d-flex gap-2">
                        {charla.afiche_url && <a href={charla.afiche_url} target="_blank" rel="noreferrer" className="badge bg-primary text-decoration-none">Afiche</a>}
                        {charla.archivo_url && <a href={charla.archivo_url} target="_blank" rel="noreferrer" className="badge bg-info text-decoration-none">Material</a>}
                      </div>
                    </td>
                    <td className="px-4 text-end">
                      <Button variant="outline-danger" size="sm" onClick={() => handleDelete(charla.id)}>Eliminar</Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </Table>
        </Card>
      )}

      {/* Modal Subir Charla (Mismo diseño que el estudiante) */}
      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg" centered>
        <Modal.Header closeButton>
          <Modal.Title className="fw-bold" style={{ color: 'var(--color-principal)' }}>Registrar Nueva Charla</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label className="small fw-bold">Nombre de la Charla</Form.Label>
              <Form.Control name="nombre" value={formData.nombre} onChange={handleChange} required placeholder="Ej: Capacitación en Derecho de Familia..." />
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
                  <Form.Control name="lugar" value={formData.lugar} onChange={handleChange} required placeholder="Ej: Sala 302, Teams..." />
                </Form.Group>
              </Col>
            </Row>

            <Row className="mb-4">
              <Col md={6}>
                <Form.Group>
                  <Form.Label className="small fw-bold">Afiche (Imagen/PDF)</Form.Label>
                  <Form.Control type="file" accept="image/*,.pdf" onChange={(e) => setAfiche(e.target.files[0])} />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label className="small fw-bold">Archivo de la Charla (PPT, PDF, DOCX)</Form.Label>
                  <Form.Control type="file" accept=".pdf,.doc,.docx,.ppt,.pptx" onChange={(e) => setArchivoCharla(e.target.files[0])} />
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

export default Charlas;