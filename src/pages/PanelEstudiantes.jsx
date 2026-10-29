import { useState, useEffect } from 'react';
import { Row, Col, Button, Badge, Spinner, Modal, Dropdown, Form } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css'; 
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import './PanelEstudiantes.css';

const PanelEstudiante = () => {
  const [time, setTime] = useState(new Date());
  const [isDarkMode, setIsDarkMode] = useState(false);
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [perfil, setPerfil] = useState({ id: '', nombre: 'Cargando...', carrera: 'Cargando...', rut: '', rol: '' });
  const [stats, setStats] = useState({ totalFichas: 0, totalCitas: 0, totalCharlas: 0 });
  const [participantes, setParticipantes] = useState([]);
  
  const [fechaSeleccionada, setFechaSeleccionada] = useState(new Date());
  const [misCitas, setMisCitas] = useState([]);
  const [avisosRecientes, setAvisosRecientes] = useState([]);
  const [avisosOcultos, setAvisosOcultos] = useState([]);

  // Modales
  const [showAvisoModal, setShowAvisoModal] = useState(false);
  const [avisoSeleccionado, setAvisoSeleccionado] = useState(null);
  
  const [showSupportModal, setShowSupportModal] = useState(false);
  const [supportData, setSupportData] = useState({ asunto: '', mensaje: '' });
  const [sendingSupport, setSendingSupport] = useState(false);

  // Modal Recordatorio de citas
  const [showRecordatorioModal, setShowRecordatorioModal] = useState(false);
  const [citasDelDiaSeleccionado, setCitasDelDiaSeleccionado] = useState([]);

  // EXTRAEMOS LA LISTA DE USUARIOS ONLINE DESDE EL CONTEXTO GLOBAL (AuthContext)
  const { usuariosOnline } = useAuth();

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    let avisosChannel;

    const fetchDatosSistema = async () => {
      try {
        const { data: authData, error: authError } = await supabase.auth.getUser();
        if (authError || !authData?.user) throw authError;
        const userId = authData.user.id;

        const [
          perfilRes, fichasRes, citasRes, charlasRes, usuariosRes, misCitasRes, avisosRes
        ] = await Promise.all([
          // EXTRAEMOS EL RUT DE LA BASE DE DATOS TAMBIÉN
          supabase.from('perfiles').select('id, nombre, rol, carrera, rut').eq('id', userId).single(),
          supabase.from('social_records').select('*', { count: 'exact', head: true }).eq('professional_id', userId),
          supabase.from('appointments').select('*', { count: 'exact', head: true }),
          supabase.from('talks').select('*', { count: 'exact', head: true }),
          supabase.from('perfiles').select('id, nombre, estado, created_at, rol').neq('id', userId).order('nombre', { ascending: true }),
          supabase.from('appointments').select('id, fecha_cita, hora_cita, estado, nombre, rut').eq('estudiante_id', userId),
          supabase.from('information').select('*').in('categoria', ['IMPORTANTE', 'Salida', 'Recordatorio']).order('fecha_publicacion', { ascending: false }).limit(5)
        ]);

        if (perfilRes.data) {
          setPerfil({
            id: perfilRes.data.id,
            nombre: perfilRes.data.nombre,
            carrera: perfilRes.data.carrera || 'No especificada',
            rut: perfilRes.data.rut || 'No registrado',
            rol: perfilRes.data.rol
          });
        }

        setStats({
          totalFichas: fichasRes.count || 0,
          totalCitas: citasRes.count || 0,
          totalCharlas: charlasRes.count || 0
        });

        if (usuariosRes.data) setParticipantes(usuariosRes.data);
        if (misCitasRes.data) setMisCitas(misCitasRes.data);
        if (avisosRes.data) setAvisosRecientes(avisosRes.data);

        // NOTIFICACIONES AVISOS (Realtime)
        if (avisosChannel) {
          await supabase.removeChannel(avisosChannel);
        }

        avisosChannel = supabase.channel('avisos-estudiantes');
        
        avisosChannel.on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'information' }, (payload) => {
          const nuevoAviso = payload.new;
          if (['IMPORTANTE', 'Salida', 'Recordatorio'].includes(nuevoAviso.categoria)) {
            setAvisosRecientes(prevAvisos => [nuevoAviso, ...prevAvisos].slice(0, 5));
          }
        });

        avisosChannel.subscribe();

      } catch (error) {
        console.error("Error al cargar datos:", error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchDatosSistema();

    return () => {
      if (avisosChannel) supabase.removeChannel(avisosChannel);
    };
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  const handleEnviarReporteOutlook = () => {
    window.open('https://outlook.live.com/mail/0/deeplink/compose?to=coordinadora@csj.cl&subject=Reporte%20Diario%20de%20Turno', '_blank');
  };

  const handleEnviarEvidenciasGmail = () => {
    window.open('https://mail.google.com/mail/?view=cm&fs=1&to=evidencias@csj.cl&su=Evidencias%20Casos%20Juridicos', '_blank');
  };

  const handleSendSupport = async (e) => {
    e.preventDefault();
    setSendingSupport(true);
    try {
      const { error } = await supabase.from('mensajes_soporte').insert([{
        estudiante_id: perfil.id,
        asunto: supportData.asunto,
        mensaje: supportData.mensaje
      }]);
      if (error) throw error;
      alert("Mensaje enviado a Soporte TI exitosamente.");
      setShowSupportModal(false);
      setSupportData({ asunto: '', mensaje: '' });
    } catch (error) {
      alert("Error al enviar el mensaje: " + error.message);
    } finally {
      setSendingSupport(false);
    }
  };

  const handleOcultarAviso = (e, avisoId) => {
    e.stopPropagation();
    setAvisosOcultos([...avisosOcultos, avisoId]);
  };

  const handleEliminarAviso = async (e, avisoId) => {
    e.stopPropagation();
    if (!window.confirm("¿Estás seguro de eliminar este aviso permanentemente de la base de datos?")) return;

    try {
      const { error } = await supabase.from('information').delete().eq('id', avisoId);
      if (error) throw error;
      setAvisosRecientes(avisosRecientes.filter(aviso => aviso.id !== avisoId));
    } catch (error) {
      console.error(error);
      alert("Error al eliminar. Puede que no tengas permisos RLS para borrar avisos.");
    }
  };

  const formatearFecha = (fechaISO) => {
    const fecha = new Date(fechaISO);
    return fecha.toLocaleDateString('es-CL', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
  };

  const fechaFormateada = fechaSeleccionada.toISOString().split('T')[0];
  const citasDelDiaText = misCitas.filter(cita => cita.fecha_cita === fechaFormateada);

  const getCitasForDate = (date) => {
    const offset = date.getTimezoneOffset()
    const localDate = new Date(date.getTime() - (offset*60*1000))
    const formattedDate = localDate.toISOString().split('T')[0];
    return misCitas.filter(cita => cita.fecha_cita === formattedDate);
  };

  const tileClassName = ({ date, view }) => {
    if (view === 'month') {
      const citasDia = getCitasForDate(date);
      if (citasDia.length > 0) {
        return 'has-citas'; 
      }
    }
    return null;
  };

  const handleDayClick = (value) => {
    setFechaSeleccionada(value);
    const citasDia = getCitasForDate(value);
    if (citasDia.length > 0) {
      setCitasDelDiaSeleccionado(citasDia);
      setShowRecordatorioModal(true);
    }
  };

  const getEstiloAvisoDinámico = (categoria) => {
    switch (categoria) {
      case 'IMPORTANTE':
        return { borderLeft: '4px solid #dc3545', background: 'linear-gradient(135deg, rgba(220, 53, 69, 0.05), rgba(220, 53, 69, 0.01))', headerBg: '#dc3545', headerText: 'white', icon: '🔴' };
      case 'Salida':
        return { borderLeft: '4px solid #ffc107', background: 'linear-gradient(135deg, rgba(255, 193, 7, 0.05), rgba(255, 193, 7, 0.01))', headerBg: '#ffc107', headerText: 'dark', icon: '🟡' };
      case 'Recordatorio':
        return { borderLeft: '4px solid #0dcaf0', background: 'linear-gradient(135deg, rgba(13, 202, 240, 0.05), rgba(13, 202, 240, 0.01))', headerBg: '#0dcaf0', headerText: 'dark', icon: '🔵' };
      default:
        return { borderLeft: '4px solid #0d6efd', background: 'linear-gradient(135deg, rgba(13, 110, 253, 0.05), rgba(13, 110, 253, 0.01))', headerBg: '#0d6efd', headerText: 'white', icon: '📰' };
    }
  };

  const getRoleBadgeColor = (rol) => {
    switch (rol) {
      case 'coordinadora': return 'danger';
      case 'soporte': return 'dark';
      default: return 'primary';
    }
  };

  if (loading) {
    return (
      <div className={`d-flex justify-content-center align-items-center vh-100 ${isDarkMode ? 'bg-dark' : 'bg-light'}`}>
        <Spinner animation="border" style={{ color: 'var(--color-principal, #006A38)' }} />
      </div>
    );
  }

  const avisosVisibles = avisosRecientes.filter(aviso => !avisosOcultos.includes(aviso.id));

  return (
    <div className={`estudiante-wrapper ${isDarkMode ? 'dark-mode' : ''}`}>
      
      <div className="d-flex justify-content-between mb-4 align-items-center animate-up" style={{ position: 'relative', zIndex: 9999 }}>
        
        {/* LOGO SUPERIOR (Ya no abre modal) */}
 
        <div className="d-none d-lg-flex justify-content-center flex-grow-1 px-4">
          <img 
            src="/assets/banner-encabezado.png" 
            alt="Banner Estudiante"
            className="img-fluid"
            style={{ maxHeight: '60px', objectFit: 'contain' }}
            onError={(e) => e.target.style.display = 'none'}
          />
        </div>

        <div className="d-flex align-items-center gap-3" style={{ minWidth: '200px', justifyContent: 'flex-end' }}>
          <div className="fw-bolder fs-5 d-none d-md-block" style={{ color: isDarkMode ? '#f8fafc' : '#212529', letterSpacing: '1px' }}>
            {time.toLocaleTimeString('es-CL')}
          </div>

          <Button
            variant={isDarkMode ? 'outline-light' : 'outline-dark'}
            className="rounded-circle d-flex align-items-center justify-content-center"
            style={{ width: '45px', height: '45px', border: '2px solid' }}
            onClick={() => setIsDarkMode(!isDarkMode)}
            title="Alternar modo oscuro"
          >
            {isDarkMode ? '☀️' : '🌙'}
          </Button>

          <Dropdown align="end">
            <Dropdown.Toggle variant="link" className="p-0 text-decoration-none shadow-none text-dark" id="dropdown-notificaciones" bsPrefix="p-0">
              <div className="position-relative" style={{ cursor: 'pointer', fontSize: '1.8rem' }}>
                🔔
                {avisosVisibles.length > 0 && (
                  <Badge bg="danger" className="position-absolute top-0 start-100 translate-middle rounded-pill border border-2 border-white" style={{ fontSize: '0.65rem' }}>
                    {avisosVisibles.length}
                  </Badge>
                )}
              </div>
            </Dropdown.Toggle>
            <Dropdown.Menu className="shadow-lg border-0 rounded-4 p-0" style={{ width: '320px', backgroundColor: isDarkMode ? '#1e1e1e' : '#fff' }}>
              <div className={`p-3 border-bottom d-flex justify-content-between align-items-center ${isDarkMode ? 'border-secondary' : ''}`}>
                <h6 className={`mb-0 fw-bold ${isDarkMode ? 'text-white' : 'text-dark'}`}>Notificaciones</h6>
              </div>
              <div style={{ maxHeight: '350px', overflowY: 'auto' }}>
                {avisosVisibles.length === 0 ? (
                  <div className="p-4 text-center text-muted small">No hay notificaciones recientes.</div>
                ) : (
                  avisosVisibles.map(aviso => (
                    <Dropdown.Item 
                      key={aviso.id} 
                      className={`text-wrap p-3 border-bottom d-flex gap-3 align-items-start ${isDarkMode ? 'text-light border-secondary hover-dark' : 'hover-light'}`}
                      onClick={() => { setAvisoSeleccionado(aviso); setShowAvisoModal(true); }}
                    >
                      <span className="fs-5">{getEstiloAvisoDinámico(aviso.categoria).icon}</span>
                      <div>
                        <strong className="d-block text-truncate" style={{ maxWidth: '220px', fontSize: '0.9rem' }}>{aviso.titulo}</strong>
                        <span className="small text-muted d-block">{aviso.categoria}</span>
                      </div>
                    </Dropdown.Item>
                  ))
                )}
              </div>
              <div className={`p-2 text-center ${isDarkMode ? 'bg-dark' : 'bg-light'} rounded-bottom-4`}>
                <Button variant="link" size="sm" className="text-decoration-none fw-bold" onClick={() => navigate('/panel-estudiante/informacion')}>
                  Ver todo el Muro
                </Button>
              </div>
            </Dropdown.Menu>
          </Dropdown>
        </div>
      </div>

      <Row className="g-4 flex-grow-1">
        {/* COLUMNA 1: Perfil, Comunicaciones y Soporte TI Abajo */}
        <Col lg={3} className="d-flex flex-column gap-4 animate-up delay-1">
          
          {/* 1. PERFIL INCRUSTADO EN PANTALLA */}
          <div className="panel-card text-center p-4">
            <div className="mb-3 mx-auto bg-white rounded-circle d-flex align-items-center justify-content-center p-2 shadow-sm" style={{ width: '100px', height: '100px', border: '3px solid var(--color-principal)' }}>
              <img src="/assets/LOGO_CSJ.png" alt="CSJ" className="img-fluid rounded-circle" onError={(e) => { e.target.src = 'https://ui-avatars.com/api/?name=CSJ&background=006A38&color=fff'; }} />
            </div>
            <h5 className="fw-bold mb-1" style={{ color: 'var(--color-principal)' }}>{perfil.nombre}</h5>
            <p className="mb-1 text-muted fw-semibold">{perfil.carrera}</p>
            <p className="mb-3 text-muted small">RUT: {perfil.rut}</p>
            <Badge bg="success" className="px-3 py-2 rounded-pill fs-6 mb-4 text-capitalize">{perfil.rol}</Badge>
            
            <Button variant={isDarkMode ? "outline-light" : "outline-danger"} className="w-100 rounded-pill fw-bold py-2" onClick={handleLogout}>
              Cerrar Sesión
            </Button>
          </div>

          {/* 2. COMUNICACIONES Y SOPORTE TI */}
          <div className="panel-card flex-grow-1 d-flex flex-column justify-content-between text-center p-4">
            <div>
              <h5 className="fw-bold mb-4" style={{ color: 'var(--color-principal, #006A38)' }}>Comunicaciones</h5>
              <div className="d-flex flex-column gap-3">
                <Button onClick={handleEnviarReporteOutlook} className="w-100 fw-bold py-3 rounded-4 shadow-sm" style={{ backgroundColor: '#0078D4', border: 'none' }}>
                  📧 Reporte Outlook
                </Button>
                <Button onClick={handleEnviarEvidenciasGmail} className="w-100 fw-bold py-3 rounded-4 text-white shadow-sm" style={{ backgroundColor: '#EA4335', border: 'none' }}>
                  📁 Evidencias Gmail
                </Button>
              </div>
            </div>

            <div className="mt-5 p-3 text-start rounded-4 shadow-sm" style={{ backgroundColor: isDarkMode ? '#1e293b' : '#fff', border: isDarkMode ? '1px solid #334155' : '1px solid #e2e8f0' }}>
              <h6 className="fw-bolder mb-1" style={{ color: '#dc3545' }}>¿Problemas con la plataforma?</h6>
              <p className="small text-muted mb-3">soporte@csj.cl</p>
              <Button variant="danger" size="sm" className="w-100 fw-bold" onClick={() => setShowSupportModal(true)}>
                ✉️ Enviar a Soporte
              </Button>
            </div>
          </div>
        </Col>

        {/* COLUMNA 2: Centro de Operaciones */}
        <Col lg={6} className="d-flex flex-column gap-4 animate-up delay-2">
          <div className="panel-card">
            <h5 className="fw-bold mb-4" style={{ color: 'var(--color-principal, #006A38)' }}>Accesos Rápidos</h5>
            <Row className="g-3">
              <Col sm={6}><button className="action-btn" onClick={() => navigate('/panel-estudiante/fichas')}><span className="fs-4">📂</span> Mis Fichas</button></Col>
              <Col sm={6}><button className="action-btn" onClick={() => navigate('/panel-estudiante/citas')}><span className="fs-4">📅</span> Mis Citas</button></Col>
              <Col sm={6}><button className="action-btn" onClick={() => navigate('/panel-estudiante/charlas')}><span className="fs-4">📢</span> Charlas</button></Col>
              <Col sm={6}><button className="action-btn" onClick={() => navigate('/panel-estudiante/informacion')}><span className="fs-4">📰</span> Información</button></Col>
              <Col sm={12}>
                <button 
                  className="action-btn w-100 justify-content-center" 
                  style={{ backgroundColor: isDarkMode ? 'rgba(25, 135, 84, 0.2)' : 'rgba(25, 135, 84, 0.1)', color: '#198754', border: '1px solid rgba(25, 135, 84, 0.3)' }}
                  onClick={() => window.open('https://aulasvirtuales.santotomas.cl/login/index.php', '_blank')}
                >
                  <span className="fs-4">🎓</span> Aula Virtual Santo Tomás
                </button>
              </Col>
            </Row>
          </div>

          <div className="panel-card mt-auto">
            <h5 className="fw-bold mb-3" style={{ color: 'var(--color-principal, #006A38)' }}>Resumen del Día</h5>
            <Row className="align-items-start">
              <Col md={12}>
                <div className="mb-3 d-flex justify-content-center">
                  <Calendar 
                    onClickDay={handleDayClick}
                    onChange={setFechaSeleccionada} 
                    value={fechaSeleccionada} 
                    tileClassName={tileClassName}
                    className="rounded-4 shadow-sm border-0 calendar-custom" 
                  />
                </div>
                <div className="p-3 rounded-4 text-center" style={{ backgroundColor: isDarkMode ? 'rgba(120, 190, 32, 0.1)' : 'rgba(120, 190, 32, 0.05)', border: '1px solid var(--color-secundario, #78BE20)' }}>
                  <h6 className="fw-bold mb-1 fs-6">{fechaSeleccionada.toLocaleDateString('es-CL', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</h6>
                  <p className="mb-0 fw-bold" style={{ color: 'var(--color-secundario, #78BE20)' }}>
                    {citasDelDiaText.length > 0 ? `🎯 Tienes ${citasDelDiaText.length} cita(s) para este día.` : '✨ Día libre, no hay citas programadas.'}
                  </p>
                </div>
              </Col>
            </Row>
          </div>
        </Col>

        {/* COLUMNA 3: Avisos Laterales y Participantes */}
        <Col lg={3} className="d-flex flex-column gap-4 animate-up delay-3">
          <div className="panel-card d-flex flex-column h-100">
            
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h5 className="fw-bold mb-0" style={{ color: 'var(--color-principal, #006A38)' }}>Muro de Avisos</h5>
              <Button variant="link" className="p-0 text-decoration-none small fw-bold" onClick={() => navigate('/panel-estudiante/informacion')}>Ver Todos</Button>
            </div>
            
            <div className="mb-4">
              {avisosVisibles.length === 0 ? (
                <p className="text-muted small text-center">No tienes avisos en el muro.</p>
              ) : (
                avisosVisibles.map((aviso) => {
                  const estilos = getEstiloAvisoDinámico(aviso.categoria);
                  return (
                    <div 
                      key={aviso.id} 
                      className="shadow-sm mb-3 overflow-hidden position-relative" 
                      style={{ 
                        borderRadius: '12px', borderLeft: estilos.borderLeft, background: estilos.background,
                        transition: 'transform 0.2s ease, box-shadow 0.2s ease'
                      }}
                      onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 6px 12px rgba(0,0,0,0.1)'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none'; }}
                    >
                      <div className={`px-3 py-1 fw-bold text-${estilos.headerText} d-flex justify-content-between align-items-center text-uppercase`} style={{ backgroundColor: estilos.headerBg, fontSize: '0.8rem' }}>
                        <span>{estilos.icon} {aviso.categoria}</span>
                        <div className="d-flex gap-2">
                           <span style={{ cursor: 'pointer' }} onClick={(e) => handleOcultarAviso(e, aviso.id)} title="Ocultar del muro">👁️</span>
                           <span style={{ cursor: 'pointer' }} onClick={(e) => handleEliminarAviso(e, aviso.id)} title="Borrar aviso">🗑️</span>
                        </div>
                      </div>
                      <div className="p-3" style={{ cursor: 'pointer' }} onClick={() => { setAvisoSeleccionado(aviso); setShowAvisoModal(true); }}>
                        <h6 className="fw-bolder mb-1" style={{ fontSize: '0.95rem', color: isDarkMode ? '#f8fafc' : '#212529' }}>{aviso.titulo}</h6>
                        <p className="small mb-2 mt-2 text-truncate" style={{ color: isDarkMode ? '#94a3b8' : '#6c757d' }}>{aviso.descripcion_corta}</p>
                        <div className="text-end">
                          <span className="small fw-bold" style={{ color: estilos.headerBg === '#ffc107' || estilos.headerBg === '#0dcaf0' ? (isDarkMode ? '#ffc107' : '#000') : estilos.headerBg }}>
                            Abrir completo &rarr;
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            <h5 className="fw-bold mb-3 mt-auto" style={{ color: 'var(--color-principal, #006A38)' }}>Usuarios del Sistema</h5>
            <div className="participantes-list flex-grow-1 overflow-auto" style={{ maxHeight: '200px' }}>
              {participantes.length === 0 ? (
                <p className="text-muted small text-center mt-4">No hay otros usuarios registrados aún.</p>
              ) : (
                participantes.map(p => {
                  const isOnline = usuariosOnline && usuariosOnline.includes(p.id);
                  return (
                    <div key={p.id} className="participante-item d-flex flex-column align-items-start gap-1 p-2 border-bottom" style={{ borderColor: isDarkMode ? '#333' : '#eee' }}>
                      <div className="w-100 d-flex justify-content-between align-items-center">
                        <span className="fw-bold text-truncate" style={{ fontSize: '0.90rem', color: isDarkMode ? '#e2e8f0' : '#333', maxWidth: '130px' }}>
                          {p.nombre}
                        </span>
                        <Badge bg={getRoleBadgeColor(p.rol)} className="px-2 py-1 rounded-pill text-capitalize" style={{ fontSize: '0.65rem' }}>
                          {p.rol || 'Estudiante'}
                        </Badge>
                      </div>
                      <span className="text-muted fw-medium" style={{ fontSize: '0.70rem' }}>
                        {isOnline ? '🟢 En línea' : `⚪ Offline / Últ. vez: ${formatearFecha(p.created_at)}`}
                      </span>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </Col>
      </Row>

      {/* Modal Aviso Completo */}
      <Modal show={showAvisoModal} onHide={() => setShowAvisoModal(false)} centered size="lg">
        {avisoSeleccionado && (() => {
          const estilos = getEstiloAvisoDinámico(avisoSeleccionado.categoria);
          return (
            <>
              <Modal.Header closeButton style={{ backgroundColor: estilos.headerBg, color: estilos.headerText === 'dark' ? '#000' : '#fff' }}>
                <Modal.Title className="fw-bold fs-5 text-uppercase">
                  {estilos.icon} Aviso {avisoSeleccionado.categoria}
                </Modal.Title>
              </Modal.Header>
              <Modal.Body className="p-4" style={{ backgroundColor: isDarkMode ? '#1e1e1e' : '#fff', color: isDarkMode ? '#fff' : '#000' }}>
                <h4 className="fw-bolder mb-3">{avisoSeleccionado.titulo}</h4>
                <div className="text-muted small fw-bold mb-3">
                  Publicado el {new Date(avisoSeleccionado.fecha_publicacion || avisoSeleccionado.created_at).toLocaleDateString('es-CL')}
                </div>
                <p className="fw-semibold mb-4" style={{ fontSize: '1.05rem' }}>{avisoSeleccionado.descripcion_corta}</p>
                {avisoSeleccionado.contenido_completo && (
                  <>
                    <hr className={isDarkMode ? 'border-secondary' : ''} />
                    <p className="mt-3" style={{ whiteSpace: 'pre-wrap', lineHeight: '1.6' }}>{avisoSeleccionado.contenido_completo}</p>
                  </>
                )}
              </Modal.Body>
              <Modal.Footer style={{ backgroundColor: isDarkMode ? '#1e1e1e' : '#fff', borderTop: isDarkMode ? '1px solid #333' : '1px solid #dee2e6' }}>
                <Button variant={isDarkMode ? "outline-light" : "outline-secondary"} onClick={() => setShowAvisoModal(false)}>Cerrar</Button>
              </Modal.Footer>
            </>
          );
        })()}
      </Modal>

      {/* Modal Enviar Mensaje a Soporte */}
      <Modal show={showSupportModal} onHide={() => setShowSupportModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title className="fw-bold text-danger">✉️ Contactar a Soporte TI</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSendSupport}>
            <p className="text-muted small mb-3">Si experimentas problemas técnicos con la plataforma, describe tu situación y soporte lo revisará a la brevedad.</p>
            <Form.Group className="mb-3">
              <Form.Label className="fw-bold small">Asunto / Problema principal</Form.Label>
              <Form.Control type="text" required value={supportData.asunto} onChange={(e) => setSupportData({...supportData, asunto: e.target.value})} placeholder="Ej: No puedo abrir una ficha, Error de conexión..." />
            </Form.Group>
            <Form.Group className="mb-4">
              <Form.Label className="fw-bold small">Detalles del problema</Form.Label>
              <Form.Control as="textarea" rows={4} required value={supportData.mensaje} onChange={(e) => setSupportData({...supportData, mensaje: e.target.value})} placeholder="Explica detalladamente lo que ocurre..." />
            </Form.Group>
            <div className="d-flex justify-content-end gap-2">
              <Button variant="outline-secondary" onClick={() => setShowSupportModal(false)} disabled={sendingSupport}>Cancelar</Button>
              <Button type="submit" variant="danger" className="fw-bold" disabled={sendingSupport}>
                {sendingSupport ? <Spinner animation="border" size="sm" /> : 'Enviar a Bandeja de Soporte'}
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>

      {/* Modal Recordatorio Citas */}
      <Modal show={showRecordatorioModal} onHide={() => setShowRecordatorioModal(false)} centered>
        <Modal.Header closeButton style={{ backgroundColor: 'var(--color-principal)', color: 'white' }}>
          <Modal.Title className="fw-bold fs-5">📅 Recordatorio de Citas</Modal.Title>
        </Modal.Header>
        <Modal.Body className={isDarkMode ? 'bg-dark text-white' : 'bg-white text-dark'}>
          <p className="fw-semibold mb-4 text-center">
            Tienes {citasDelDiaSeleccionado.length} cita(s) agendada(s) para este día.
          </p>
          <div className="d-flex flex-column gap-3">
            {citasDelDiaSeleccionado.map((cita) => (
              <div key={cita.id} className="p-3 rounded-4 border shadow-sm" style={{ backgroundColor: isDarkMode ? '#1e293b' : '#f8f9fa' }}>
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <span className="fw-bold fs-5 text-primary">⏰ {cita.hora_cita?.substring(0, 5)} hrs</span>
                  <Badge bg="warning" text="dark">{cita.estado}</Badge>
                </div>
                <h6 className="fw-bold mb-1">{cita.nombre}</h6>
                <p className="small text-muted mb-0">RUT: {cita.rut}</p>
              </div>
            ))}
          </div>
        </Modal.Body>
        <Modal.Footer className="border-0">
          <Button variant="outline-secondary" className="w-100 fw-bold" onClick={() => setShowRecordatorioModal(false)}>
            Cerrar Recordatorio
          </Button>
        </Modal.Footer>
      </Modal>

    </div>
  );
};

export default PanelEstudiante;