import { useState, useEffect } from 'react';
import { Table, Button, Badge, Spinner, Modal, Form, Row, Col } from 'react-bootstrap';
import { supabase } from '../lib/supabase';

const GestionEstudiantes = () => {
  const [estudiantes, setEstudiantes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    nombre: '', correo: '', password: '', carrera: 'Derecho', institucion: 'IP-ST'
  });

  // Nota: Para este MVP visualizamos los datos desde una tabla 'perfiles' o simulamos la carga
  const fetchEstudiantes = async () => {
    try {
      // Si ya creaste una tabla de perfiles en Supabase, la leemos aquí. 
      // Por ahora simularemos la respuesta para que veas la interfaz.
      const mockData = [
        { id: 1, nombre: 'Juan Pérez Gómez', correo: 'juan.perez@estudiante.csj.cl', carrera: 'Derecho', estado: 'Activo' },
        { id: 2, nombre: 'María Silva', correo: 'maria.silva@estudiante.csj.cl', carrera: 'Trabajo Social', estado: 'Activo' }
      ];
      setEstudiantes(mockData);
    } catch (error) {
      console.error("Error al cargar estudiantes:", error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEstudiantes();
  }, []);

  const handleClose = () => {
    setShowModal(false);
    setFormData({ nombre: '', correo: '', password: '', carrera: 'Derecho', institucion: 'IP-ST' });
  };
  
  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      // Aquí irá la lógica de Supabase para registrar al usuario en Auth
      // supabase.auth.signUp({ email: formData.correo, password: formData.password })
      
      alert(`Cuenta creada exitosamente para ${formData.nombre}. Ya puede iniciar sesión.`);
      handleClose();
      // fetchEstudiantes(); // Recargar la lista
    } catch (error) {
      console.error(error);
      alert('Error al crear la cuenta: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 style={{ color: 'var(--color-principal)', fontWeight: 'bold' }}>Gestión de Estudiantes</h2>
        <Button style={{ backgroundColor: 'var(--color-principal)', borderColor: 'var(--color-principal)' }} onClick={() => setShowModal(true)}>
          + Nuevo Estudiante
        </Button>
      </div>

      <div className="bg-white p-4 rounded shadow-sm border-0">
        {loading ? (
          <div className="text-center py-5"><Spinner animation="border" style={{ color: 'var(--color-principal)' }} /></div>
        ) : (
          <Table hover className="align-middle mb-0">
            <thead className="text-muted small">
              <tr>
                <th>NOMBRE</th>
                <th>CORREO INSTITUCIONAL</th>
                <th>CARRERA</th>
                <th className="text-end">ESTADO</th>
              </tr>
            </thead>
            <tbody>
              {estudiantes.map((est) => (
                <tr key={est.id}>
                  <td className="fw-bold">{est.nombre}</td>
                  <td className="text-secondary">{est.correo}</td>
                  <td>{est.carrera}</td>
                  <td className="text-end">
                    <Badge bg={est.estado === 'Activo' ? 'success' : 'secondary'}>{est.estado}</Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}
      </div>

      <Modal show={showModal} onHide={handleClose} size="lg">
        <Modal.Header closeButton>
          <Modal.Title style={{ color: 'var(--color-principal)', fontWeight: 'bold' }}>Crear Cuenta de Estudiante</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSubmit}>
            <Row className="mb-3">
              <Col md={6}>
                <Form.Group>
                  <Form.Label className="small fw-bold">Nombre Completo</Form.Label>
                  <Form.Control name="nombre" value={formData.nombre} onChange={handleChange} placeholder="Ej: Ana López" required />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label className="small fw-bold">Correo Electrónico</Form.Label>
                  <Form.Control type="email" name="correo" value={formData.correo} onChange={handleChange} placeholder="estudiante@csj.cl" required />
                </Form.Group>
              </Col>
            </Row>

            <Row className="mb-3">
              <Col md={6}>
                <Form.Group>
                  <Form.Label className="small fw-bold">Carrera</Form.Label>
                  <Form.Select name="carrera" value={formData.carrera} onChange={handleChange} required>
                    <option value="Derecho">Derecho</option>
                    <option value="Trabajo Social">Trabajo Social</option>
                    <option value="Psicología">Psicología</option>
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label className="small fw-bold">Institución</Form.Label>
                  <Form.Control name="institucion" value={formData.institucion} onChange={handleChange} required readOnly />
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-4">
              <Form.Label className="small fw-bold">Contraseña Temporal</Form.Label>
              <Form.Control type="text" name="password" value={formData.password} onChange={handleChange} placeholder="Asigne una contraseña inicial" required />
              <Form.Text className="text-muted">
                El estudiante utilizará esta contraseña para su primer ingreso.
              </Form.Text>
            </Form.Group>

            <div className="d-flex justify-content-end gap-2">
              <Button variant="outline-secondary" onClick={handleClose} disabled={saving}>Cancelar</Button>
              <Button type="submit" style={{ backgroundColor: 'var(--color-principal)', borderColor: 'var(--color-principal)' }} disabled={saving}>
                {saving ? <Spinner animation="border" size="sm" /> : 'Crear Cuenta'}
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default GestionEstudiantes;