import { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Table, Badge, Modal, Form, Spinner } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import * as XLSX from 'xlsx';

import logoCSJ from '../assets/LOGO_CSJ.png';

const PanelSoporte = () => {
  const navigate = useNavigate();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showFichasModal, setShowFichasModal] = useState(false); // Modal para ver fichas/citas
  
  const [saving, setSaving] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [estudiantes, setEstudiantes] = useState([]);
  const [citasAgendadas, setCitasAgendadas] = useState([]); // Estado para guardar las citas
  
  const [perfilSoporte, setPerfilSoporte] = useState({ nombre: 'Cargando...', rol: 'Soporte TI' });

  const [formData, setFormData] = useState({
    rut: '', nombre: '', correo: '', password: '', carrera: 'Técnico Jurídico'
  });

  useEffect(() => {
    fetchDatosSoporte();
    fetchEstudiantes();
  }, []);

  const fetchDatosSoporte = async () => {
    try {
      const { data: authData } = await supabase.auth.getUser();
      if (authData?.user) {
        const { data: perfil } = await supabase
          .from('perfiles')
          .select('nombre, rol')
          .eq('id', authData.user.id)
          .single();
        if (perfil) setPerfilSoporte({ nombre: perfil.nombre, rol: 'Soporte TI' });
      }
    } catch (error) {
      console.error("Error al cargar perfil de soporte:", error);
    }
  };

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

  // Función para cargar las citas/fichas agendadas
  const fetchCitasAgendadas = async () => {
    try {
      // Ajusta 'appointments' o el nombre exacto de tu tabla de citas
      const { data, error } = await supabase
        .from('appointments')
        .select('*')
        .order('fecha', { ascending: true });
        
      if (error) throw error;
      setCitasAgendadas(data || []);
      setShowFichasModal(true);
    } catch (error) {
      console.error("Error al cargar citas:", error.message);
      alert("Hubo un error al cargar las fichas agendadas.");
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleCreateEstudiante = async (e) => {
    e.preventDefault();
    if (!formData.correo.endsWith('@csj.cl')) {
      alert("Error: El correo debe pertenecer al dominio institucional (@csj.cl)");
      return;
    }

    setSaving(true);
    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.correo,
        password: formData.password,
      });

      if (authError) throw authError;

      if (authData.user) {
        const { error: profileError } = await supabase
          .from('perfiles')
          .insert([
            {
              id: authData.user.id,
              rut: formData.rut,
              nombre: formData.nombre,
              correo: formData.correo,
              rol: 'estudiante'
            }
          ]);

        if (profileError) throw profileError;
      }

      alert(`Cuenta creada exitosamente para ${formData.nombre}.`);
      fetchEstudiantes(); 
      setShowCreateModal(false);
      setFormData({ rut: '', nombre: '', correo: '', password: '', carrera: 'Técnico Jurídico' });
    } catch (error) {
      console.error(error);
      alert('Error al crear la cuenta: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDownloadExcel = async () => {
    try {
      const { data: estudiantesData, error } = await supabase
        .from('perfiles')
        .select('rut, nombre, correo, estado, created_at')
        .eq('rol', 'estudiante');
        
      if (error) throw error;
      
      const datosExcel = estudiantesData.map(est => ({
        'RUT': est.rut || 'No registrado',
        'Nombre Completo': est.nombre,
        'Correo Institucional': est.correo,
        'Estado': est.estado,
        'Fecha de Creación': new Date(est.created_at).toLocaleDateString('es-CL')
      }));

      const worksheet = XLSX.utils.json_to_sheet(datosExcel);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Estudiantes_Activos");

      XLSX.writeFile(workbook, `Reporte_Estudiantes_${new Date().toLocaleDateString('es-CL')}.xlsx`);
      
    } catch (error) {
      console.error("Error al generar Excel:", error);
      alert("Hubo un error al generar el reporte.");
    }
  };

  const handleToggleEstado = async (id, estadoActual) => {
    const nuevoEstado = estadoActual === 'Activo' ? 'Inactivo' : 'Activo';
    try {
      const { error } = await supabase
        .from('perfiles')
        .update({ estado: nuevoEstado })
        .eq('id', id);
        
      if (error) throw error;
      fetchEstudiantes();
    } catch (error) {
      console.error("Error al cambiar estado:", error);
    }
  };

  // Función para borrar la caché/estado local
  const handleBorrarCache = () => {
    if (window.confirm("¿Estás seguro de que deseas forzar la recarga y limpiar la caché local de los perfiles? Esto actualizará los datos desde el servidor.")) {
      // Limpia el estado local
      setEstudiantes([]);
      setLoadingData(true);
      
      // Si estás usando localStorage o sessionStorage para algo más, puedes limpiarlo aquí
      // localStorage.removeItem('algun_item');
      
      // Vuelve a hacer fetch (actúa como limpiar caché y forzar recarga)
      setTimeout(() => {
        fetchEstudiantes();
        alert("Caché limpiada y datos recargados correctamente.");
      }, 500); // Pequeño delay visual para que se note la acción
    }
  };

  return (
    <div style={{ backgroundColor: '#f4f7f5', minHeight: '100vh', padding: '2rem 0' }}>
      <Container>
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div className="d-flex align-items-center gap-3">
            <img src={logoCSJ} alt="Logo Clínica" style={{ maxWidth: '60px' }} onError={(e) => e.target.style.display = 'none'} />
            <div>
              <h2 style={{ color: 'var(--color-principal)', fontWeight: 'bold', margin: 0 }}>Panel de Soporte TI</h2>
              <p className="text-muted mb-0">Gestión de cuentas y extracciones - <span className="fw-bold">{perfilSoporte.nombre}</span> ({perfilSoporte.rol})</p>
            </div>
          </div>
          <Button variant="outline-danger" onClick={handleLogout}>
            Cerrar Sesión
          </Button>
        </div>

        <Row className="g-4">
          {/* Columna Izquierda: Herramientas */}
          <Col md={4}>
            <Card className="border-0 shadow-sm h-100" style={{ borderRadius: '15px' }}>
              <Card.Body className="d-flex flex-column gap-3">
                <div>
                  <h5 className="fw-bold mb-3" style={{ color: 'var(--color-principal)' }}>Extracción de Datos</h5>
                  <Button 
                    variant="success" 
                    className="w-100 fw-bold d-flex align-items-center justify-content-center gap-2 py-2 mb-2"
                    onClick={handleDownloadExcel}
                    style={{ borderRadius: '12px' }}
                  >
                    <span>📊</span> Descargar Reporte
                  </Button>
                </div>
                
                <hr className="my-2" />
                
                <div>
                  <h5 className="fw-bold mb-3" style={{ color: 'var(--color-principal)' }}>Visión Global</h5>
                  <Button 
                    variant="outline-primary" 
                    className="w-100 fw-bold py-2 mb-2"
                    onClick={fetchCitasAgendadas}
                    style={{ borderRadius: '12px' }}
                  >
                    Ver Todas las Citas Agendadas
                  </Button>
                </div>

                <hr className="my-2" />
                
                <div className="mt-auto">
                   <h6 className="fw-bold mb-2 text-danger">Herramientas de Mantenimiento</h6>
                   <Button 
                    variant="outline-danger" 
                    className="w-100 fw-bold py-2"
                    onClick={handleBorrarCache}
                    style={{ borderRadius: '12px' }}
                  >
                    🧹 Borrar Caché / Forzar Recarga
                  </Button>
                </div>
              </Card.Body>
            </Card>
          </Col>

          {/* Columna Derecha: Gestión de Estudiantes */}
          <Col md={8}>
            <Card className="border-0 shadow-sm h-100" style={{ borderRadius: '15px' }}>
              <Card.Body>
                <div className="d-flex justify-content-between align-items-center mb-4">
                  <h5 className="fw-bold mb-0" style={{ color: 'var(--color-principal)' }}>Gestión de Accesos (Estudiantes)</h5>
                  <Button variant="outline-success" size="sm" onClick={() => setShowCreateModal(true)}>
                    + Nuevo Estudiante
                  </Button>
                </div>
                
                {loadingData ? (
                  <div className="text-center py-4"><Spinner animation="border" variant="success" /></div>
                ) : (
                  <Table hover responsive className="align-middle">
                    <thead className="text-muted small">
                      <tr>
                        <th>RUT</th>
                        <th>ESTUDIANTE</th>
                        <th>CORREO</th>
                        <th>ESTADO</th>
                        <th className="text-end">ACCIÓN</th>
                      </tr>
                    </thead>
                    <tbody>
                      {estudiantes.length === 0 ? (
                        <tr><td colSpan="5" className="text-center text-muted py-4">No hay estudiantes registrados.</td></tr>
                      ) : (
                        estudiantes.map(est => (
                          <tr key={est.id}>
                            <td className="text-secondary small">{est.rut || 'S/N'}</td>
                            <td className="fw-bold">{est.nombre}</td>
                            <td className="text-secondary small">{est.correo}</td>
                            <td>
                              <Badge bg={est.estado === 'Activo' ? 'success' : 'danger'}>{est.estado}</Badge>
                            </td>
                            <td className="text-end">
                              <Button 
                                variant={est.estado === 'Activo' ? 'outline-danger' : 'outline-success'} 
                                size="sm" 
                                onClick={() => handleToggleEstado(est.id, est.estado)}
                              >
                                {est.estado === 'Activo' ? 'Bloquear' : 'Activar'}
                              </Button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </Table>
                )}
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Modal: Crear Estudiante */}
        <Modal show={showCreateModal} onHide={() => setShowCreateModal(false)} centered>
          {/* ... [Contenido del modal de crear estudiante igual que antes] ... */}
          <Modal.Header closeButton>
            <Modal.Title className="fs-5 fw-bold" style={{ color: 'var(--color-principal)' }}>Crear Cuenta de Estudiante</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form onSubmit={handleCreateEstudiante}>
              <Row className="mb-3">
                <Col md={4}>
                  <Form.Label className="small fw-bold">RUT</Form.Label>
                  <Form.Control name="rut" value={formData.rut} onChange={handleChange} placeholder="Ej: 12345678-9" required />
                </Col>
                <Col md={8}>
                  <Form.Label className="small fw-bold">Nombre Completo</Form.Label>
                  <Form.Control name="nombre" value={formData.nombre} onChange={handleChange} placeholder="Ej: Ana López" required />
                </Col>
              </Row>
              <Form.Group className="mb-3">
                <Form.Label className="small fw-bold">Correo Institucional</Form.Label>
                <Form.Control type="email" name="correo" value={formData.correo} onChange={handleChange} placeholder="ejemplo@csj.cl" required />
                <Form.Text className="text-muted" style={{ fontSize: '0.75rem' }}>Debe terminar en @csj.cl</Form.Text>
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label className="small fw-bold">Carrera</Form.Label>
                <Form.Select name="carrera" value={formData.carrera} onChange={handleChange} required>
                  <option value="Técnico Jurídico">Técnico Jurídico</option>
                  <option value="Servicio Social">Servicio Social</option>
                  <option value="Técnico Trabajo Social">Técnico Trabajo Social</option>
                </Form.Select>
              </Form.Group>
              <Form.Group className="mb-4">
                <Form.Label className="small fw-bold">Contraseña Temporal</Form.Label>
                <Form.Control type="password" name="password" value={formData.password} onChange={handleChange} placeholder="Mínimo 6 caracteres" required minLength={6} />
              </Form.Group>
              <Button type="submit" className="w-100 fw-bold" style={{ backgroundColor: 'var(--color-principal)', border: 'none' }} disabled={saving}>
                {saving ? <Spinner animation="border" size="sm" /> : 'Registrar Estudiante'}
              </Button>
            </Form>
          </Modal.Body>
        </Modal>

        {/* Modal: Visor de Citas/Fichas Agendadas */}
        <Modal show={showFichasModal} onHide={() => setShowFichasModal(false)} size="lg" centered>
          <Modal.Header closeButton>
            <Modal.Title className="fw-bold" style={{ color: 'var(--color-principal)' }}>Citas Agendadas Globales</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {citasAgendadas.length === 0 ? (
              <p className="text-muted text-center py-4">No hay citas agendadas actualmente en el sistema.</p>
            ) : (
              <Table hover responsive size="sm" className="align-middle">
                <thead>
                  <tr>
                    <th>Fecha</th>
                    <th>Hora</th>
                    <th>Motivo/Tipo</th>
                    <th>Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {citasAgendadas.map((cita) => (
                    <tr key={cita.id}>
                      <td>{cita.fecha}</td>
                      <td>{cita.hora}</td>
                      <td>{cita.motivo || 'N/A'}</td>
                      <td>
                        <Badge bg={cita.estado === 'Confirmada' ? 'success' : cita.estado === 'Pendiente' ? 'warning' : 'secondary'}>
                          {cita.estado}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            )}
          </Modal.Body>
        </Modal>

      </Container>
    </div>
  );
};

export default PanelSoporte;