import { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Table, Badge, Modal, Form, Spinner } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { createClient } from '@supabase/supabase-js';
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
  const [showInboxModal, setShowInboxModal] = useState(false);
  const [showPasswordRequestsModal, setShowPasswordRequestsModal] = useState(false);
  
  // Estados de datos
  const [saving, setSaving] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  const [usuarios, setUsuarios] = useState([]);
  const [citasAgendadas, setCitasAgendadas] = useState([]);
  const [mensajesSoporte, setMensajesSoporte] = useState([]);
  const [solicitudesPassword, setSolicitudesPassword] = useState([]); 
  const [perfilSoporte, setPerfilSoporte] = useState({ nombre: 'Cargando...', rol: 'Soporte TI' });
  
  // Estados de selección y formularios
  const [usuarioSeleccionado, setUsuarioSeleccionado] = useState(null);
  const [nuevaPassword, setNuevaPassword] = useState('');
  const [avisoTexto, setAvisoTexto] = useState('');
  
  const [formData, setFormData] = useState({
    rut: '', nombre: '', correo: '', password: '', rol: 'estudiante', carreraSelect: 'Técnico Jurídico', carreraOtro: ''
  });

  useEffect(() => {
    fetchDatosSoporte();
    fetchUsuarios();
    fetchCitasAgendadas(true);
    fetchMensajesSoporte();
    fetchSolicitudesPassword();

    // Suscripciones en tiempo real
    const channels = supabase.channel('soporte-channels')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'appointments' }, () => {
        fetchCitasAgendadas(true);
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'mensajes_soporte' }, () => {
        fetchMensajesSoporte();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'solicitudes_password' }, () => {
        fetchSolicitudesPassword(); 
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channels);
    };
  }, []);

  const fetchDatosSoporte = async () => {
    try {
      const { data: authData } = await supabase.auth.getUser();
      if (authData?.user) {
        const { data: perfil } = await supabase.from('perfiles').select('nombre, rol').eq('id', authData.user.id).single();
        if (perfil) setPerfilSoporte({ nombre: perfil.nombre, rol: perfil.rol || 'Soporte TI' });
      }
    } catch (error) {
      console.error("Error al cargar perfil de soporte:", error);
    }
  };

  const fetchUsuarios = async () => {
    try {
      // Obtenemos el ID actual para no mostrarlo en la tabla (y evitar auto-eliminarse)
      const { data: authData } = await supabase.auth.getUser();
      const currentUserId = authData?.user?.id;

      let query = supabase
        .from('perfiles')
        .select('*')
        .order('created_at', { ascending: false });
        
      if (currentUserId) {
        query = query.neq('id', currentUserId);
      }

      const { data, error } = await query;
      if (error) throw error;
      setUsuarios(data || []);
    } catch (error) {
      console.error("Error al cargar usuarios:", error.message);
    } finally {
      setLoadingData(false);
    }
  };

  const fetchCitasAgendadas = async (silencioso = false) => {
    try {
      const { data, error } = await supabase.from('appointments').select('*').order('fecha_cita', { ascending: true });
      if (error) throw error;
      setCitasAgendadas(data || []);
    } catch (error) {
      console.error("Error al cargar citas:", error.message);
    }
  };

  const fetchMensajesSoporte = async () => {
    try {
      const { data, error } = await supabase
        .from('mensajes_soporte')
        .select('*, perfiles(nombre, correo)')
        .order('created_at', { ascending: false });
      if (error) throw error;
      setMensajesSoporte(data || []);
    } catch (error) {
      console.error("Error al cargar mensajes:", error.message);
    }
  };

  const fetchSolicitudesPassword = async () => {
    setRefreshing(true);
    try {
      const { data, error } = await supabase
        .from('solicitudes_password')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      setSolicitudesPassword(data || []);
    } catch (error) {
      console.error("Error al cargar solicitudes de clave:", error.message);
    } finally {
      setRefreshing(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleCreateUsuario = async (e) => {
    e.preventDefault();
    if (!formData.correo.endsWith('@csj.cl')) return alert("El correo debe pertenecer al dominio @csj.cl");
    setSaving(true);
    
    try {
      const supabaseSignup = createClient(
        import.meta.env.VITE_SUPABASE_URL,
        import.meta.env.VITE_SUPABASE_ANON_KEY,
        { auth: { persistSession: false, autoRefreshToken: false } }
      );

      const { data: authData, error: authError } = await supabaseSignup.auth.signUp({ 
        email: formData.correo, 
        password: formData.password 
      });
      
      if (authError) throw authError;

      if (authData.user) {
        let carreraFinal = null;
        if (formData.rol === 'estudiante') {
          carreraFinal = formData.carreraSelect === 'Otro' ? formData.carreraOtro : formData.carreraSelect;
        }

        const { error: profileError } = await supabase.from('perfiles').insert([{ 
          id: authData.user.id, 
          rut: formData.rut, 
          nombre: formData.nombre, 
          correo: formData.correo, 
          rol: formData.rol,
          carrera: carreraFinal
        }]);
        
        if (profileError) throw profileError;
      }
      
      alert(`Cuenta creada exitosamente para ${formData.nombre} como ${formData.rol}.`);
      fetchUsuarios(); 
      setShowCreateModal(false);
      setFormData({ rut: '', nombre: '', correo: '', password: '', rol: 'estudiante', carreraSelect: 'Técnico Jurídico', carreraOtro: '' });
    } catch (error) {
      alert('Error al crear la cuenta: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDownloadExcel = async () => {
    try {
      const { data: usuariosData, error } = await supabase.from('perfiles').select('rut, nombre, correo, rol, estado, created_at');
      if (error) throw error;
      const datosExcel = usuariosData.map(usr => ({ 
        'RUT': usr.rut || 'S/N', 
        'Nombre': usr.nombre, 
        'Correo': usr.correo, 
        'Rol': usr.rol,
        'Estado': usr.estado, 
        'Fecha Creación': new Date(usr.created_at).toLocaleDateString('es-CL') 
      }));
      const worksheet = XLSX.utils.json_to_sheet(datosExcel);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Usuarios");
      XLSX.writeFile(workbook, `Reporte_Usuarios_${new Date().toLocaleDateString('es-CL')}.xlsx`);
    } catch (error) {
      alert("Hubo un error al generar el reporte.");
    }
  };

  const handleEliminarUsuario = async (id, nombre) => {
    if (!window.confirm(`¿Estás seguro de que deseas eliminar permanentemente al usuario ${nombre}? Esta acción no se puede deshacer.`)) {
      return;
    }
    try {
      const { error } = await supabase.from('perfiles').delete().eq('id', id);
      if (error) throw error;
      
      alert(`Usuario ${nombre} eliminado correctamente.`);
      fetchUsuarios();
    } catch (error) {
      console.error("Error al eliminar usuario:", error);
      alert("Hubo un error al eliminar el usuario.");
    }
  };

  const handleBorrarCache = () => {
    if (window.confirm("¿Forzar recarga y limpiar caché?")) {
      setUsuarios([]);
      setLoadingData(true);
      setTimeout(() => { fetchUsuarios(); alert("Caché limpiada y datos recargados."); }, 500);
    }
  };

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

  const handleCambiarPassword = (e) => {
    e.preventDefault();
    setSaving(true);
    setTimeout(() => {
      alert(`Contraseña actualizada exitosamente para ${usuarioSeleccionado?.nombre}. (Simulación UI)`);
      setSaving(false);
      setShowPasswordModal(false);
      setNuevaPassword('');
    }, 800);
  };

  const handleResolverMensaje = async (id) => {
    try {
      const { error } = await supabase.from('mensajes_soporte').update({ estado: 'Resuelto' }).eq('id', id);
      if (error) throw error;
      fetchMensajesSoporte();
    } catch (error) {
      alert("Error al actualizar el ticket.");
    }
  };

  const handleResolverSolicitudPassword = async (id, nuevoEstado, correo) => {
    try {
      const { error } = await supabase.from('solicitudes_password').update({ estado: nuevoEstado }).eq('id', id);
      if (error) throw error;
      
      if (nuevoEstado === 'Aprobado') {
        const { error: resetError } = await supabase.auth.resetPasswordForEmail(correo);
        if (resetError) throw resetError;
        alert(`✅ Solicitud aprobada. Se ha enviado un correo con el enlace de recuperación a ${correo}.`);
      } else {
        alert(`❌ Solicitud denegada para ${correo}.`);
      }

      fetchSolicitudesPassword();
    } catch (error) {
      alert("Error al gestionar la solicitud: " + error.message);
    }
  };

  const mensajesPendientes = mensajesSoporte.filter(m => m.estado === 'Pendiente');
  const solicitudesPendientes = solicitudesPassword.filter(s => s.estado === 'Pendiente');

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
          <div className="d-flex justify-content-between align-items-center mb-4">
            <div className="d-flex align-items-center gap-3">
              <img src={logoCSJ} alt="Logo" style={{ maxWidth: '60px' }} onError={(e) => e.target.style.display = 'none'} />
              <div>
                <h2 style={{ color: isDarkMode ? '#78BE20' : 'var(--color-principal)', fontWeight: 'bold', margin: 0 }}>Panel de Soporte TI</h2>
                <p className="text-muted mb-0">
                  <span className="fw-bold">{perfilSoporte.nombre}</span> | <span className="text-capitalize">{perfilSoporte.rol}</span> | CSJ
                </p>
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
            <Col md={4}>
              <Card className="border-0 shadow-sm h-100" style={{ borderRadius: '15px' }}>
                <Card.Body className="d-flex flex-column gap-3">
                  
                  <div>
                    <h5 className="fw-bold mb-3" style={{ color: 'var(--color-principal)' }}>Atención al Usuario</h5>
                    
                    <Button 
                      variant="outline-danger" 
                      className="w-100 fw-bold d-flex align-items-center justify-content-between py-2 mb-2" 
                      onClick={() => setShowInboxModal(true)} 
                      style={{ borderRadius: '12px' }}
                    >
                      <div className="d-flex align-items-center gap-2">
                        <span>📥</span> Bandeja de Soporte
                      </div>
                      {mensajesPendientes.length > 0 && <Badge bg="danger" className="rounded-pill">{mensajesPendientes.length}</Badge>}
                    </Button>

                    <Button 
                      variant="outline-warning" 
                      className="w-100 fw-bold d-flex align-items-center justify-content-between py-2 mb-2" 
                      onClick={() => setShowPasswordRequestsModal(true)} 
                      style={{ borderRadius: '12px' }}
                    >
                      <div className="d-flex align-items-center gap-2">
                        <span>🔑</span> Solicitudes de Clave
                      </div>
                      {solicitudesPendientes.length > 0 && <Badge bg="warning" text="dark" className="rounded-pill">{solicitudesPendientes.length}</Badge>}
                    </Button>
                  </div>
                  <hr className="my-2" style={{ borderColor: isDarkMode ? '#334155' : '#dee2e6' }} />

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

            <Col md={8}>
              <Card className="border-0 shadow-sm h-100" style={{ borderRadius: '15px' }}>
                <Card.Body>
                  <div className="d-flex justify-content-between align-items-center mb-4">
                    <h5 className="fw-bold mb-0" style={{ color: 'var(--color-principal)' }}>Control de Accesos (Usuarios)</h5>
                    <Button variant="outline-success" size="sm" onClick={() => setShowCreateModal(true)}>+ Crear Usuario</Button>
                  </div>
                  
                  {loadingData ? (
                    <div className="text-center py-4"><Spinner animation="border" variant="success" /></div>
                  ) : (
                    <Table hover responsive className="align-middle">
                      <thead className="text-muted small">
                        <tr>
                          <th>RUT</th>
                          <th>USUARIO / ROL</th>
                          <th>ESTADO</th>
                          <th className="text-end">ACCIÓN</th>
                        </tr>
                      </thead>
                      <tbody>
                        {usuarios.length === 0 ? (
                          <tr><td colSpan="4" className="text-center text-muted py-4">No hay usuarios registrados.</td></tr>
                        ) : (
                          usuarios.map(usr => (
                            <tr key={usr.id}>
                              <td className="text-secondary small">{usr.rut || 'S/N'}</td>
                              <td>
                                <span className="fw-bold">{usr.nombre}</span>
                                <span className="d-block text-secondary small fw-normal">{usr.correo}</span>
                                <Badge bg="info" className="mt-1 text-uppercase" style={{ fontSize: '0.65rem' }}>{usr.rol}</Badge>
                              </td>
                              <td><Badge bg={usr.estado === 'Activo' ? 'success' : 'danger'}>{usr.estado || 'Activo'}</Badge></td>
                              <td className="text-end">
                                <Button variant="outline-warning" size="sm" className="me-2" onClick={() => { setUsuarioSeleccionado(usr); setShowPasswordModal(true); }}>
                                  Reset Pass
                                </Button>
                                <Button variant="outline-danger" size="sm" onClick={() => handleEliminarUsuario(usr.id, usr.nombre)}>
                                  Eliminar
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

          {/* Modal Bandeja de Soporte */}
          <Modal show={showInboxModal} onHide={() => setShowInboxModal(false)} size="lg" centered>
            <Modal.Header closeButton>
              <Modal.Title className="fw-bold text-danger">📥 Bandeja de Soporte TI</Modal.Title>
            </Modal.Header>
            <Modal.Body style={{ maxHeight: '60vh', overflowY: 'auto' }}>
              {mensajesSoporte.length === 0 ? (
                <div className="text-center py-5">
                  <h5 className="text-muted fw-bold">Bandeja Vacía</h5>
                  <p className="text-muted small">No hay tickets de soporte registrados.</p>
                </div>
              ) : (
                <div className="d-flex flex-column gap-3">
                  {mensajesSoporte.map(msg => (
                    <Card key={msg.id} className="border-0 shadow-sm" style={{ backgroundColor: isDarkMode ? '#0f172a' : '#f8f9fa' }}>
                      <Card.Body>
                        <div className="d-flex justify-content-between align-items-start mb-2">
                          <div>
                            <h6 className="fw-bold mb-1">{msg.asunto}</h6>
                            <span className="small text-muted fw-bold d-block">De: {msg.perfiles?.nombre} ({msg.perfiles?.correo})</span>
                            <span className="small text-muted">{new Date(msg.created_at).toLocaleString('es-CL')}</span>
                          </div>
                          <Badge bg={msg.estado === 'Pendiente' ? 'warning' : 'success'} text={msg.estado === 'Pendiente' ? 'dark' : 'light'}>
                            {msg.estado}
                          </Badge>
                        </div>
                        <p className="small mb-3 mt-2" style={{ whiteSpace: 'pre-wrap' }}>{msg.mensaje}</p>
                        {msg.estado === 'Pendiente' && (
                          <div className="text-end">
                            <Button variant="outline-success" size="sm" onClick={() => handleResolverMensaje(msg.id)}>
                              ✓ Marcar como Resuelto
                            </Button>
                          </div>
                        )}
                      </Card.Body>
                    </Card>
                  ))}
                </div>
              )}
            </Modal.Body>
          </Modal>

          {/* MODAL: Solicitudes de Recuperación de Contraseña */}
          <Modal show={showPasswordRequestsModal} onHide={() => setShowPasswordRequestsModal(false)} size="lg" centered>
            <Modal.Header closeButton>
              <Modal.Title className="fw-bold text-warning">🔑 Solicitudes de Recuperación</Modal.Title>
            </Modal.Header>
            <Modal.Body style={{ maxHeight: '60vh', overflowY: 'auto' }}>
              
              <div className="d-flex justify-content-between align-items-center mb-3">
                <p className="text-muted small mb-0">Listado en tiempo real de peticiones anónimas</p>
                <Button variant="outline-secondary" size="sm" onClick={fetchSolicitudesPassword} disabled={refreshing}>
                  {refreshing ? <Spinner size="sm" /> : '🔄 Actualizar Manualmente'}
                </Button>
              </div>

              {solicitudesPassword.length === 0 ? (
                <div className="text-center py-5">
                  <h5 className="text-muted fw-bold">Bandeja Vacía</h5>
                  <p className="text-muted small">No hay solicitudes de recuperación de contraseña pendientes.</p>
                </div>
              ) : (
                <div className="d-flex flex-column gap-3">
                  {solicitudesPassword.map(solicitud => (
                    <Card key={solicitud.id} className="border-0 shadow-sm" style={{ backgroundColor: isDarkMode ? '#0f172a' : '#f8f9fa' }}>
                      <Card.Body>
                        <div className="d-flex justify-content-between align-items-start mb-2">
                          <div>
                            <h6 className="fw-bold mb-1">Solicitud de Restablecimiento</h6>
                            <span className="small text-muted fw-bold d-block">Correo: {solicitud.correo}</span>
                            <span className="small text-muted">{new Date(solicitud.created_at).toLocaleString('es-CL')}</span>
                          </div>
                          <Badge bg={solicitud.estado === 'Pendiente' ? 'warning' : solicitud.estado === 'Aprobado' ? 'success' : 'danger'} text={solicitud.estado === 'Pendiente' ? 'dark' : 'light'}>
                            {solicitud.estado}
                          </Badge>
                        </div>
                        {solicitud.estado === 'Pendiente' && (
                          <div className="text-end mt-3">
                            <Button variant="outline-danger" size="sm" className="me-2" onClick={() => handleResolverSolicitudPassword(solicitud.id, 'Denegado', solicitud.correo)}>
                              ❌ Denegar
                            </Button>
                            <Button variant="outline-success" size="sm" onClick={() => handleResolverSolicitudPassword(solicitud.id, 'Aprobado', solicitud.correo)}>
                              ✓ Permitir y Restablecer
                            </Button>
                          </div>
                        )}
                      </Card.Body>
                    </Card>
                  ))}
                </div>
              )}
            </Modal.Body>
          </Modal>

          {/* Modal: Crear Usuario */}
          <Modal show={showCreateModal} onHide={() => setShowCreateModal(false)} centered>
            <Modal.Header closeButton><Modal.Title className="fs-5 fw-bold" style={{ color: 'var(--color-principal)' }}>Crear Nuevo Usuario</Modal.Title></Modal.Header>
            <Modal.Body>
              <Form onSubmit={handleCreateUsuario}>
                
                <Form.Group className="mb-3">
                  <Form.Label className="small fw-bold">Rol del Usuario</Form.Label>
                  {/* CAMBIO: Se añadió la opción Soporte TI */}
                  <Form.Select name="rol" value={formData.rol} onChange={handleChange}>
                    <option value="estudiante">Estudiante</option>
                    <option value="coordinadora">Coordinadora</option>
                    <option value="supervisor">Supervisor</option>
                    <option value="soporte">Soporte TI</option>
                  </Form.Select>
                </Form.Group>

                <Row className="mb-3">
                  <Col md={4}><Form.Label className="small fw-bold">RUT</Form.Label><Form.Control name="rut" value={formData.rut} onChange={handleChange} required /></Col>
                  <Col md={8}><Form.Label className="small fw-bold">Nombre</Form.Label><Form.Control name="nombre" value={formData.nombre} onChange={handleChange} required /></Col>
                </Row>
                
                <Form.Group className="mb-3">
                  <Form.Label className="small fw-bold">Correo @csj.cl</Form.Label>
                  <Form.Control type="email" name="correo" value={formData.correo} onChange={handleChange} required />
                </Form.Group>

                {/* Mostrar opciones de carrera solo si el rol es estudiante */}
                {formData.rol === 'estudiante' && (
                  <Form.Group className="mb-3">
                    <Form.Label className="small fw-bold">Carrera</Form.Label>
                    <Form.Select name="carreraSelect" value={formData.carreraSelect} onChange={handleChange}>
                      <option value="Técnico Jurídico">Técnico Jurídico</option>
                      <option value="Servicio Social">Servicio Social</option>
                      <option value="Técnico Trabajo Social">Técnico Trabajo Social</option>
                      <option value="Otro">Otro...</option>
                    </Form.Select>
                    
                    {formData.carreraSelect === 'Otro' && (
                      <Form.Control 
                        className="mt-2" 
                        name="carreraOtro" 
                        placeholder="Especifique la carrera" 
                        value={formData.carreraOtro} 
                        onChange={handleChange} 
                        required 
                      />
                    )}
                  </Form.Group>
                )}

                <Form.Group className="mb-4">
                  <Form.Label className="small fw-bold">Contraseña Temporal</Form.Label>
                  <Form.Control type="password" name="password" value={formData.password} onChange={handleChange} required minLength={6} />
                </Form.Group>
                
                <Button type="submit" className="w-100 fw-bold" style={{ backgroundColor: 'var(--color-principal)', border: 'none' }} disabled={saving}>
                  {saving ? <Spinner size="sm"/> : 'Registrar Cuenta'}
                </Button>
              </Form>
            </Modal.Body>
          </Modal>

          {/* Modal: Resetear Contraseña */}
          <Modal show={showPasswordModal} onHide={() => setShowPasswordModal(false)} centered>
            <Modal.Header closeButton><Modal.Title className="fs-5 fw-bold">Resetear Contraseña</Modal.Title></Modal.Header>
            <Modal.Body>
              <Form onSubmit={handleCambiarPassword}>
                <p className="text-muted small mb-4">Actualizar credenciales de acceso para <strong>{usuarioSeleccionado?.nombre}</strong>.</p>
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
                        <td>{cita.fecha_cita}</td>
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