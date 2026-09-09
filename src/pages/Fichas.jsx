import { useState, useEffect } from 'react';
import { Table, Button, Badge, Modal, Form, Row, Col, Spinner } from 'react-bootstrap';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';

const Fichas = () => {
  const { user } = useAuth();
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fichas, setFichas] = useState([]); // Estado para guardar las fichas reales

  const [formData, setFormData] = useState({
    rut: '', nombre: '', apellido: '', tipo: '', motivo: ''
  });

  // Función para descargar las fichas desde Supabase
  const fetchFichas = async () => {
    try {
      const { data, error } = await supabase
        .from('legal_records')
        .select(`
          id,
          tipo_atencion,
          estado,
          fecha_creacion,
          participants (
            rut,
            nombre,
            apellido
          )
        `)
        .order('fecha_creacion', { ascending: false }); // Ordenar de más nuevas a más antiguas

      if (error) throw error;
      setFichas(data || []);
    } catch (error) {
      console.error("Error al cargar las fichas:", error.message);
    }
  };

  // Ejecutar la descarga al cargar la página por primera vez
  useEffect(() => {
    fetchFichas();
  }, []);

  const handleClose = () => {
    setShowModal(false);
    setFormData({ rut: '', nombre: '', apellido: '', tipo: '', motivo: '' });
  };
  const handleShow = () => setShowModal(true);
  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      let { data: participante } = await supabase
        .from('participants')
        .select('id')
        .eq('rut', formData.rut)
        .maybeSingle();

      if (!participante) {
        const { data: nuevoParticipante, error: errPart } = await supabase
          .from('participants')
          .insert([{ rut: formData.rut, nombre: formData.nombre, apellido: formData.apellido }])
          .select().single();
          
        if (errPart) throw errPart;
        participante = nuevoParticipante;
      }

      const { error: errFicha } = await supabase
        .from('legal_records')
        .insert([{
          participant_id: participante.id,
          professional_id: user.id,
          tipo_atencion: formData.tipo,
          motivo_consulta: formData.motivo
        }]);

      if (errFicha) throw errFicha;

      alert('Ficha creada exitosamente en la base de datos');
      handleClose();
      fetchFichas(); // Recargar la tabla automáticamente para mostrar la nueva ficha
      
    } catch (error) {
      console.error(error);
      alert('Error al guardar: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Función para dar un formato legible a la fecha
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-CL');
  };

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 style={{ color: 'var(--color-principal)', fontWeight: 'bold' }}>Fichas Jurídicas</h2>
        <Button style={{ backgroundColor: 'var(--color-principal)', borderColor: 'var(--color-principal)' }} onClick={handleShow}>
          + Nueva Ficha
        </Button>
      </div>

      <div className="bg-white p-4 rounded shadow-sm border-0">
        <Table responsive hover className="align-middle mb-0">
          <thead className="text-muted small">
            <tr>
              <th>RUT</th>
              <th>PARTICIPANTE</th>
              <th>TIPO DE ATENCIÓN</th>
              <th>INGRESO</th>
              <th>ESTADO</th>
              <th className="text-end">ACCIONES</th>
            </tr>
          </thead>
          <tbody>
            {fichas.map((ficha) => (
              <tr key={ficha.id}>
                <td className="fw-bold text-secondary">{ficha.participants?.rut}</td>
                <td>{ficha.participants?.nombre} {ficha.participants?.apellido}</td>
                <td>{ficha.tipo_atencion}</td>
                <td>{formatDate(ficha.fecha_creacion)}</td>
                <td>
                  <Badge bg={ficha.estado === 'Pendiente' ? 'warning' : 'success'} text={ficha.estado === 'Pendiente' ? 'dark' : 'light'}>
                    {ficha.estado}
                  </Badge>
                </td>
                <td className="text-end">
                  <Button variant="outline-secondary" size="sm">Ver detalle</Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
        {fichas.length === 0 && (
          <div className="text-center text-muted py-4">
            No hay fichas registradas actualmente.
          </div>
        )}
      </div>

      <Modal show={showModal} onHide={handleClose} size="lg">
        <Modal.Header closeButton>
          <Modal.Title style={{ color: 'var(--color-principal)', fontWeight: 'bold' }}>Ingresar Nueva Ficha</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSubmit}>
            <h6 className="fw-bold mb-3 text-muted">1. Datos del Participante</h6>
            <Row className="mb-4">
              <Col md={4}>
                <Form.Group>
                  <Form.Label className="small fw-bold">RUT</Form.Label>
                  <Form.Control name="rut" value={formData.rut} onChange={handleChange} placeholder="Ej: 12345678-9" required />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group>
                  <Form.Label className="small fw-bold">Nombre</Form.Label>
                  <Form.Control name="nombre" value={formData.nombre} onChange={handleChange} required />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group>
                  <Form.Label className="small fw-bold">Apellido</Form.Label>
                  <Form.Control name="apellido" value={formData.apellido} onChange={handleChange} required />
                </Form.Group>
              </Col>
            </Row>

            <h6 className="fw-bold mb-3 text-muted">2. Detalles de la Atención</h6>
            <Row className="mb-3">
              <Col md={6}>
                <Form.Group>
                  <Form.Label className="small fw-bold">Tipo de Atención</Form.Label>
                  <Form.Select name="tipo" value={formData.tipo} onChange={handleChange} required>
                    <option value="">Seleccione una opción...</option>
                    <option value="Asesoría">Asesoría</option>
                    <option value="Seguimiento">Seguimiento</option>
                    <option value="Causa">Causa</option>
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>
            <Form.Group className="mb-4">
              <Form.Label className="small fw-bold">Motivo de Consulta</Form.Label>
              <Form.Control as="textarea" name="motivo" rows={4} value={formData.motivo} onChange={handleChange} required />
            </Form.Group>
            
            <div className="d-flex justify-content-end gap-2">
              <Button variant="outline-secondary" onClick={handleClose} disabled={loading}>Cancelar</Button>
              <Button type="submit" style={{ backgroundColor: 'var(--color-principal)', borderColor: 'var(--color-principal)' }} disabled={loading}>
                {loading ? <Spinner animation="border" size="sm" /> : 'Guardar y Crear Ficha'}
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default Fichas;