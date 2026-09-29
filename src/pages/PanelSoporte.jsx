import { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Table, Badge, Modal, Form, Spinner } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

const PanelSoporte = () => {
  const navigate = useNavigate();
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showMyPasswordModal, setShowMyPasswordModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [estudianteSeleccionado, setEstudianteSeleccionado] = useState(null);
  
  const [saving, setSaving] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [estudiantes, setEstudiantes] = useState([]);

  const [formData, setFormData] = useState({
    nombre: '', correo: '', password: '', carrera: 'Derecho'
  });

  // 1. Cargar estudiantes desde la base de datos al montar el componente
  useEffect(() => {
    fetchEstudiantes();
  }, []);

  const fetchEstudiantes = async () => {
    try {
      const { data, error } = await supabase
        .from('perfiles')
        .select('*')
        .eq('rol', 'estudiante')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setEstudiantes(data || []);
    } catch (error) {
      console.error("Error al cargar estudiantes:", error.message);
    } finally {
      setLoadingData(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  // 2. Crear estudiante en Auth e insertar en tabla perfiles
  const handleCreateEstudiante = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      // Paso A: Crear la cuenta de autenticación
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.correo,
        password: formData.password,
      });

      if (authError) throw authError;

      // Paso B: Guardar el perfil público en la tabla 'perfiles'
      if (authData.user) {
        const { error: profileError } = await supabase
          .from('perfiles')
          .insert([
            {
              id: authData.user.id,
              nombre: formData.nombre,
              correo: formData.correo,
              rol: 'estudiante'
            }
          ]);

        if (profileError) throw profileError;
      }

      alert(`Cuenta creada exitosamente para ${formData.nombre}.`);
      
      fetchEstudiantes(); // Recargar la tabla con el nuevo usuario
      setShowCreateModal(false);
      setFormData({ nombre: '', correo: '', password: '', carrera: 'Derecho' });
    } catch (error) {
      console.error(error);
      alert('Error al crear la cuenta: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  // ... (Mantén el return y el JSX exactamente igual que lo tenías)
  return (
    <div style={{ backgroundColor: '#f4f7f5', minHeight: '100vh', padding: '2rem 0' }}>
      <Container>
        {/* Cabecera del Panel */}
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h2 style={{ color: 'var(--color-principal)', fontWeight: 'bold' }}>Panel de Soporte TI</h2>
            <p className="text-muted mb-0">Gestión de cuentas y extracción de datos</p>
          </div>
          <div className="d-flex gap-2">
            <Button variant="outline-secondary" onClick={() => setShowMyPasswordModal(true)}>
              Cambiar mi contraseña
            </Button>
            <Button variant="outline-danger" onClick={handleLogout}>
              Cerrar Sesión
            </Button>
          </div>
        </div>

        <Row className="g-4">
          {/* Columna Izquierda: Herramientas de Reportes */}
          <Col md={4}>
            <Card className="border-0 shadow-sm h-100">
              <Card.Body>
                <h5 className="fw-bold mb-4">Extracción de Datos</h5>
                <p className="text-muted small mb-4">
                  Descarga un reporte completo en Excel con todas las citas agendadas, atendidas y canceladas. Incluye nombres, fechas, estados y motivos.
                </p>
                <Button 
                  variant="success" 
                  className="w-100 fw-bold d-flex align-items-center justify-content-center gap-2"
                  onClick={() => alert('Función de exportación a Excel en desarrollo...')}
                >
                  <span>📊</span> Descargar Reporte (Excel)
                </Button>
                
                <hr className="my-4" />
                
                <h6 className="fw-bold mb-3">Visión Global del Sistema</h6>
                <div className="d-flex flex-column gap-2">
                  <Button variant="outline-primary" onClick={() => alert('Vista global en desarrollo...')}>Ver Todas las Citas</Button>
                  <Button variant="outline-primary" onClick={() => alert('Vista global en desarrollo...')}>Ver Participantes</Button>
                </div>
              </Card.Body>
            </Card>
          </Col>

          {/* Columna Derecha: Gestión de Estudiantes */}
          <Col md={8}>
            <Card className="border-0 shadow-sm h-100">
              <Card.Body>
                <div className="d-flex justify-content-between align-items-center mb-4">
                  <h5 className="fw-bold mb-0">Gestión de Accesos (Estudiantes)</h5>
                  <Button variant="outline-success" size="sm" onClick={() => setShowCreateModal(true)}>
                    + Nuevo Estudiante
                  </Button>
                </div>
                
                <Table hover responsive className="align-middle">
                  <thead className="text-muted small">
                    <tr>
                      <th>ESTUDIANTE</th>
                      <th>CORREO</th>
                      <th>ESTADO</th>
                      <th className="text-end">ACCIÓN</th>
                    </tr>
                  </thead>
                  <tbody>
                    {estudiantes.map(est => (
                      <tr key={est.id}>
                        <td className="fw-bold">{est.nombre}</td>
                        <td className="text-secondary">{est.correo}</td>
                        <td>
                          <Badge bg={est.estado === 'Activo' ? 'success' : 'danger'}>{est.estado}</Badge>
                        </td>
                        <td className="text-end">
                          <Button variant="outline-warning" size="sm" onClick={() => {
                            setEstudianteSeleccionado(est);
                            setShowPasswordModal(true);
                          }}>
                            Resetear
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Modal: Crear Estudiante */}
        <Modal show={showCreateModal} onHide={() => setShowCreateModal(false)} centered>
          <Modal.Header closeButton>
            <Modal.Title className="fs-5 fw-bold" style={{ color: 'var(--color-principal)' }}>Crear Cuenta de Estudiante</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form onSubmit={handleCreateEstudiante}>
              <Form.Group className="mb-3">
                <Form.Label className="small fw-bold">Nombre Completo</Form.Label>
                <Form.Control name="nombre" value={formData.nombre} onChange={handleChange} placeholder="Ej: Ana López" required />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label className="small fw-bold">Correo Electrónico (Debe incluir 'estudiante')</Form.Label>
                <Form.Control type="email" name="correo" value={formData.correo} onChange={handleChange} placeholder="ejemplo.estudiante@csj.cl" required />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label className="small fw-bold">Carrera</Form.Label>
                <Form.Select name="carrera" value={formData.carrera} onChange={handleChange} required>
                  <option value="Derecho">Derecho</option>
                  <option value="Trabajo Social">Trabajo Social</option>
                  <option value="Psicología">Psicología</option>
                </Form.Select>
              </Form.Group>
              <Form.Group className="mb-4">
                <Form.Label className="small fw-bold">Contraseña Temporal</Form.Label>
                <Form.Control type="password" name="password" value={formData.password} onChange={handleChange} placeholder="Mínimo 6 caracteres" required minLength={6} />
              </Form.Group>
              <Button type="submit" className="w-100" style={{ backgroundColor: 'var(--color-principal)', border: 'none' }} disabled={saving}>
                {saving ? <Spinner animation="border" size="sm" /> : 'Registrar Estudiante'}
              </Button>
            </Form>
          </Modal.Body>
        </Modal>

        {/* Modales de Cambio de Contraseña (Mantenemos los de interfaz gráfica) */}
        <Modal show={showPasswordModal} onHide={() => setShowPasswordModal(false)} centered>
          <Modal.Header closeButton>
            <Modal.Title className="fs-5 fw-bold">Resetear Contraseña</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <p className="text-muted small mb-4">
              Asignar una nueva contraseña temporal para <strong>{estudianteSeleccionado?.nombre}</strong>.
            </p>
            <Form.Group className="mb-3">
              <Form.Label className="small fw-bold">Nueva Contraseña</Form.Label>
              <Form.Control type="text" placeholder="Ej: temporal1234" />
            </Form.Group>
            <Button className="w-100" style={{ backgroundColor: 'var(--color-principal)', border: 'none' }} onClick={() => setShowPasswordModal(false)}>
              Confirmar Cambio
            </Button>
          </Modal.Body>
        </Modal>

        <Modal show={showMyPasswordModal} onHide={() => setShowMyPasswordModal(false)} centered>
          <Modal.Header closeButton>
            <Modal.Title className="fs-5 fw-bold">Cambiar mi contraseña</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label className="small fw-bold">Contraseña Actual</Form.Label>
              <Form.Control type="password" />
            </Form.Group>
            <Form.Group className="mb-4">
              <Form.Label className="small fw-bold">Nueva Contraseña</Form.Label>
              <Form.Control type="password" />
            </Form.Group>
            <Button className="w-100" variant="dark" onClick={() => setShowMyPasswordModal(false)}>
              Actualizar Credenciales
            </Button>
          </Modal.Body>
        </Modal>

      </Container>
    </div>
  );
};

export default PanelSoporte;