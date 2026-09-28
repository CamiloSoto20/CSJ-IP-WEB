import { useState } from 'react';
import { Container, Row, Col, Card, Button, Table, Badge, Modal, Form } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

const PanelSoporte = () => {
  const navigate = useNavigate();
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showMyPasswordModal, setShowMyPasswordModal] = useState(false);
  const [estudianteSeleccionado, setEstudianteSeleccionado] = useState(null);

  // Datos simulados para visualizar la interfaz
  const estudiantesMock = [
    { id: 1, nombre: 'Juan Pérez', correo: 'juan.perez@estudiante.csj.cl', estado: 'Activo' },
    { id: 2, nombre: 'María Silva', correo: 'maria.silva@estudiante.csj.cl', estado: 'Bloqueado' }
  ];

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  const handleOpenPasswordModal = (est) => {
    setEstudianteSeleccionado(est);
    setShowPasswordModal(true);
  };

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
                <h5 className="fw-bold mb-4">Gestión de Accesos (Estudiantes)</h5>
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
                    {estudiantesMock.map(est => (
                      <tr key={est.id}>
                        <td className="fw-bold">{est.nombre}</td>
                        <td className="text-secondary">{est.correo}</td>
                        <td>
                          <Badge bg={est.estado === 'Activo' ? 'success' : 'danger'}>{est.estado}</Badge>
                        </td>
                        <td className="text-end">
                          <Button variant="outline-warning" size="sm" onClick={() => handleOpenPasswordModal(est)}>
                            Resetear Contraseña
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

        {/* Modal: Cambiar Contraseña Estudiante */}
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
            <Button 
              className="w-100" 
              style={{ backgroundColor: 'var(--color-principal)', border: 'none' }}
              onClick={() => {
                alert('Contraseña actualizada correctamente (Simulación)');
                setShowPasswordModal(false);
              }}
            >
              Confirmar Cambio
            </Button>
          </Modal.Body>
        </Modal>

        {/* Modal: Cambiar Mi Contraseña (Soporte) */}
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
            <Button 
              className="w-100" 
              variant="dark"
              onClick={() => {
                alert('Contraseña personal actualizada (Simulación)');
                setShowMyPasswordModal(false);
              }}
            >
              Actualizar Credenciales
            </Button>
          </Modal.Body>
        </Modal>

      </Container>
    </div>
  );
};

export default PanelSoporte;