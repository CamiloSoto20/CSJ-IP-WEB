import { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Table, Badge, Modal, Form, Spinner } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import * as XLSX from 'xlsx';

import logoCSJ from '../assets/LOGO_CSJ.png';

const PanelSoporte = () => {
  const navigate = useNavigate();
  const [isDarkMode, setIsDarkMode] = useState(false);
  
  // Modales
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showFichasModal, setShowFichasModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showAvisoModal, setShowAvisoModal] = useState(false);
  
  // Estados de datos
  const [saving, setSaving] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [estudiantes, setEstudiantes] = useState([]);
  const [citasAgendadas, setCitasAgendadas] = useState([]);
  const [perfilSoporte, setPerfilSoporte] = useState({ nombre: 'Cargando...', rol: 'Soporte TI' });
  
  // Estados de selección y formularios
  const [estudianteSeleccionado, setEstudianteSeleccionado] = useState(null);
  const [nuevaPassword, setNuevaPassword] = useState('');
  const [avisoTexto, setAvisoTexto] = useState('');
  
  const [formData, setFormData] = useState({
    rut: '', nombre: '', correo: '', password: '', carrera: 'Técnico Jurídico'
  });

  useEffect(() => {
    fetchDatosSoporte();
    fetchEstudiantes();
    fetchCitasAgendadas(true); // Carga inicial silenciosa para el tiempo real

    // Suscripción en Tiempo Real para las Citas
    const citasSubscription = supabase
      .channel('custom-all-channel')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'appointments' }, () => {
        fetchCitasAgendadas(true); // Recarga silenciosa al detectar cambios
      })
      .subscribe();

    return () => {
      supabase.removeChannel(citasSubscription);
    };
  }, []);

  const fetchDatosSoporte = async () => {
    try {
      const { data: authData } = await supabase.auth.getUser();
      if (authData?.user) {
        const { data: perfil } = await supabase.from('perfiles').select('nombre, rol').eq('id', authData.user.id).single();
        if (perfil) setPerfilSoporte({ nombre: perfil.nombre, rol: 'Soporte TI' });
      }
    } catch (error) {
      console.error("Error al cargar perfil de soporte:", error);
    }
  };

  const fetchEstudiantes = async () => {
    try {
      const { data, error } = await supabase.from('perfiles').select('*').eq('rol', 'estudiante').order('created_at', { ascending: false });
      if (error) throw error;
      setEstudiantes(data || []);
    } catch (error) {
      console.error("Error al cargar estudiantes:", error.message);
    } finally {
      setLoadingData(false);
    }
  };

  const fetchCitasAgendadas = async (silencioso = false) => {
    try {
      const { data, error } = await supabase.from('appointments').select('*').order('fecha', { ascending: true });
      if (error) throw error;
      setCitasAgendadas(data || []);
      if (!silencioso) setShowFichasModal(true);
    } catch (error) {
      console.error("Error al cargar citas:", error.message);
      if (!silencioso) alert("No se pudieron cargar las citas. Verifica la conexión.");
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleCreateEstudiante = async (e) => {
    e.preventDefault();
    if (!formData.correo.endsWith('@csj.cl')) return alert("El correo debe pertenecer al dominio @csj.cl");
    setSaving(true);
    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({ email: formData.correo, password: formData.password });
      if (authError) throw authError;
      if (authData.user) {
        const { error: profileError } = await supabase.from('perfiles').insert([{ id: authData.user.id, rut: formData.rut, nombre: formData.nombre, correo: formData.correo, rol: 'estudiante' }]);
        if (profileError) throw profileError;
      }
      alert(`Cuenta creada exitosamente para ${formData.nombre}.`);
      fetchEstudiantes(); 
      setShowCreateModal(false);
      setFormData({ rut: '', nombre: '', correo: '', password: '', carrera: 'Técnico Jurídico' });
    } catch (error) {
      alert('Error al crear la cuenta: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDownloadExcel = async () => {
    try {
      const { data: estudiantesData, error } = await supabase.from('perfiles').select('rut, nombre, correo, estado, created_at').eq('rol', 'estudiante');
      if (error) throw error;
      const datosExcel = estudiantesData.map(est => ({ 'RUT': est.rut || 'S/N', 'Nombre': est.nombre, 'Correo': est.correo, 'Estado': est.estado, 'Fecha Creación': new Date(est.created_at).toLocaleDateString('es-CL') }));
      const worksheet = XLSX.utils.json_to_sheet(datosExcel);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Estudiantes");
      XLSX.writeFile(workbook, `Reporte_Estudiantes_${new Date().toLocaleDateString('es-CL')}.xlsx`);
    } catch (error) {
      alert("Hubo un error al generar el reporte.");
    }
  };

  const handleToggleEstado = async (id, estadoActual) => {
    const nuevoEstado = estadoActual === 'Activo' ? 'Inactivo' : 'Activo';
    try {
      const { error } = await supabase.from('perfiles').update({ estado: nuevoEstado }).eq('id', id);
      if (error) throw error;
      fetchEstudiantes();
    } catch (error) {
      console.error("Error al cambiar estado:", error);
    }
  };

  const handleBorrarCache = () => {
    if (window.confirm("¿Forzar recarga y limpiar caché?")) {
      setEstudiantes([]);
      setLoadingData(true);
      setTimeout(() => { fetchEstudiantes(); alert("Caché limpiada y datos recargados."); }, 500);
    }
  };

  // Enviar un aviso global a la tabla information (Noticias)
  const handleEnviarAviso = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { error } = await supabase.from('information').insert([{
        titulo: '⚠️ Aviso de Soporte TI',
        categoria: 'Noticia',
        descripcion_corta: avisoTexto
      }]);
      if (error) throw error;
      alert("Aviso enviado a todos los usuarios.");
      setShowAvisoModal(false);
      setAvisoTexto('');
    } catch (error) {
      alert("Error al enviar el aviso.");
    } finally {
      setSaving(false);
    }
  };

  // Simulación de Cambio de Contraseña para la Demo
  const handleCambiarPassword = (e) => {
    e.preventDefault();
    setSaving(true);
    setTimeout(() => {
      alert(`Contraseña actualizada exitosamente para ${estudianteSeleccionado.nombre}. (Simulación UI)`);
      setSaving(false);
      setShowPasswordModal(false);
      setNuevaPassword('');
    }, 800);
  };

  return (
    <>
      <style>
        {`
          .soporte-wrapper { min-height: 100vh; padding: 2rem 0; transition: all 0.3s ease; background-color: #f4f7f5; }
          .soporte-wrapper.dark-mode { background-color: #0f172a; color: #f8fafc; }
          .soporte-wrapper.dark-mode .card { background-color: #1e293b; border: 1px solid #334155 !important; }
          .soporte-wrapper.dark-mode .text-dark, .soporte-wrapper.dark-mode h2, .soporte-wrapper.dark-mode h5, .soporte-wrapper.dark-mode h6, .soporte-wrapper.dark-mode td, .soporte-wrapper.dark-mode th { color: #f8fafc !important; }
          .soporte-wrapper.dark-mode .text-muted, .soporte-wrapper.dark-mode .text-secondary { color: #94a3b8 !important; }
          .soporte-wrapper.dark-mode .modal-content { background-color: #1e293b; color: #f8fafc; border-color: #334155; }
          .soporte-wrapper.dark-mode .modal-header { border-bottom-color: #334155; }
          .soporte-wrapper.dark-mode .form-control, .soporte-wrapper.dark-mode .form-select { background-color: #0f172a; color: #f8fafc; border-color: #334155; }
          .soporte-wrapper.dark-mode .table { --bs-table-bg: transparent; --bs-table-color: #f8fafc; border-color: #334155; }
          .soporte-wrapper.dark-mode .table hover > tbody > tr:hover > * { --bs-table-accent-bg: rgba(255,255,255,0.05); color: #f8fafc; }
        `}
      </style>

      <div className={`soporte-wrapper ${isDarkMode ? 'dark-mode' : ''}`}>
        <Container>
          {/* Cabecera */}
          <div className="d-flex justify-content-between align-items-center mb-4">
            <div className="d-flex align-items-center gap-3">
              <img src={logoCSJ} alt="Logo" style={{ maxWidth: '60px' }} onError={(e) => e.target.style.display = 'none'} />
              <div>
                <h2 style={{ color: isDarkMode ? '#78BE20' : 'var(--color-principal)', fontWeight: 'bold', margin: 0 }}>Panel de Soporte TI</h2>
                <p className="text-muted mb-0">Gestión de cuentas - <span className="fw-bold">{perfilSoporte.nombre}</span></p>
              </div>
            </div>
            <div className="d-flex gap-2">
              <Button variant={isDarkMode ? 'outline-light' : 'outline-dark'} onClick={() => setIsDarkMode(!isDarkMode)}>
                {isDarkMode ? '☀️' : '🌙'}
              </Button>
              <Button variant="outline-danger" onClick={handleLogout}>Cerrar Sesión</Button>
            </div>
          </div>

          <Row className="g-4">
            {/* Columna Izquierda: Herramientas */}
            <Col md={4}>
              <Card className="border-0 shadow-sm h-100" style={{ borderRadius: '15px' }}>
                <Card.Body className="d-flex flex-column gap-3">
                  <div>
                    <h5 className="fw-bold mb-3" style={{ color: 'var(--color-principal)' }}>Extracción y Avisos</h5>
                    <Button variant="success" className="w-100 fw-bold d-flex align-items-center justify-content-center gap-2 py-2 mb-2" onClick={handleDownloadExcel} style={{ borderRadius: '12px' }}>
                      <span>📊</span> Descargar Reporte
                    </Button>
                    <Button variant="warning" className="w-100 fw-bold d-flex align-items-center justify-content-center gap-2 py-2 mb-2" onClick={() => setShowAvisoModal(true)} style={{ borderRadius: '12px', color: '#000' }}>
                      <span>📢</span> Enviar Aviso Global
                    </Button>
                  </div>
                  <hr className="my-2" style={{ borderColor: isDarkMode ? '#334155' : '#dee2e6' }} />
                  <div>
                    <h5 className="fw-bold mb-3" style={{ color: 'var(--color-principal)' }}>Visión Global en Vivo</h5>
                    <Button variant="outline-primary" className="w-100 fw-bold py-2 mb-2" onClick={() => setShowFichasModal(true)} style={{ borderRadius: '12px' }}>
                      Ver Todas las Citas Agendadas
                    </Button>
                  </div>
                  <hr className="my-2" style={{ borderColor: isDarkMode ? '#334155' : '#dee2e6' }} />
                  <div className="mt-auto">
                     <h6 className="fw-bold mb-2 text-danger">Herramientas de Mantenimiento</h6>
                     <Button variant="outline-danger" className="w-100 fw-bold py-2" onClick={handleBorrarCache} style={{ borderRadius: '12px' }}>
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
                    <h5 className="fw-bold mb-0" style={{ color: 'var(--color-principal)' }}>Accesos (Estudiantes)</h5>
                    <Button variant="outline-success" size="sm" onClick={() => setShowCreateModal(true)}>+ Nuevo Estudiante</Button>
                  </div>
                  
                  {loadingData ? (
                    <div className="text-center py-4"><Spinner animation="border" variant="success" /></div>
                  ) : (
                    <Table hover responsive className="align-middle">
                      <thead className="text-muted small">
                        <tr>
                          <th>RUT</th>
                          <th>ESTUDIANTE</th>
                          <th>ESTADO</th>
                          <th className="text-end">ACCIÓN</th>
                        </tr>
                      </thead>
                      <tbody>
                        {estudiantes.length === 0 ? (
                          <tr><td colSpan="4" className="text-center text-muted py-4">No hay estudiantes registrados.</td></tr>
                        ) : (
                          estudiantes.map(est => (
                            <tr key={est.id}>
                              <td className="text-secondary small">{est.rut || 'S/N'}</td>
                              <td className="fw-bold">
                                {est.nombre}
                                <span className="d-block text-secondary small fw-normal">{est.correo}</span>
                              </td>
                              <td><Badge bg={est.estado === 'Activo' ? 'success' : 'danger'}>{est.estado}</Badge></td>
                              <td className="text-end">
                                <Button variant="outline-warning" size="sm" className="me-2" onClick={() => { setEstudianteSeleccionado(est); setShowPasswordModal(true); }}>
                                  Reset Pass
                                </Button>
                                <Button variant={est.estado === 'Activo' ? 'outline-danger' : 'outline-success'} size="sm" onClick={() => handleToggleEstado(est.id, est.estado)}>
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
            <Modal.Header closeButton><Modal.Title className="fs-5 fw-bold" style={{ color: 'var(--color-principal)' }}>Crear Estudiante</Modal.Title></Modal.Header>
            <Modal.Body>
              <Form onSubmit={handleCreateEstudiante}>
                <Row className="mb-3">
                  <Col md={4}><Form.Label className="small fw-bold">RUT</Form.Label><Form.Control name="rut" value={formData.rut} onChange={handleChange} required /></Col>
                  <Col md={8}><Form.Label className="small fw-bold">Nombre</Form.Label><Form.Control name="nombre" value={formData.nombre} onChange={handleChange} required /></Col>
                </Row>
                <Form.Group className="mb-3"><Form.Label className="small fw-bold">Correo @csj.cl</Form.Label><Form.Control type="email" name="correo" value={formData.correo} onChange={handleChange} required /></Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label className="small fw-bold">Carrera</Form.Label>
                  <Form.Select name="carrera" value={formData.carrera} onChange={handleChange}>
                    <option value="Técnico Jurídico">Técnico Jurídico</option>
                    <option value="Servicio Social">Servicio Social</option>
                    <option value="Técnico Trabajo Social">Técnico Trabajo Social</option>
                  </Form.Select>
                </Form.Group>
                <Form.Group className="mb-4"><Form.Label className="small fw-bold">Contraseña</Form.Label><Form.Control type="password" name="password" value={formData.password} onChange={handleChange} required minLength={6} /></Form.Group>
                <Button type="submit" className="w-100 fw-bold" style={{ backgroundColor: 'var(--color-principal)', border: 'none' }} disabled={saving}>{saving ? <Spinner size="sm"/> : 'Registrar'}</Button>
              </Form>
            </Modal.Body>
          </Modal>

          {/* Modal: Resetear Contraseña */}
          <Modal show={showPasswordModal} onHide={() => setShowPasswordModal(false)} centered>
            <Modal.Header closeButton><Modal.Title className="fs-5 fw-bold">Resetear Contraseña</Modal.Title></Modal.Header>
            <Modal.Body>
              <Form onSubmit={handleCambiarPassword}>
                <p className="text-muted small mb-4">Actualizar credenciales de acceso para <strong>{estudianteSeleccionado?.nombre}</strong>.</p>
                <Form.Group className="mb-4">
                  <Form.Label className="small fw-bold">Nueva Contraseña Temporal</Form.Label>
                  <Form.Control type="text" value={nuevaPassword} onChange={(e) => setNuevaPassword(e.target.value)} required minLength={6} />
                </Form.Group>
                <Button type="submit" variant="warning" className="w-100 fw-bold" disabled={saving}>{saving ? <Spinner size="sm"/> : 'Confirmar Cambio'}</Button>
              </Form>
            </Modal.Body>
          </Modal>

          {/* Modal: Enviar Aviso Global */}
          <Modal show={showAvisoModal} onHide={() => setShowAvisoModal(false)} centered>
            <Modal.Header closeButton><Modal.Title className="fs-5 fw-bold">Enviar Aviso Global</Modal.Title></Modal.Header>
            <Modal.Body>
              <Form onSubmit={handleEnviarAviso}>
                <p className="text-muted small mb-3">Este mensaje aparecerá en el Muro de Avisos de la plataforma pública e interna.</p>
                <Form.Group className="mb-4">
                  <Form.Label className="small fw-bold">Mensaje de Mantenimiento / Aviso</Form.Label>
                  <Form.Control as="textarea" rows={3} value={avisoTexto} onChange={(e) => setAvisoTexto(e.target.value)} placeholder="Ej: Plataforma en mantenimiento el viernes a las 18:00 hrs..." required />
                </Form.Group>
                <Button type="submit" className="w-100 fw-bold" style={{ backgroundColor: 'var(--color-principal)', border: 'none' }} disabled={saving}>{saving ? <Spinner size="sm"/> : 'Publicar Aviso'}</Button>
              </Form>
            </Modal.Body>
          </Modal>

          {/* Modal: Visor de Citas/Fichas Agendadas */}
          <Modal show={showFichasModal} onHide={() => setShowFichasModal(false)} size="lg" centered>
            <Modal.Header closeButton><Modal.Title className="fw-bold" style={{ color: 'var(--color-principal)' }}>Citas Agendadas en Vivo</Modal.Title></Modal.Header>
            <Modal.Body>
              {citasAgendadas.length === 0 ? (
                <div className="text-center py-5">
                  <h5 className="text-muted fw-bold">No hay citas agendadas</h5>
                  <p className="text-muted small">El sistema está a la espera de nuevas solicitudes desde la plataforma pública.</p>
                </div>
              ) : (
                <Table hover responsive size="sm" className="align-middle">
                  <thead><tr><th>Fecha</th><th>Hora</th><th>Motivo</th><th>Estado</th></tr></thead>
                  <tbody>
                    {citasAgendadas.map((cita) => (
                      <tr key={cita.id}>
                        <td>{cita.fecha}</td>
                        <td>{cita.hora}</td>
                        <td>{cita.motivo || 'N/A'}</td>
                        <td><Badge bg={cita.estado === 'Confirmada' ? 'success' : cita.estado === 'Pendiente' ? 'warning' : 'secondary'}>{cita.estado}</Badge></td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              )}
            </Modal.Body>
          </Modal>

        </Container>
      </div>
    </>
  );
};

export default PanelSoporte;